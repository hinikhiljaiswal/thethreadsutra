import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { omsOrders, omsSkuMappings, type OmsOrderRow, type OmsOrderStatus, type OmsSkuMapping, type OmsWave } from './seed-oms';

type SkuMappingFilters = {
  query?: string;
  marketplace?: string;
  brand?: string;
  category?: string;
  barcode?: string;
};

type OrderFilters = {
  query?: string;
  channel?: string;
  status?: string;
};

type UpdateOrderStatusPayload = {
  ids?: string[];
  status?: OmsOrderStatus;
  query?: string;
  channel?: string;
};

type GenerateWavePayload = {
  zone?: string;
  picklistType?: string;
  minQty?: string;
  maxQty?: string;
  orderProcessing?: string;
  waveDescription?: string;
  channel?: string;
  orderType?: string;
  brand?: string;
  orderStatus?: string;
  skuCode?: string;
};

@Injectable()
export class OmsService {
  private skuMappings: OmsSkuMapping[] = [...omsSkuMappings];
  private orders: OmsOrderRow[] = [...omsOrders];
  private waves: OmsWave[] = [];
  private readonly requiredFields: Array<{ key: keyof OmsSkuMapping; label: string }> = [
    { key: 'barcode', label: 'Bar Code' },
    { key: 'marketPlace', label: 'Market Place' },
    { key: 'brand', label: 'Brand' },
    { key: 'sellerSku', label: 'Seller SKU' },
    { key: 'masterSku', label: 'Master SKU' },
    { key: 'category', label: 'Category' }
  ];

  findSkuMappings(filters: SkuMappingFilters) {
    const query = filters.query?.trim().toLowerCase();
    const marketplace = filters.marketplace?.trim().toLowerCase();
    const brand = filters.brand?.trim().toLowerCase();
    const category = filters.category?.trim().toLowerCase();
    const barcode = filters.barcode?.trim().toLowerCase();

    return this.skuMappings.filter((item) => {
      const searchableValues = Object.values(item).map((value) => String(value).toLowerCase());
      const matchesMarketplace = !marketplace || marketplace === 'all' || item.marketPlace.toLowerCase() === marketplace;
      const matchesBrand = !brand || brand === 'all' || item.brand.toLowerCase() === brand;
      const matchesCategory = !category || category === 'all' || item.category.toLowerCase() === category;
      const matchesBarcode = !barcode || barcode === 'all' || item.barcode.toLowerCase() === barcode;
      const matchesQuery =
        !query ||
        searchableValues.some((value) => value.includes(query));

      return matchesMarketplace && matchesBrand && matchesCategory && matchesBarcode && matchesQuery;
    });
  }

  findOne(id: string) {
    return this.findById(id);
  }

  findOrders(filters: OrderFilters) {
    const query = filters.query?.trim().toLowerCase();
    const channel = filters.channel?.trim().toLowerCase();
    const status = filters.status?.trim().toLowerCase();

    return this.orders.filter((order) => {
      const matchesQuery = !query || Object.values(order).some((value) => String(value).toLowerCase().includes(query));
      const matchesChannel = !channel || channel === 'all' || order.channelName.toLowerCase() === channel;
      const matchesStatus = !status || status === 'all' || order.status.toLowerCase() === status;
      return matchesQuery && matchesChannel && matchesStatus;
    });
  }

  getOrderChannels() {
    return [...new Set(this.orders.map((order) => order.channelName))].sort();
  }

  updateOrderStatuses(payload: UpdateOrderStatusPayload) {
    const status = payload.status;

    if (!status || !this.isOrderStatus(status)) {
      throw new BadRequestException('Valid order status is required');
    }

    const targetOrders = Array.isArray(payload.ids) && payload.ids.length > 0
      ? this.orders.filter((order) => payload.ids?.includes(order.id))
      : this.findOrders({ query: payload.query, channel: payload.channel });

    if (targetOrders.length === 0) {
      throw new BadRequestException('No matching orders found');
    }

    const ids = new Set(targetOrders.map((order) => order.id));
    this.orders = this.orders.map((order) => (ids.has(order.id) ? { ...order, status } : order));

    return {
      count: ids.size,
      status,
      rows: this.orders.filter((order) => ids.has(order.id)),
      allRows: this.orders
    };
  }

  findWaves() {
    return this.waves;
  }

  generateWave(payload: GenerateWavePayload) {
    const zone = this.clean(payload.zone).toUpperCase();

    if (!zone) {
      throw new BadRequestException('Zone is required to generate a picklist');
    }

    const skuCodes = this.clean(payload.skuCode)
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const channel = this.clean(payload.channel).toLowerCase();
    const orderType = this.clean(payload.orderType).toLowerCase();
    const allowedStatuses = ['Accepted', 'Allocated'];

    const eligible = this.orders.filter((order) => {
      const matchesZone = order.zone.toLowerCase() === zone.toLowerCase();
      const matchesChannel = !channel || channel === 'all' || order.channelName.toLowerCase() === channel;
      const matchesOrderType = !orderType || orderType === '--- select ---' || order.orderType.toLowerCase() === orderType;
      const matchesSku = skuCodes.length === 0 || skuCodes.includes(order.skuCode.toLowerCase());
      const matchesStatus = allowedStatuses.includes(order.status);
      return matchesZone && matchesChannel && matchesOrderType && matchesSku && matchesStatus;
    });

    if (eligible.length === 0) {
      throw new BadRequestException('No accepted or allocated orders found for this wave filter');
    }

    const id = `WAVE-${String(this.waves.length + 1).padStart(4, '0')}`;
    const wave: OmsWave = {
      id,
      zone,
      picklistType: this.clean(payload.picklistType) || 'Full',
      orders: eligible.length,
      qty: eligible.reduce((total, order) => total + order.orderQty, 0),
      status: 'Generated',
      createdAt: new Date().toISOString(),
      filters: {
        minQty: this.clean(payload.minQty),
        maxQty: this.clean(payload.maxQty),
        orderProcessing: this.clean(payload.orderProcessing),
        waveDescription: this.clean(payload.waveDescription),
        channel: this.clean(payload.channel),
        orderType: this.clean(payload.orderType),
        brand: this.clean(payload.brand),
        orderStatus: this.clean(payload.orderStatus),
        skuCode: this.clean(payload.skuCode)
      }
    };

    const ids = new Set(eligible.map((order) => order.id));
    this.orders = this.orders.map((order) => (ids.has(order.id) ? { ...order, status: 'Picked' } : order));
    this.waves.unshift(wave);

    return {
      wave,
      updatedOrders: this.orders.filter((order) => ids.has(order.id)),
      allRows: this.orders,
      waves: this.waves
    };
  }

  getSummary() {
    const marketplaces = [...new Set(this.skuMappings.map((item) => item.marketPlace))].sort();
    const brands = [...new Set(this.skuMappings.map((item) => item.brand))].sort();
    const categories = [...new Set(this.skuMappings.map((item) => item.category))].sort();
    const barcodes = [...new Set(this.skuMappings.map((item) => item.barcode))].filter(Boolean).sort();
    const mappedCounts = marketplaces.reduce<Record<string, number>>((counts, marketplace) => {
      counts[marketplace.toLowerCase()] = this.skuMappings.filter((item) => item.marketPlace === marketplace).length;
      return counts;
    }, {});
    const barcodeCounts = barcodes.reduce<Record<string, number>>((counts, itemBarcode) => {
      counts[itemBarcode] = this.skuMappings.filter((item) => item.barcode === itemBarcode).length;
      return counts;
    }, {});

    return {
      masterSkus: new Set(this.skuMappings.map((item) => item.masterSku)).size,
      variants: this.skuMappings.length,
      colors: new Set(this.skuMappings.map((item) => item.barcode)).size,
      marketplaces,
      brands,
      categories,
      barcodes,
      mappedCounts,
      barcodeCounts,
      orders: {
        total: this.orders.length,
        pending: this.orders.filter((order) => order.status === 'Pending').length,
        accepted: this.orders.filter((order) => order.status === 'Accepted').length,
        allocated: this.orders.filter((order) => order.status === 'Allocated').length,
        picked: this.orders.filter((order) => order.status === 'Picked').length,
        shipped: this.orders.filter((order) => order.status === 'Shipped').length,
        rejected: this.orders.filter((order) => order.status === 'Rejected').length
      },
      waves: this.waves.length
    };
  }

  create(payload: Partial<OmsSkuMapping>) {
    const errors = this.validateMapping(payload);

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(', '));
    }

    if (this.findExistingMapping(payload)) {
      throw new BadRequestException('Duplicate OMS code already exists');
    }

    const mapping = this.toMapping(payload);
    this.skuMappings.unshift(mapping);
    return mapping;
  }

  bulkUpsert(payload: Partial<OmsSkuMapping>[] | { rows?: Partial<OmsSkuMapping>[] }) {
    const rows = Array.isArray(payload) ? payload : payload.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestException('Upload rows are required');
    }

    const saved: OmsSkuMapping[] = [];
    const errors: string[] = [];
    const seen = new Set<string>();

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      if (this.isEmptyRow(row)) {
        errors.push(`Row ${rowNumber}: empty row skipped`);
        return;
      }

      const validationErrors = this.validateMapping(row);
      if (validationErrors.length > 0) {
        errors.push(`Row ${rowNumber}: ${validationErrors.join(', ')}`);
        return;
      }

      const compositeKey = this.compositeKey(row);
      if (seen.has(compositeKey)) {
        errors.push(`Row ${rowNumber}: duplicate row in uploaded file`);
        return;
      }
      seen.add(compositeKey);

      const existing = this.findExistingMapping(row);

      if (existing) {
        saved.push(this.update(existing.id, row));
        return;
      }

      const mapping = this.toMapping(row);
      this.skuMappings.unshift(mapping);
      saved.push(mapping);
    });

    if (saved.length === 0) {
      throw new BadRequestException({
        message: 'No valid OMS rows found in uploaded file',
        errors
      });
    }

    return {
      count: saved.length,
      skipped: errors.length,
      rows: saved,
      errors
    };
  }

  update(id: string, payload: Partial<OmsSkuMapping>) {
    const mapping = this.findById(id);

    if (payload.barcode !== undefined) mapping.barcode = this.clean(payload.barcode);
    if (payload.marketPlace !== undefined) mapping.marketPlace = this.clean(payload.marketPlace);
    if (payload.brand !== undefined) mapping.brand = this.clean(payload.brand);
    if (payload.styleId !== undefined) mapping.styleId = this.clean(payload.styleId);
    if (payload.van !== undefined) mapping.van = this.clean(payload.van);
    if (payload.sellerSku !== undefined) mapping.sellerSku = this.clean(payload.sellerSku);
    if (payload.masterSku !== undefined) mapping.masterSku = this.clean(payload.masterSku);
    if (payload.skuCode !== undefined) mapping.skuCode = this.clean(payload.skuCode);
    if (payload.size !== undefined) mapping.size = this.clean(payload.size);
    if (payload.material !== undefined) mapping.material = this.clean(payload.material);
    if (payload.packOf !== undefined) mapping.packOf = Number(payload.packOf);
    if (payload.grouping !== undefined) mapping.grouping = this.clean(payload.grouping);
    if (payload.closure !== undefined) mapping.closure = this.clean(payload.closure);
    if (payload.style !== undefined) mapping.style = this.clean(payload.style);
    if (payload.productName !== undefined) mapping.productName = this.clean(payload.productName);
    if (payload.category !== undefined) mapping.category = this.clean(payload.category);

    return mapping;
  }

  remove(id: string) {
    const mapping = this.findById(id);
    this.skuMappings = this.skuMappings.filter((item) => item.id !== id);
    return { deleted: true, mapping };
  }

  private findById(id: string) {
    const mapping = this.skuMappings.find((item) => item.id === id);

    if (!mapping) {
      throw new NotFoundException('SKU mapping not found');
    }

    return mapping;
  }

  private clean(value: unknown) {
    return String(value ?? '').trim();
  }

  private isOrderStatus(value: string): value is OmsOrderStatus {
    return ['Pending', 'Accepted', 'Rejected', 'Allocated', 'Picked', 'Shipped'].includes(value);
  }

  private validateMapping(payload: Partial<OmsSkuMapping>) {
    const errors = this.requiredFields
      .filter((field) => !this.clean(payload[field.key]))
      .map((field) => `${field.label} is required`);
    const packOf = Number(payload.packOf ?? 1);

    if (!Number.isFinite(packOf) || packOf <= 0) {
      errors.push('Pack of must be greater than 0');
    }

    return errors;
  }

  private isEmptyRow(payload: Partial<OmsSkuMapping>) {
    return Object.values(payload).every((value) => !this.clean(value));
  }

  private toMapping(payload: Partial<OmsSkuMapping>): OmsSkuMapping {
    return {
      id: this.createUniqueId(payload.id || `${payload.barcode}-${payload.marketPlace}-${payload.brand}-${payload.sellerSku}`),
      barcode: this.clean(payload.barcode),
      marketPlace: this.clean(payload.marketPlace),
      brand: this.clean(payload.brand),
      styleId: this.clean(payload.styleId),
      van: this.clean(payload.van),
      sellerSku: this.clean(payload.sellerSku),
      masterSku: this.clean(payload.masterSku),
      skuCode: this.clean(payload.skuCode),
      size: this.clean(payload.size),
      material: this.clean(payload.material),
      packOf: Number(payload.packOf ?? 1),
      grouping: this.clean(payload.grouping),
      closure: this.clean(payload.closure),
      style: this.clean(payload.style),
      productName: this.clean(payload.productName),
      category: this.clean(payload.category)
    };
  }

  private compositeKey(payload: Partial<OmsSkuMapping>) {
    return [
      this.clean(payload.barcode).toLowerCase(),
      this.clean(payload.marketPlace).toLowerCase(),
      this.clean(payload.brand).toLowerCase(),
      this.clean(payload.sellerSku).toLowerCase()
    ].join('|');
  }

  private findExistingMapping(payload: Partial<OmsSkuMapping>) {
    const id = this.clean(payload.id);
    const barcode = this.clean(payload.barcode).toLowerCase();
    const marketplace = this.clean(payload.marketPlace).toLowerCase();
    const brand = this.clean(payload.brand).toLowerCase();
    const sellerSku = this.clean(payload.sellerSku).toLowerCase();
    const deterministicId = this.toBaseId(`${payload.barcode}-${payload.marketPlace}-${payload.brand}-${payload.sellerSku}`);

    return this.skuMappings.find((item) => {
      const sameComposite =
        Boolean(sellerSku) &&
        item.sellerSku.toLowerCase() === sellerSku &&
        item.marketPlace.toLowerCase() === marketplace &&
        item.brand.toLowerCase() === brand &&
        item.barcode.toLowerCase() === barcode;

      return item.id === id || item.id === deterministicId || sameComposite;
    });
  }

  private createUniqueId(value: string) {
    const baseId = this.toBaseId(value);
    let id = baseId;
    let suffix = 2;

    while (this.skuMappings.some((item) => item.id === id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    return id;
  }

  private toBaseId(value: string) {
    return (
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'sku-mapping'
    );
  }
}
