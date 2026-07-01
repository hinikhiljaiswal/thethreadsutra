import { BadRequestException, Injectable } from '@nestjs/common';

type FlipkartCredentials = {
  appId?: string;
  appSecret?: string;
  sellerId?: string;
  locationId?: string;
  accessToken?: string;
  tokenExpiresAt?: string | null;
};

const flipkartBaseUrl = 'https://api.flipkart.net';

@Injectable()
export class FlipkartService {
  private credentials: FlipkartCredentials = {
    appId: process.env.FLIPKART_API_KEY || process.env.FLIPKART_APP_ID,
    appSecret: process.env.FLIPKART_API_SECRET || process.env.FLIPKART_APP_SECRET,
    sellerId: process.env.FLIPKART_SELLER_ID,
    locationId: process.env.FLIPKART_LOCATION_ID
  };

  getProfile() {
    return {
      portal: 'Flipkart',
      companyName: 'DMILLS Global',
      sellerId: this.credentials.sellerId || null,
      locationId: this.credentials.locationId || null,
      configured: Boolean(this.credentials.appId && this.credentials.appSecret),
      tokenAvailable: Boolean(this.credentials.accessToken),
      tokenExpiresAt: this.credentials.tokenExpiresAt || null,
      appId: this.credentials.appId ? this.mask(this.credentials.appId) : null,
      capabilities: [
        'OAuth client credentials token',
        'Fetch listings by seller SKU',
        'Update listing inventory',
        'Filter shipments for order fulfillment'
      ],
      productionBaseUrl: flipkartBaseUrl
    };
  }

  saveCredentials(payload: { appId?: string; appSecret?: string; sellerId?: string; locationId?: string }) {
    this.credentials = {
      ...this.credentials,
      appId: payload.appId?.trim() || this.credentials.appId,
      appSecret: payload.appSecret?.trim() || this.credentials.appSecret,
      sellerId: payload.sellerId?.trim() || this.credentials.sellerId,
      locationId: payload.locationId?.trim() || this.credentials.locationId
    };

    return this.getProfile();
  }

  async generateAccessToken() {
    this.assertCredentials();
    const credentials = Buffer.from(`${this.credentials.appId}:${this.credentials.appSecret}`).toString('base64');
    const response = await fetch(`${flipkartBaseUrl}/oauth-service/oauth/token?grant_type=client_credentials&scope=Seller_Api`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`
      }
    });
    const data = await this.parseResponse(response);

    if (!response.ok) {
      return {
        ok: false,
        portal: 'Flipkart',
        companyName: 'DMILLS Global',
        status: response.status,
        data
      };
    }

    const expiresIn = Number(data.expires_in ?? 0);
    this.credentials.accessToken = String(data.access_token ?? '');
    this.credentials.tokenExpiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    return {
      ok: true,
      portal: 'Flipkart',
      companyName: 'DMILLS Global',
      tokenType: data.token_type,
      scope: data.scope,
      tokenExpiresAt: this.credentials.tokenExpiresAt
    };
  }

  async fetchListings(skus: string[] | string | undefined) {
    const skuList = this.normalizeSkus(skus);
    const data = await this.flipkartRequest(`/listings/v3/${encodeURIComponent(skuList.join(','))}`, {
      method: 'GET'
    });
    return {
      portal: 'Flipkart',
      companyName: 'DMILLS Global',
      request: { skus: skuList },
      ...data
    };
  }

  async updateInventory(payload: { sku?: string; productId?: string; locationId?: string; inventory?: number }) {
    const sku = payload.sku?.trim();
    const productId = payload.productId?.trim();
    const locationId = payload.locationId?.trim() || this.credentials.locationId;

    if (!sku || !productId || !locationId) {
      throw new BadRequestException('sku, productId and locationId are required');
    }

    const body = {
      [sku]: {
        product_id: productId,
        locations: [
          {
            id: locationId,
            inventory: Number(payload.inventory ?? 0)
          }
        ]
      }
    };

    const data = await this.flipkartRequest('/listings/v3/update/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body)
    });

    return {
      portal: 'Flipkart',
      companyName: 'DMILLS Global',
      request: body,
      ...data
    };
  }

  async filterShipments(payload: Record<string, unknown>) {
    const data = await this.flipkartRequest('/v3/shipments/filter/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload ?? {})
    });

    return {
      portal: 'Flipkart',
      companyName: 'DMILLS Global',
      request: payload,
      ...data
    };
  }

  private async flipkartRequest(path: string, init: RequestInit) {
    await this.ensureAccessToken();
    const response = await fetch(`${flipkartBaseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.credentials.accessToken}`,
        ...(init.headers ?? {})
      }
    });
    const data = await this.parseResponse(response);
    return {
      ok: response.ok,
      status: response.status,
      data
    };
  }

  private async ensureAccessToken() {
    if (this.credentials.accessToken && this.credentials.tokenExpiresAt && new Date(this.credentials.tokenExpiresAt).getTime() > Date.now() + 60000) {
      return;
    }

    await this.generateAccessToken();
  }

  private assertCredentials() {
    if (!this.credentials.appId || !this.credentials.appSecret) {
      throw new BadRequestException('Flipkart API key and API secret are required. Configure them in the portal screen or environment variables.');
    }
  }

  private normalizeSkus(skus: string[] | string | undefined) {
    const skuList = Array.isArray(skus)
      ? skus
      : String(skus || '')
          .split(',')
          .map((sku) => sku.trim());
    const filtered = skuList.map((sku) => sku.trim()).filter(Boolean);

    if (filtered.length === 0) {
      throw new BadRequestException('At least one SKU is required');
    }

    if (filtered.length > 10) {
      throw new BadRequestException('Flipkart listing fetch supports maximum 10 SKUs per request');
    }

    return filtered;
  }

  private async parseResponse(response: Response) {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  private mask(value: string) {
    if (value.length <= 4) return '****';
    return `${value.slice(0, 2)}${'*'.repeat(Math.max(value.length - 4, 4))}${value.slice(-2)}`;
  }
}
