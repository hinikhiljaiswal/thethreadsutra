import { BadRequestException, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { omsOrders, omsSkuMappings, type OmsOrderRow, type OmsOrderStatus, type OmsSkuMapping, type OmsWave } from './seed-oms';
import { OmsAuditEventModel, OmsOrderModel, OmsSkuMappingModel, OmsWaveModel } from './schemas/oms.schema';

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

type LoginPayload = {
  username?: string;
  password?: string;
};

@Injectable()
export class OmsService {
  private skuMappings: OmsSkuMapping[] = [...omsSkuMappings];
  private orders: OmsOrderRow[] = [...omsOrders];
  private waves: OmsWave[] = [];
  private readonly allowedTransitions: Record<OmsOrderStatus, OmsOrderStatus[]> = {
    Pending: ['Accepted', 'Rejected'],
    Accepted: ['Allocated', 'Rejected'],
    Rejected: ['Pending'],
    Allocated: ['Picked', 'Rejected'],
    Picked: ['Shipped', 'Allocated'],
    Shipped: []
  };
  private readonly requiredFields: Array<{ key: keyof OmsSkuMapping; label: string }> = [
    { key: 'barcode', label: 'Bar Code' },
    { key: 'marketPlace', label: 'Market Place' },
    { key: 'brand', label: 'Brand' },
    { key: 'sellerSku', label: 'Seller SKU' },
    { key: 'masterSku', label: 'Master SKU' },
    { key: 'category', label: 'Category' }
  ];

  constructor(
    @Optional() @InjectModel(OmsSkuMappingModel.name) private readonly skuMappingModel?: Model<OmsSkuMappingModel>,
    @Optional() @InjectModel(OmsOrderModel.name) private readonly orderModel?: Model<OmsOrderModel>,
    @Optional() @InjectModel(OmsWaveModel.name) private readonly waveModel?: Model<OmsWaveModel>,
    @Optional() @InjectModel(OmsAuditEventModel.name) private readonly auditModel?: Model<OmsAuditEventModel>
  ) {}

  async login(payload: LoginPayload) {
    const username = this.clean(payload.username);
    const password = this.clean(payload.password);
    const expectedUser = process.env.OMS_DEMO_USER ?? 'ABCDnnn';
    const expectedPassword = process.env.OMS_DEMO_PASSWORD ?? 'ABCD@1122';

    if (username !== expectedUser || password !== expectedPassword) {
      throw new BadRequestException('Invalid OMS username or password');
    }

    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64url');
    await this.writeAudit('session', username, 'login', `${username} logged in`, {});

    return {
      token,
      user: {
        username,
        location: 'JX Karawaci',
        role: 'Warehouse Admin'
      }
    };
  }

  async findSkuMappings(filters: SkuMappingFilters) {
    await this.ensureSeeded();
    const query = filters.query?.trim().toLowerCase();
    const marketplace = filters.marketplace?.trim().toLowerCase();
    const brand = filters.brand?.trim().toLowerCase();
    const category = filters.category?.trim().toLowerCase();
    const barcode = filters.barcode?.trim().toLowerCase();
    const rows = await this.getSkuRows();

    return rows.filter((item) => {
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

  async findOne(id: string) {
    await this.ensureSeeded();
    return this.findById(id);
  }

  async findOrders(filters: OrderFilters) {
    await this.ensureSeeded();
    const query = filters.query?.trim().toLowerCase();
    const channel = filters.channel?.trim().toLowerCase();
    const status = filters.status?.trim().toLowerCase();
    const rows = await this.getOrderRows();

    return rows.filter((order) => {
      const matchesQuery = !query || Object.values(order).some((value) => String(value).toLowerCase().includes(query));
      const matchesChannel = !channel || channel === 'all' || order.channelName.toLowerCase() === channel;
      const matchesStatus = !status || status === 'all' || order.status.toLowerCase() === status;
      return matchesQuery && matchesChannel && matchesStatus;
    });
  }

  async getOrderChannels() {
    await this.ensureSeeded();
    const rows = await this.getOrderRows();
    return [...new Set(rows.map((order) => order.channelName))].sort();
  }

  async updateOrderStatuses(payload: UpdateOrderStatusPayload) {
    await this.ensureSeeded();
    const status = payload.status;

    if (!status || !this.isOrderStatus(status)) {
      throw new BadRequestException('Valid order status is required');
    }

    const rows = await this.getOrderRows();
    const targetOrders = Array.isArray(payload.ids) && payload.ids.length > 0
      ? rows.filter((order) => payload.ids?.includes(order.id))
      : await this.findOrders({ query: payload.query, channel: payload.channel });

    if (targetOrders.length === 0) {
      throw new BadRequestException('No matching orders found');
    }

    const invalid = targetOrders.filter((order) => !this.canTransition(order.status, status));

    if (invalid.length > 0) {
      throw new BadRequestException(
        `Invalid transition for ${invalid.slice(0, 3).map((order) => `${order.id} (${order.status} -> ${status})`).join(', ')}`
      );
    }

    const ids = new Set(targetOrders.map((order) => order.id));

    if (this.orderModel) {
      await this.orderModel.updateMany({ id: { $in: [...ids] } }, { $set: { status } });
    } else {
      this.orders = this.orders.map((order) => (ids.has(order.id) ? { ...order, status } : order));
    }

    await Promise.all([...ids].map((id) => this.writeAudit('order', id, `status:${status}`, `Order moved to ${status}`, { status })));
    const allRows = await this.getOrderRows();
    return {
      count: ids.size,
      status,
      rows: allRows.filter((order) => ids.has(order.id)),
      allRows
    };
  }

  async findWaves() {
    await this.ensureSeeded();
    return this.getWaveRows();
  }

  async generateWave(payload: GenerateWavePayload) {
    await this.ensureSeeded();
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

    const rows = await this.getOrderRows();
    const eligible = rows.filter((order) => {
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

    const existingWaves = await this.getWaveRows();
    const id = `WAVE-${String(existingWaves.length + 1).padStart(4, '0')}`;
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

    if (this.waveModel && this.orderModel) {
      await this.waveModel.create(wave);
      await this.orderModel.updateMany({ id: { $in: [...ids] } }, { $set: { status: 'Picked' } });
    } else {
      this.orders = this.orders.map((order) => (ids.has(order.id) ? { ...order, status: 'Picked' } : order));
      this.waves.unshift(wave);
    }

    await this.writeAudit('wave', id, 'wave:generated', `Wave ${id} generated`, { zone, orders: eligible.length });
    await Promise.all([...ids].map((orderId) => this.writeAudit('order', orderId, 'status:Picked', `Order added to ${id}`, { waveId: id })));
    const allRows = await this.getOrderRows();
    const waves = await this.getWaveRows();

    return {
      wave,
      updatedOrders: allRows.filter((order) => ids.has(order.id)),
      allRows,
      waves
    };
  }

  async getSummary() {
    await this.ensureSeeded();
    const skuRows = await this.getSkuRows();
    const orderRows = await this.getOrderRows();
    const waveRows = await this.getWaveRows();
    const marketplaces = [...new Set(skuRows.map((item) => item.marketPlace))].sort();
    const brands = [...new Set(skuRows.map((item) => item.brand))].sort();
    const categories = [...new Set(skuRows.map((item) => item.category))].sort();
    const barcodes = [...new Set(skuRows.map((item) => item.barcode))].filter(Boolean).sort();
    const mappedCounts = marketplaces.reduce<Record<string, number>>((counts, marketplace) => {
      counts[marketplace.toLowerCase()] = skuRows.filter((item) => item.marketPlace === marketplace).length;
      return counts;
    }, {});
    const barcodeCounts = barcodes.reduce<Record<string, number>>((counts, itemBarcode) => {
      counts[itemBarcode] = skuRows.filter((item) => item.barcode === itemBarcode).length;
      return counts;
    }, {});

    return {
      masterSkus: new Set(skuRows.map((item) => item.masterSku)).size,
      variants: skuRows.length,
      colors: new Set(skuRows.map((item) => item.barcode)).size,
      marketplaces,
      brands,
      categories,
      barcodes,
      mappedCounts,
      barcodeCounts,
      orders: {
        total: orderRows.length,
        pending: orderRows.filter((order) => order.status === 'Pending').length,
        accepted: orderRows.filter((order) => order.status === 'Accepted').length,
        allocated: orderRows.filter((order) => order.status === 'Allocated').length,
        picked: orderRows.filter((order) => order.status === 'Picked').length,
        shipped: orderRows.filter((order) => order.status === 'Shipped').length,
        rejected: orderRows.filter((order) => order.status === 'Rejected').length
      },
      waves: waveRows.length
    };
  }

  async create(payload: Partial<OmsSkuMapping>) {
    await this.ensureSeeded();
    const errors = this.validateMapping(payload);

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(', '));
    }

    if (await this.findExistingMapping(payload)) {
      throw new BadRequestException('Duplicate OMS code already exists');
    }

    const mapping = this.toMapping(payload);
    if (this.skuMappingModel) {
      await this.skuMappingModel.create(mapping);
    } else {
      this.skuMappings.unshift(mapping);
    }
    await this.writeAudit('skuMapping', mapping.id, 'sku:create', `${mapping.sellerSku} created`, { sellerSku: mapping.sellerSku });
    return mapping;
  }

  async bulkUpsert(payload: Partial<OmsSkuMapping>[] | { rows?: Partial<OmsSkuMapping>[] }) {
    await this.ensureSeeded();
    const rows = Array.isArray(payload) ? payload : payload.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      throw new BadRequestException('Upload rows are required');
    }

    const saved: OmsSkuMapping[] = [];
    const errors: string[] = [];
    const seen = new Set<string>();

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;

      if (this.isEmptyRow(row)) {
        errors.push(`Row ${rowNumber}: empty row skipped`);
        continue;
      }

      const validationErrors = this.validateMapping(row);
      if (validationErrors.length > 0) {
        errors.push(`Row ${rowNumber}: ${validationErrors.join(', ')}`);
        continue;
      }

      const compositeKey = this.compositeKey(row);
      if (seen.has(compositeKey)) {
        errors.push(`Row ${rowNumber}: duplicate row in uploaded file`);
        continue;
      }
      seen.add(compositeKey);

      const existing = await this.findExistingMapping(row);

      if (existing) {
        saved.push(await this.update(existing.id, row));
        continue;
      }

      const mapping = this.toMapping(row);
      if (this.skuMappingModel) {
        await this.skuMappingModel.create(mapping);
      } else {
        this.skuMappings.unshift(mapping);
      }
      await this.writeAudit('skuMapping', mapping.id, 'sku:bulk-create', `${mapping.sellerSku} uploaded`, { sellerSku: mapping.sellerSku });
      saved.push(mapping);
    }

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

  async update(id: string, payload: Partial<OmsSkuMapping>) {
    await this.ensureSeeded();
    const mapping = await this.findById(id);
    const updated = this.applyMappingPayload(mapping, payload);

    if (this.skuMappingModel) {
      await this.skuMappingModel.updateOne({ id }, { $set: updated });
    }

    await this.writeAudit('skuMapping', id, 'sku:update', `${updated.sellerSku} updated`, { sellerSku: updated.sellerSku });
    return updated;
  }

  async remove(id: string) {
    await this.ensureSeeded();
    const mapping = await this.findById(id);
    if (this.skuMappingModel) {
      await this.skuMappingModel.deleteOne({ id });
    } else {
      this.skuMappings = this.skuMappings.filter((item) => item.id !== id);
    }
    await this.writeAudit('skuMapping', id, 'sku:delete', `${mapping.sellerSku} deleted`, { sellerSku: mapping.sellerSku });
    return { deleted: true, mapping };
  }

  private async findById(id: string) {
    const rows = await this.getSkuRows();
    const mapping = rows.find((item) => item.id === id);

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

  private applyMappingPayload(mapping: OmsSkuMapping, payload: Partial<OmsSkuMapping>) {
    const updated = { ...mapping };

    if (payload.barcode !== undefined) updated.barcode = this.clean(payload.barcode);
    if (payload.marketPlace !== undefined) updated.marketPlace = this.clean(payload.marketPlace);
    if (payload.brand !== undefined) updated.brand = this.clean(payload.brand);
    if (payload.styleId !== undefined) updated.styleId = this.clean(payload.styleId);
    if (payload.van !== undefined) updated.van = this.clean(payload.van);
    if (payload.sellerSku !== undefined) updated.sellerSku = this.clean(payload.sellerSku);
    if (payload.masterSku !== undefined) updated.masterSku = this.clean(payload.masterSku);
    if (payload.skuCode !== undefined) updated.skuCode = this.clean(payload.skuCode);
    if (payload.size !== undefined) updated.size = this.clean(payload.size);
    if (payload.material !== undefined) updated.material = this.clean(payload.material);
    if (payload.packOf !== undefined) updated.packOf = Number(payload.packOf);
    if (payload.grouping !== undefined) updated.grouping = this.clean(payload.grouping);
    if (payload.closure !== undefined) updated.closure = this.clean(payload.closure);
    if (payload.style !== undefined) updated.style = this.clean(payload.style);
    if (payload.productName !== undefined) updated.productName = this.clean(payload.productName);
    if (payload.category !== undefined) updated.category = this.clean(payload.category);

    return updated;
  }

  private async findExistingMapping(payload: Partial<OmsSkuMapping>) {
    const id = this.clean(payload.id);
    const barcode = this.clean(payload.barcode).toLowerCase();
    const marketplace = this.clean(payload.marketPlace).toLowerCase();
    const brand = this.clean(payload.brand).toLowerCase();
    const sellerSku = this.clean(payload.sellerSku).toLowerCase();
    const deterministicId = this.toBaseId(`${payload.barcode}-${payload.marketPlace}-${payload.brand}-${payload.sellerSku}`);
    const rows = await this.getSkuRows();

    return rows.find((item) => {
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

  private async ensureSeeded() {
    if (!this.skuMappingModel || !this.orderModel) return;

    const [skuCount, orderCount] = await Promise.all([
      this.skuMappingModel.estimatedDocumentCount(),
      this.orderModel.estimatedDocumentCount()
    ]);

    if (skuCount === 0) {
      await this.skuMappingModel.insertMany(omsSkuMappings);
    }

    if (orderCount === 0) {
      await this.orderModel.insertMany(omsOrders);
    }
  }

  private async getSkuRows(): Promise<OmsSkuMapping[]> {
    if (!this.skuMappingModel) return this.skuMappings;
    const rows = await this.skuMappingModel.find().sort({ createdAt: -1 }).lean();
    return rows.map((row) => ({
      id: row.id,
      barcode: row.barcode,
      marketPlace: row.marketPlace,
      brand: row.brand,
      styleId: row.styleId,
      van: row.van,
      sellerSku: row.sellerSku,
      masterSku: row.masterSku,
      skuCode: row.skuCode,
      size: row.size,
      material: row.material,
      packOf: row.packOf,
      grouping: row.grouping,
      closure: row.closure,
      style: row.style,
      productName: row.productName,
      category: row.category
    }));
  }

  private async getOrderRows(): Promise<OmsOrderRow[]> {
    if (!this.orderModel) return this.orders;
    const rows = await this.orderModel.find().sort({ orderDate: -1 }).lean();
    return rows.map((row) => ({
      id: row.id,
      extOrderNo: row.extOrderNo,
      orderNo: row.orderNo,
      channelName: row.channelName,
      orderType: row.orderType,
      orderDate: row.orderDate,
      skuCode: row.skuCode,
      skuDesc: row.skuDesc,
      walkinLocation: row.walkinLocation,
      fulfillmentLocation: row.fulfillmentLocation,
      orderQty: row.orderQty,
      lineNo: row.lineNo,
      lineAmount: row.lineAmount,
      customer: row.customer,
      status: row.status,
      zone: row.zone,
      bin: row.bin
    }));
  }

  private async getWaveRows(): Promise<OmsWave[]> {
    if (!this.waveModel) return this.waves;
    const rows = await this.waveModel.find().sort({ createdAt: -1 }).lean();
    return rows.map((row) => ({
      id: row.id,
      zone: row.zone,
      picklistType: row.picklistType,
      orders: row.orders,
      qty: row.qty,
      status: row.status,
      createdAt: row.createdAt,
      filters: row.filters
    }));
  }

  private canTransition(from: OmsOrderStatus, to: OmsOrderStatus) {
    return from === to || this.allowedTransitions[from].includes(to);
  }

  private async writeAudit(
    entityType: 'order' | 'wave' | 'skuMapping' | 'session',
    entityId: string,
    action: string,
    message: string,
    details: Record<string, unknown>
  ) {
    const event = {
      entityType,
      entityId,
      action,
      message,
      actor: 'ABCDnnn',
      details
    };

    if (this.auditModel) {
      await this.auditModel.create(event);
    }
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
