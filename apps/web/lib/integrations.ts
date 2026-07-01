export type IntegrationCategory = 'web-stores' | 'marketplaces' | 'logistics' | 'tech';

export type Integration = {
  slug: string;
  name: string;
  category: IntegrationCategory;
  regions: string[];
  description: string;
  capabilities: string[];
  connected: boolean;
  status: string;
  syncCount: number;
  lastSyncAt: string | null;
};

export type IntegrationSummary = {
  total: number;
  connected: number;
  pending: number;
  marketplaces: number;
  logistics: number;
  regions: string[];
};

function getApiUrl() {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    const { hostname, protocol } = window.location;

    if (hostname.endsWith('.onrender.com')) {
      return 'https://thethreadsutra-api.onrender.com';
    }
  }

  return 'http://localhost:4000';
}

export const apiUrl = getApiUrl();

export const sampleSummary: IntegrationSummary = {
  total: 19,
  connected: 5,
  pending: 14,
  marketplaces: 10,
  logistics: 4,
  regions: ['India', 'SEA', 'MEA', 'Global']
};

export const sampleIntegrations: Integration[] = [
  {
    slug: 'amazon',
    name: 'Amazon',
    category: 'marketplaces',
    regions: ['India', 'Global', 'MEA'],
    description: 'Manage listings, pricing and order flow for Amazon channels.',
    capabilities: ['Listing publish', 'Price sync', 'Returns'],
    connected: true,
    status: 'Connected',
    syncCount: 428,
    lastSyncAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    slug: 'flipkart',
    name: 'Flipkart',
    category: 'marketplaces',
    regions: ['India'],
    description: 'Publish garment listings, monitor stock and import customer orders.',
    capabilities: ['Catalog listing', 'Inventory sync', 'Order import'],
    connected: true,
    status: 'Connected',
    syncCount: 316,
    lastSyncAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString()
  },
  {
    slug: 'myntra',
    name: 'Myntra',
    category: 'marketplaces',
    regions: ['India'],
    description: 'Connect fashion marketplace operations for size, color and return workflows.',
    capabilities: ['Fashion attributes', 'Return sync', 'Price sync'],
    connected: true,
    status: 'Connected',
    syncCount: 244,
    lastSyncAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    slug: 'blinkit',
    name: 'Blinkit',
    category: 'marketplaces',
    regions: ['India'],
    description: 'Prepare fast-moving basics and replenishment packs for quick commerce.',
    capabilities: ['Quick commerce', 'Dark store stock', 'Fast replenishment'],
    connected: false,
    status: 'Available',
    syncCount: 74,
    lastSyncAt: null
  },
  {
    slug: 'shiprocket',
    name: 'Shiprocket',
    category: 'logistics',
    regions: ['India'],
    description: 'Automate courier allocation and shipment tracking for marketplace orders.',
    capabilities: ['Courier allocation', 'Label generation', 'Tracking'],
    connected: false,
    status: 'Available',
    syncCount: 332,
    lastSyncAt: null
  },
  {
    slug: 'shopify',
    name: 'Shopify',
    category: 'web-stores',
    regions: ['Global', 'India'],
    description: 'Sync products, inventory and orders from an owned Shopify storefront.',
    capabilities: ['Catalog sync', 'Order import', 'Inventory push'],
    connected: false,
    status: 'Available',
    syncCount: 182,
    lastSyncAt: null
  }
];
