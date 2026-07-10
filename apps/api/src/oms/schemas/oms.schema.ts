import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { OmsOrderStatus } from '../seed-oms';

export type OmsSkuMappingDocument = HydratedDocument<OmsSkuMappingModel>;
export type OmsOrderDocument = HydratedDocument<OmsOrderModel>;
export type OmsWaveDocument = HydratedDocument<OmsWaveModel>;
export type OmsAuditEventDocument = HydratedDocument<OmsAuditEventModel>;

@Schema({ timestamps: true, collection: 'oms_sku_mappings' })
export class OmsSkuMappingModel {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true, index: true })
  barcode!: string;

  @Prop({ required: true, index: true })
  marketPlace!: string;

  @Prop({ required: true, index: true })
  brand!: string;

  @Prop({ default: '' })
  styleId!: string;

  @Prop({ default: '' })
  van!: string;

  @Prop({ required: true, index: true })
  sellerSku!: string;

  @Prop({ required: true, index: true })
  masterSku!: string;

  @Prop({ default: '' })
  skuCode!: string;

  @Prop({ default: '' })
  size!: string;

  @Prop({ default: '' })
  material!: string;

  @Prop({ default: 1 })
  packOf!: number;

  @Prop({ default: '' })
  grouping!: string;

  @Prop({ default: '' })
  closure!: string;

  @Prop({ default: '' })
  style!: string;

  @Prop({ default: '' })
  productName!: string;

  @Prop({ required: true, index: true })
  category!: string;
}

@Schema({ timestamps: true, collection: 'oms_orders' })
export class OmsOrderModel {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true, index: true })
  extOrderNo!: string;

  @Prop({ required: true, index: true })
  orderNo!: string;

  @Prop({ required: true, index: true })
  channelName!: string;

  @Prop({ required: true })
  orderType!: string;

  @Prop({ required: true })
  orderDate!: string;

  @Prop({ required: true, index: true })
  skuCode!: string;

  @Prop({ required: true })
  skuDesc!: string;

  @Prop({ required: true })
  walkinLocation!: string;

  @Prop({ required: true })
  fulfillmentLocation!: string;

  @Prop({ required: true })
  orderQty!: number;

  @Prop({ required: true })
  lineNo!: number;

  @Prop({ required: true })
  lineAmount!: number;

  @Prop({ required: true })
  customer!: string;

  @Prop({ required: true, index: true })
  status!: OmsOrderStatus;

  @Prop({ required: true, index: true })
  zone!: string;

  @Prop({ required: true })
  bin!: string;
}

@Schema({ timestamps: true, collection: 'oms_waves' })
export class OmsWaveModel {
  @Prop({ required: true, unique: true, index: true })
  id!: string;

  @Prop({ required: true, index: true })
  zone!: string;

  @Prop({ required: true })
  picklistType!: string;

  @Prop({ required: true })
  orders!: number;

  @Prop({ required: true })
  qty!: number;

  @Prop({ required: true, index: true })
  status!: 'Draft' | 'Generated' | 'Released';

  @Prop({ required: true })
  createdAt!: string;

  @Prop({ type: Object, default: {} })
  filters!: Record<string, string>;
}

@Schema({ timestamps: true, collection: 'oms_audit_events' })
export class OmsAuditEventModel {
  @Prop({ required: true, index: true })
  entityType!: 'order' | 'wave' | 'skuMapping' | 'session';

  @Prop({ required: true, index: true })
  entityId!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ required: true })
  actor!: string;

  @Prop({ type: Object, default: {} })
  details!: Record<string, unknown>;
}

export const OmsSkuMappingSchema = SchemaFactory.createForClass(OmsSkuMappingModel);
export const OmsOrderSchema = SchemaFactory.createForClass(OmsOrderModel);
export const OmsWaveSchema = SchemaFactory.createForClass(OmsWaveModel);
export const OmsAuditEventSchema = SchemaFactory.createForClass(OmsAuditEventModel);
