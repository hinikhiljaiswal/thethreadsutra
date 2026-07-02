import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { omsSkuMappings, type OmsSkuMapping } from './seed-oms';

type SkuMappingFilters = {
  query?: string;
  marketplace?: string;
  brand?: string;
  category?: string;
};

@Injectable()
export class OmsService {
  private skuMappings: OmsSkuMapping[] = [...omsSkuMappings];

  findSkuMappings(filters: SkuMappingFilters) {
    const query = filters.query?.trim().toLowerCase();
    const marketplace = filters.marketplace?.trim().toLowerCase();
    const brand = filters.brand?.trim().toLowerCase();
    const category = filters.category?.trim().toLowerCase();

    return this.skuMappings.filter((item) => {
      const searchableValues = Object.values(item).map((value) => String(value).toLowerCase());
      const matchesMarketplace = !marketplace || marketplace === 'all' || item.marketPlace.toLowerCase() === marketplace;
      const matchesBrand = !brand || brand === 'all' || item.brand.toLowerCase() === brand;
      const matchesCategory = !category || category === 'all' || item.category.toLowerCase() === category;
      const matchesQuery =
        !query ||
        searchableValues.some((value) => value.includes(query));

      return matchesMarketplace && matchesBrand && matchesCategory && matchesQuery;
    });
  }

  findOne(id: string) {
    return this.findById(id);
  }

  getSummary() {
    const marketplaces = [...new Set(this.skuMappings.map((item) => item.marketPlace))].sort();
    const brands = [...new Set(this.skuMappings.map((item) => item.brand))].sort();
    const categories = [...new Set(this.skuMappings.map((item) => item.category))].sort();
    const mappedCounts = marketplaces.reduce<Record<string, number>>((counts, marketplace) => {
      counts[marketplace.toLowerCase()] = this.skuMappings.filter((item) => item.marketPlace === marketplace).length;
      return counts;
    }, {});

    return {
      masterSkus: new Set(this.skuMappings.map((item) => item.masterSku)).size,
      variants: this.skuMappings.length,
      colors: new Set(this.skuMappings.map((item) => item.barcode)).size,
      marketplaces,
      brands,
      categories,
      mappedCounts
    };
  }

  create(payload: Partial<OmsSkuMapping>) {
    if (!payload.masterSku?.trim()) {
      throw new BadRequestException('Master SKU is required');
    }

    if (!payload.sellerSku?.trim()) {
      throw new BadRequestException('Seller SKU is required');
    }

    const mapping: OmsSkuMapping = {
      id: this.createUniqueId(payload.id || `${payload.marketPlace}-${payload.brand}-${payload.sellerSku}`),
      barcode: this.clean(payload.barcode),
      marketPlace: this.clean(payload.marketPlace || 'Flipkart'),
      brand: this.clean(payload.brand || 'Thread Sutra'),
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
      category: payload.category?.trim() || 'Uncategorized',
    };

    this.skuMappings.unshift(mapping);
    return mapping;
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

  private createUniqueId(value: string) {
    const baseId =
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'sku-mapping';
    let id = baseId;
    let suffix = 2;

    while (this.skuMappings.some((item) => item.id === id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }

    return id;
  }
}
