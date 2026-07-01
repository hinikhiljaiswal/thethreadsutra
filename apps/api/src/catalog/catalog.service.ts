import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schemas/product.schema';
import { seedProducts } from './seed-products';

type ProductFilters = {
  category?: string;
  channel?: string;
};

@Injectable()
export class CatalogService {
  constructor(@Optional() @InjectModel(Product.name) private readonly productModel?: Model<Product>) {}

  async findProducts(filters: ProductFilters) {
    const query: Record<string, unknown> = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.channel) {
      query['channels.name'] = filters.channel;
    }

    if (!this.productModel) {
      return seedProducts;
    }

    try {
      const products = await this.productModel.find(query).sort({ createdAt: -1 }).lean();
      return products.length > 0 ? products : seedProducts;
    } catch {
      return seedProducts;
    }
  }

  async findProductBySlug(slug: string) {
    let product: Product | null = null;

    if (!this.productModel) {
      const fallbackProduct = seedProducts.find((item) => item.slug === slug);

      if (!fallbackProduct) {
        throw new NotFoundException('Product not found');
      }

      return fallbackProduct;
    }

    try {
      product = await this.productModel.findOne({ slug }).lean();
    } catch {
      product = null;
    }

    const fallbackProduct = seedProducts.find((item) => item.slug === slug);

    if (!product && !fallbackProduct) {
      throw new NotFoundException('Product not found');
    }

    return product ?? fallbackProduct;
  }
}
