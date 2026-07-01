import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class MarketplaceChannel {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  stockStatus!: string;
}

const MarketplaceChannelSchema = SchemaFactory.createForClass(MarketplaceChannel);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ required: true })
  basePrice!: number;

  @Prop({ type: [String], default: [] })
  sizes!: string[];

  @Prop({ type: [String], default: [] })
  colors!: string[];

  @Prop({ type: [MarketplaceChannelSchema], default: [] })
  channels!: MarketplaceChannel[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
