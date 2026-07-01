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

export const integrationsSeed: Integration[] = [
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
  },
  {
    slug: 'woocommerce',
    name: 'WooCommerce',
    category: 'web-stores',
    regions: ['Global'],
    description: 'Connect WordPress commerce stores for apparel catalog and order routing.',
    capabilities: ['Product import', 'Stock update', 'Order routing'],
    connected: false,
    status: 'Available',
    syncCount: 96,
    lastSyncAt: null
  },
  {
    slug: 'amazon',
    name: 'Amazon',
    category: 'marketplaces',
    regions: ['India', 'Global', 'MEA'],
    description: 'Manage marketplace listings, pricing and order flow for Amazon channels.',
    capabilities: ['Listing publish', 'Price sync', 'Returns'],
    connected: false,
    status: 'Available',
    syncCount: 428,
    lastSyncAt: null
  },
  {
    slug: 'flipkart',
    name: 'Flipkart',
    category: 'marketplaces',
    regions: ['India'],
    description: 'Publish garment listings, monitor stock and import customer orders.',
    capabilities: ['Catalog listing', 'Inventory sync', 'Order import'],
    connected: false,
    status: 'Available',
    syncCount: 316,
    lastSyncAt: null
  },
  {
    slug: 'myntra',
    name: 'Myntra',
    category: 'marketplaces',
    regions: ['India'],
    description: 'Connect fashion marketplace operations for size, color and return workflows.',
    capabilities: ['Fashion attributes', 'Return sync', 'Price sync'],
    connected: false,
    status: 'Available',
    syncCount: 244,
    lastSyncAt: null
  },
  {
    slug: 'ajio',
    name: 'Ajio',
    category: 'marketplaces',
    regions: ['India'],
    description: 'Operate apparel listings across Ajio with unified product data.',
    capabilities: ['Listing publish', 'Catalog enrichment', 'Stock sync'],
    connected: false,
    status: 'Available',
    syncCount: 121,
    lastSyncAt: null
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
    slug: 'zepto',
    name: 'Zepto',
    category: 'marketplaces',
    regions: ['India'],
    description: 'Route selected garment basics into rapid delivery assortments.',
    capabilities: ['Assortment sync', 'Inventory push', 'Channel pricing'],
    connected: false,
    status: 'Available',
    syncCount: 59,
    lastSyncAt: null
  },
  {
    slug: 'swiggy-instamart',
    name: 'Swiggy Instamart',
    category: 'marketplaces',
    regions: ['India'],
    description: 'Sync essential apparel packs for quick-commerce discovery and fulfillment.',
    capabilities: ['Quick commerce', 'Stock visibility', 'Order import'],
    connected: false,
    status: 'Available',
    syncCount: 52,
    lastSyncAt: null
  },
  {
    slug: 'shopee',
    name: 'Shopee',
    category: 'marketplaces',
    regions: ['SEA', 'Global'],
    description: 'Expand fashion catalog sales across Southeast Asian marketplace channels.',
    capabilities: ['Cross-border listing', 'Order import', 'Pricing'],
    connected: false,
    status: 'Available',
    syncCount: 138,
    lastSyncAt: null
  },
  {
    slug: 'lazada',
    name: 'Lazada',
    category: 'marketplaces',
    regions: ['SEA'],
    description: 'Route product listings and regional order management into Lazada.',
    capabilities: ['Regional catalog', 'Order import', 'Fulfillment status'],
    connected: false,
    status: 'Available',
    syncCount: 113,
    lastSyncAt: null
  },
  {
    slug: 'noon',
    name: 'Noon',
    category: 'marketplaces',
    regions: ['MEA'],
    description: 'Launch apparel assortments into Middle East marketplace operations.',
    capabilities: ['Marketplace listing', 'Price sync', 'Order import'],
    connected: false,
    status: 'Available',
    syncCount: 89,
    lastSyncAt: null
  },
  {
    slug: 'delhivery',
    name: 'Delhivery',
    category: 'logistics',
    regions: ['India'],
    description: 'Book shipments, update tracking and manage returns for Indian orders.',
    capabilities: ['Shipping labels', 'Tracking', 'Returns'],
    connected: false,
    status: 'Available',
    syncCount: 287,
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
    slug: 'xpressbees',
    name: 'Xpressbees',
    category: 'logistics',
    regions: ['India'],
    description: 'Connect delivery and reverse logistics for fashion marketplace orders.',
    capabilities: ['Forward shipment', 'Reverse pickup', 'Tracking'],
    connected: false,
    status: 'Available',
    syncCount: 154,
    lastSyncAt: null
  },
  {
    slug: 'dhl',
    name: 'DHL',
    category: 'logistics',
    regions: ['Global', 'MEA'],
    description: 'Support global parcel movement and cross-border shipping operations.',
    capabilities: ['International shipping', 'Tracking', 'Duties support'],
    connected: false,
    status: 'Available',
    syncCount: 78,
    lastSyncAt: null
  },
  {
    slug: 'tally',
    name: 'Tally',
    category: 'tech',
    regions: ['India'],
    description: 'Move sales, returns and payout data into accounting workflows.',
    capabilities: ['Accounting export', 'GST reports', 'Payout posting'],
    connected: false,
    status: 'Available',
    syncCount: 61,
    lastSyncAt: null
  },
  {
    slug: 'zoho-books',
    name: 'Zoho Books',
    category: 'tech',
    regions: ['India', 'Global'],
    description: 'Sync invoices and reconciliation records into finance operations.',
    capabilities: ['Invoice sync', 'Payment reconciliation', 'Tax reports'],
    connected: false,
    status: 'Available',
    syncCount: 47,
    lastSyncAt: null
  },
  {
    slug: 'sap',
    name: 'SAP',
    category: 'tech',
    regions: ['Global', 'MEA'],
    description: 'Connect enterprise inventory, finance and order data with ERP systems.',
    capabilities: ['ERP sync', 'Inventory ledger', 'Order export'],
    connected: false,
    status: 'Available',
    syncCount: 33,
    lastSyncAt: null
  }
];
