import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { integrationsSeed, type Integration, type IntegrationCategory } from './seed-integrations';

type Filters = {
  category?: string;
  region?: string;
  query?: string;
};

@Injectable()
export class IntegrationsService {
  private integrations: Integration[] = integrationsSeed.map((integration, index) => ({
    ...integration,
    connected: index < 5,
    status: index < 5 ? 'Connected' : integration.status,
    lastSyncAt: index < 5 ? new Date(Date.now() - (index + 1) * 36 * 60 * 60 * 1000).toISOString() : null
  }));

  findAll(filters: Filters) {
    const query = filters.query?.trim().toLowerCase();

    return this.integrations.filter((integration) => {
      const matchesCategory = !filters.category || filters.category === 'all' || integration.category === filters.category;
      const matchesRegion = !filters.region || filters.region === 'all' || integration.regions.includes(filters.region);
      const matchesQuery =
        !query ||
        integration.name.toLowerCase().includes(query) ||
        integration.description.toLowerCase().includes(query) ||
        integration.capabilities.some((capability) => capability.toLowerCase().includes(query));

      return matchesCategory && matchesRegion && matchesQuery;
    });
  }

  findOne(slug: string) {
    return this.findBySlug(slug);
  }

  getSummary() {
    const connected = this.integrations.filter((integration) => integration.connected).length;
    const marketplaces = this.integrations.filter((integration) => integration.category === 'marketplaces').length;
    const logistics = this.integrations.filter((integration) => integration.category === 'logistics').length;

    return {
      total: this.integrations.length,
      connected,
      pending: this.integrations.length - connected,
      marketplaces,
      logistics,
      regions: ['India', 'SEA', 'MEA', 'Global']
    };
  }

  setConnection(slug: string, connected: boolean) {
    const integration = this.findBySlug(slug);
    integration.connected = Boolean(connected);
    integration.status = connected ? 'Connected' : 'Available';
    integration.lastSyncAt = connected ? new Date().toISOString() : null;
    return integration;
  }

  sync(slug: string) {
    const integration = this.findBySlug(slug);

    if (!integration.connected) {
      integration.connected = true;
      integration.status = 'Connected';
    }

    integration.lastSyncAt = new Date().toISOString();
    integration.syncCount += 1;
    return integration;
  }

  create(payload: Partial<Integration>) {
    const name = payload.name?.trim();

    if (!name) {
      throw new BadRequestException('Integration name is required');
    }

    const slug = this.createUniqueSlug(payload.slug || name);
    const integration: Integration = {
      slug,
      name,
      category: this.normalizeCategory(payload.category),
      regions: this.normalizeList(payload.regions, ['India']),
      description: payload.description?.trim() || 'New integration channel ready for setup.',
      capabilities: this.normalizeList(payload.capabilities, ['Catalog sync']),
      connected: Boolean(payload.connected),
      status: payload.connected ? 'Connected' : payload.status || 'Available',
      syncCount: Number(payload.syncCount ?? 0),
      lastSyncAt: payload.connected ? payload.lastSyncAt || new Date().toISOString() : null
    };

    this.integrations.unshift(integration);
    return integration;
  }

  update(slug: string, payload: Partial<Integration>) {
    const integration = this.findBySlug(slug);

    if (payload.name !== undefined) integration.name = payload.name.trim() || integration.name;
    if (payload.category !== undefined) integration.category = this.normalizeCategory(payload.category);
    if (payload.regions !== undefined) integration.regions = this.normalizeList(payload.regions, integration.regions);
    if (payload.description !== undefined) integration.description = payload.description.trim();
    if (payload.capabilities !== undefined) integration.capabilities = this.normalizeList(payload.capabilities, integration.capabilities);
    if (payload.connected !== undefined) integration.connected = Boolean(payload.connected);
    if (payload.status !== undefined) integration.status = payload.status.trim() || integration.status;
    if (payload.syncCount !== undefined) integration.syncCount = Number(payload.syncCount);
    if (payload.lastSyncAt !== undefined) integration.lastSyncAt = payload.lastSyncAt;

    if (!integration.connected && integration.status === 'Connected') {
      integration.status = 'Available';
    }

    return integration;
  }

  remove(slug: string) {
    const integration = this.findBySlug(slug);
    this.integrations = this.integrations.filter((item) => item.slug !== slug);
    return { deleted: true, integration };
  }

  private findBySlug(slug: string) {
    const integration = this.integrations.find((item) => item.slug === slug);

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return integration;
  }

  private normalizeCategory(category?: string): IntegrationCategory {
    const validCategories: IntegrationCategory[] = ['web-stores', 'marketplaces', 'logistics', 'tech'];
    return validCategories.includes(category as IntegrationCategory) ? (category as IntegrationCategory) : 'marketplaces';
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

  private createUniqueSlug(value: string) {
    const baseSlug =
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'integration';
    let slug = baseSlug;
    let suffix = 2;

    while (this.integrations.some((item) => item.slug === slug)) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }
}
