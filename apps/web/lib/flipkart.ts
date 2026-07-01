export type FlipkartProfile = {
  portal: string;
  companyName: string;
  sellerId: string | null;
  locationId: string | null;
  configured: boolean;
  tokenAvailable: boolean;
  tokenExpiresAt: string | null;
  appId: string | null;
  capabilities: string[];
  productionBaseUrl: string;
};

export const sampleFlipkartProfile: FlipkartProfile = {
  portal: 'Flipkart',
  companyName: 'DMILLS Global',
  sellerId: null,
  locationId: null,
  configured: false,
  tokenAvailable: false,
  tokenExpiresAt: null,
  appId: null,
  capabilities: ['OAuth client credentials token', 'Fetch listings by seller SKU', 'Update listing inventory', 'Filter shipments for order fulfillment'],
  productionBaseUrl: 'https://api.flipkart.net'
};
