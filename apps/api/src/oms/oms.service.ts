import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { omsSkuMappings, type OmsSkuMapping } from './seed-oms';

type SkuMappingFilters = {
  query?: string;
  marketplace?: string;
};

@Injectable()
export class OmsService {
  private skuMappings: OmsSkuMapping[] = [...omsSkuMappings];

  findSkuMappings(filters: SkuMappingFilters) {
    const query = filters.query?.trim().toLowerCase();
    const marketplace = filters.marketplace?.trim().toLowerCase();

    return this.skuMappings.filter((item) => {
      const marketplaceValues = Object.entries(item.marketplaceSkus);
      const matchesMarketplace =
        !marketplace ||
        marketplace === 'all' ||
        marketplaceValues.some(([name, sku]) => name.toLowerCase() === marketplace && Boolean(sku));
      const matchesQuery =
        !query ||
        item.category.toLowerCase().includes(query) ||
        item.masterSku.toLowerCase().includes(query) ||
        item.color.toLowerCase().includes(query) ||
        item.colorCode.toLowerCase().includes(query) ||
        marketplaceValues.some(([, sku]) => sku.toLowerCase().includes(query));

      return matchesMarketplace && matchesQuery;
    });
  }

  findOne(id: string) {
    return this.findById(id);
  }

  getSummary() {
    const marketplaces = ['amazon', 'myntra', 'flipkart', 'ajio', 'meesho', 'snapdeal'];
    const mappedCounts = marketplaces.reduce<Record<string, number>>((counts, marketplace) => {
      counts[marketplace] = this.skuMappings.filter((item) => Boolean(item.marketplaceSkus[marketplace])).length;
      return counts;
    }, {});

    return {
      masterSkus: new Set(this.skuMappings.map((item) => item.masterSku)).size,
      variants: this.skuMappings.length,
      colors: new Set(this.skuMappings.map((item) => item.colorCode)).size,
      marketplaces,
      mappedCounts
    };
  }

  create(payload: Partial<OmsSkuMapping>) {
    if (!payload.masterSku?.trim()) {
      throw new BadRequestException('Master SKU is required');
    }

    if (!payload.colorCode?.trim()) {
      throw new BadRequestException('Color code is required');
    }

    const mapping: OmsSkuMapping = {
      id: this.createUniqueId(payload.id || `${payload.masterSku}-${payload.colorCode}`),
      category: payload.category?.trim() || 'Uncategorized',
      masterSku: payload.masterSku.trim().toUpperCase(),
      color: payload.color?.trim().toUpperCase() || payload.colorCode.trim().toUpperCase(),
      colorCode: payload.colorCode.trim().toUpperCase(),
      sizes: this.normalizeList(payload.sizes, ['S', 'M', 'L']),
      packOf: Number(payload.packOf ?? 1),
      marketplaceSkus: {
        amazon: '',
        myntra: '',
        flipkart: '',
        ajio: '',
        meesho: '',
        snapdeal: '',
        ...(payload.marketplaceSkus ?? {})
      }
    };

    this.skuMappings.unshift(mapping);
    return mapping;
  }

  update(id: string, payload: Partial<OmsSkuMapping>) {
    const mapping = this.findById(id);

    if (payload.category !== undefined) mapping.category = payload.category.trim();
    if (payload.masterSku !== undefined) mapping.masterSku = payload.masterSku.trim().toUpperCase();
    if (payload.color !== undefined) mapping.color = payload.color.trim().toUpperCase();
    if (payload.colorCode !== undefined) mapping.colorCode = payload.colorCode.trim().toUpperCase();
    if (payload.sizes !== undefined) mapping.sizes = this.normalizeList(payload.sizes, mapping.sizes);
    if (payload.packOf !== undefined) mapping.packOf = Number(payload.packOf);
    if (payload.marketplaceSkus !== undefined) {
      mapping.marketplaceSkus = {
        ...mapping.marketplaceSkus,
        ...payload.marketplaceSkus
      };
    }

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

  private normalizeList(value: unknown, fallback: string[]) {
    if (Array.isArray(value)) {
      const items = value.map((item) => String(item).trim()).filter(Boolean);
      return items.length > 0 ? items : fallback;
    }

    if (typeof value === 'string') {
      const items = value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      return items.length > 0 ? items : fallback;
    }

    return fallback;
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
