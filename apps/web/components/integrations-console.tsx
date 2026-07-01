'use client';

import { Activity, CheckCircle2, Globe2, PackageCheck, Pencil, Plug, Plus, RefreshCw, Search, Trash2, Truck, X, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiUrl, sampleIntegrations, sampleSummary, type Integration, type IntegrationCategory, type IntegrationSummary } from '../lib/integrations';
import { sampleOmsMappings, sampleOmsSummary, type OmsSkuMapping, type OmsSummary } from '../lib/oms';
import { sampleFlipkartProfile, type FlipkartProfile } from '../lib/flipkart';

const categories: { id: IntegrationCategory | 'all'; label: string; icon: typeof Globe2 }[] = [
  { id: 'all', label: 'All', icon: Globe2 },
  { id: 'web-stores', label: 'Web Stores', icon: Plug },
  { id: 'marketplaces', label: 'Marketplaces', icon: PackageCheck },
  { id: 'logistics', label: '3PL & Logistics', icon: Truck },
  { id: 'tech', label: 'SaaS & Tech', icon: Activity }
];

const regions = ['all', 'India', 'SEA', 'MEA', 'Global'];
const marketplaceColumns = ['amazon', 'myntra', 'flipkart', 'ajio', 'meesho', 'snapdeal'];

const emptyIntegrationForm = {
  name: '',
  category: 'marketplaces' as IntegrationCategory,
  regions: 'India',
  description: '',
  capabilities: 'Catalog sync'
};

const emptyOmsForm = {
  category: 'Camisole',
  masterSku: '',
  color: '',
  colorCode: '',
  sizes: 'S, M, L',
  packOf: '1',
  amazon: '',
  myntra: '',
  flipkart: '',
  ajio: '',
  meesho: '',
  snapdeal: ''
};

const emptyFlipkartCredentials = {
  appId: '',
  appSecret: '',
  sellerId: '',
  locationId: ''
};

const emptyInventoryForm = {
  sku: 'TS-CAMS-PM-BG-S',
  productId: '',
  locationId: '',
  inventory: '10'
};

function formatDate(value: string | null) {
  if (!value) {
    return 'Not synced yet';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function createSlug(value: string, existing: Integration[]) {
  const baseSlug =
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'integration';
  let slug = baseSlug;
  let suffix = 2;

  while (existing.some((item) => item.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function createMappingId(masterSku: string, colorCode: string, existing: OmsSkuMapping[]) {
  const baseId =
    `${masterSku}-${colorCode}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'sku-mapping';
  let id = baseId;
  let suffix = 2;

  while (existing.some((item) => item.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return id;
}

function buildIntegrationSummary(items: Integration[]): IntegrationSummary {
  return {
    total: items.length,
    connected: items.filter((item) => item.connected).length,
    pending: items.filter((item) => !item.connected).length,
    marketplaces: items.filter((item) => item.category === 'marketplaces').length,
    logistics: items.filter((item) => item.category === 'logistics').length,
    regions: ['India', 'SEA', 'MEA', 'Global']
  };
}

function buildOmsSummary(items: OmsSkuMapping[]): OmsSummary {
  const marketplaces = ['amazon', 'myntra', 'flipkart', 'ajio', 'meesho', 'snapdeal'];
  return {
    masterSkus: new Set(items.map((item) => item.masterSku)).size,
    variants: items.length,
    colors: new Set(items.map((item) => item.colorCode)).size,
    marketplaces,
    mappedCounts: marketplaces.reduce<Record<string, number>>((counts, marketplaceName) => {
      counts[marketplaceName] = items.filter((item) => Boolean(item.marketplaceSkus[marketplaceName])).length;
      return counts;
    }, {})
  };
}

export function IntegrationsConsole() {
  const [integrations, setIntegrations] = useState<Integration[]>(sampleIntegrations);
  const [summary, setSummary] = useState<IntegrationSummary>(sampleSummary);
  const [category, setCategory] = useState<IntegrationCategory | 'all'>('all');
  const [region, setRegion] = useState('all');
  const [query, setQuery] = useState('');
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [notice, setNotice] = useState('Ready to connect marketplace channels');
  const [omsMappings, setOmsMappings] = useState<OmsSkuMapping[]>(sampleOmsMappings);
  const [omsSummary, setOmsSummary] = useState<OmsSummary>(sampleOmsSummary);
  const [omsQuery, setOmsQuery] = useState('');
  const [marketplace, setMarketplace] = useState('all');
  const [integrationForm, setIntegrationForm] = useState(emptyIntegrationForm);
  const [editingIntegrationSlug, setEditingIntegrationSlug] = useState<string | null>(null);
  const [omsForm, setOmsForm] = useState(emptyOmsForm);
  const [editingOmsId, setEditingOmsId] = useState<string | null>(null);
  const [flipkartProfile, setFlipkartProfile] = useState<FlipkartProfile>(sampleFlipkartProfile);
  const [flipkartCredentials, setFlipkartCredentials] = useState(emptyFlipkartCredentials);
  const [flipkartSkuQuery, setFlipkartSkuQuery] = useState('TS-CAMS-PM-BG-S');
  const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm);
  const [shipmentFilter, setShipmentFilter] = useState('{"filter":{"type":"preDispatch","states":["APPROVED"]}}');
  const [flipkartResult, setFlipkartResult] = useState('No Flipkart request sent yet.');

  useEffect(() => {
    const storedIntegrations = readStorage('tts.integrations', sampleIntegrations);
    const storedOmsMappings = readStorage('tts.omsMappings', sampleOmsMappings);
    setIntegrations(storedIntegrations);
    setOmsMappings(storedOmsMappings);
    setSummary(buildIntegrationSummary(storedIntegrations));
    setOmsSummary(buildOmsSummary(storedOmsMappings));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (region !== 'all') params.set('region', region);
    if (query.trim()) params.set('q', query.trim());

    loadIntegrations(params);
  }, [category, region, query]);

  function loadIntegrations(params = new URLSearchParams()) {
    fetch(`${apiUrl}/api/integrations?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : sampleIntegrations))
      .then(setIntegrations)
      .catch(() => setIntegrations(readStorage('tts.integrations', sampleIntegrations)));
  }

  useEffect(() => {
    fetch(`${apiUrl}/api/integrations/summary`)
      .then((response) => (response.ok ? response.json() : sampleSummary))
      .then(setSummary)
      .catch(() => setSummary(buildIntegrationSummary(integrations)));
  }, [integrations]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (marketplace !== 'all') params.set('marketplace', marketplace);
    if (omsQuery.trim()) params.set('q', omsQuery.trim());

    loadOmsMappings(params);
  }, [marketplace, omsQuery]);

  function loadOmsMappings(params = new URLSearchParams()) {
    fetch(`${apiUrl}/api/oms/sku-mappings?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : sampleOmsMappings))
      .then(setOmsMappings)
      .catch(() => setOmsMappings(readStorage('tts.omsMappings', sampleOmsMappings)));
  }

  useEffect(() => {
    fetch(`${apiUrl}/api/oms/summary`)
      .then((response) => (response.ok ? response.json() : sampleOmsSummary))
      .then(setOmsSummary)
      .catch(() => setOmsSummary(buildOmsSummary(omsMappings)));
  }, []);

  useEffect(() => {
    fetch(`${apiUrl}/api/portals/flipkart/profile`)
      .then((response) => (response.ok ? response.json() : sampleFlipkartProfile))
      .then((profile) => {
        setFlipkartProfile(profile);
        setInventoryForm((form) => ({ ...form, locationId: profile.locationId ?? '' }));
      })
      .catch(() => setFlipkartProfile(sampleFlipkartProfile));
  }, []);

  const connectedCount = useMemo(() => integrations.filter((item) => item.connected).length, [integrations]);

  async function reloadSummaries() {
    fetch(`${apiUrl}/api/integrations/summary`)
      .then((response) => (response.ok ? response.json() : sampleSummary))
      .then(setSummary)
      .catch(() => setSummary(sampleSummary));
    fetch(`${apiUrl}/api/oms/summary`)
      .then((response) => (response.ok ? response.json() : sampleOmsSummary))
      .then(setOmsSummary)
      .catch(() => setOmsSummary(sampleOmsSummary));
  }

  function startEditIntegration(integration: Integration) {
    setEditingIntegrationSlug(integration.slug);
    setIntegrationForm({
      name: integration.name,
      category: integration.category,
      regions: integration.regions.join(', '),
      description: integration.description,
      capabilities: integration.capabilities.join(', ')
    });
    document.getElementById('integration-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function saveIntegration() {
    if (!integrationForm.name.trim()) {
      setNotice('Integration name is required');
      return;
    }

    const payload = {
      ...integrationForm,
      regions: integrationForm.regions.split(',').map((item) => item.trim()).filter(Boolean),
      capabilities: integrationForm.capabilities.split(',').map((item) => item.trim()).filter(Boolean)
    };
    const saveLocal = (serverSaved?: Integration) => {
      const saved: Integration =
        serverSaved ??
        ({
          slug: editingIntegrationSlug ?? createSlug(integrationForm.name, integrations),
          name: integrationForm.name.trim(),
          category: integrationForm.category,
          regions: payload.regions.length > 0 ? payload.regions : ['India'],
          description: integrationForm.description.trim() || 'New integration channel ready for setup.',
          capabilities: payload.capabilities.length > 0 ? payload.capabilities : ['Catalog sync'],
          connected: false,
          status: 'Available',
          syncCount: 0,
          lastSyncAt: null
        } satisfies Integration);

      setIntegrations((items) => {
        const nextItems = editingIntegrationSlug
          ? items.map((item) => (item.slug === editingIntegrationSlug ? saved : item))
          : [saved, ...items];
        writeStorage('tts.integrations', nextItems);
        setSummary(buildIntegrationSummary(nextItems));
        return nextItems;
      });
      setIntegrationForm(emptyIntegrationForm);
      setEditingIntegrationSlug(null);
      setNotice(`${saved.name} saved`);
    };

    try {
      const url = editingIntegrationSlug ? `${apiUrl}/api/integrations/${editingIntegrationSlug}` : `${apiUrl}/api/integrations`;
      const response = await fetch(url, {
        method: editingIntegrationSlug ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Could not save integration');
      }

      saveLocal((await response.json()) as Integration);
      reloadSummaries();
    } catch {
      saveLocal();
    }
  }

  async function deleteIntegration(slug: string) {
    const deleteLocal = () => {
      setIntegrations((items) => {
        const nextItems = items.filter((item) => item.slug !== slug);
        writeStorage('tts.integrations', nextItems);
        setSummary(buildIntegrationSummary(nextItems));
        return nextItems;
      });
    };

    try {
      const response = await fetch(`${apiUrl}/api/integrations/${slug}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete integration');
    } catch {
      // Local fallback keeps the UI fully editable when the API is offline.
    }

    deleteLocal();
    setNotice('Integration deleted');
    reloadSummaries();
  }

  function startEditOms(mapping: OmsSkuMapping) {
    setEditingOmsId(mapping.id);
    setOmsForm({
      category: mapping.category,
      masterSku: mapping.masterSku,
      color: mapping.color,
      colorCode: mapping.colorCode,
      sizes: mapping.sizes.join(', '),
      packOf: String(mapping.packOf),
      amazon: mapping.marketplaceSkus.amazon ?? '',
      myntra: mapping.marketplaceSkus.myntra ?? '',
      flipkart: mapping.marketplaceSkus.flipkart ?? '',
      ajio: mapping.marketplaceSkus.ajio ?? '',
      meesho: mapping.marketplaceSkus.meesho ?? '',
      snapdeal: mapping.marketplaceSkus.snapdeal ?? ''
    });
    document.getElementById('oms-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async function saveOmsMapping() {
    if (!omsForm.masterSku.trim() || !omsForm.colorCode.trim()) {
      setNotice('Master SKU and color code are required');
      return;
    }

    const marketplaceSkus = marketplaceColumns.reduce<Record<string, string>>((acc, item) => {
      acc[item] = omsForm[item as keyof typeof omsForm];
      return acc;
    }, {});
    const payload = {
      category: omsForm.category,
      masterSku: omsForm.masterSku,
      color: omsForm.color,
      colorCode: omsForm.colorCode,
      sizes: omsForm.sizes.split(',').map((item) => item.trim()).filter(Boolean),
      packOf: Number(omsForm.packOf || 1),
      marketplaceSkus
    };
    const saveLocal = (serverSaved?: OmsSkuMapping) => {
      const saved: OmsSkuMapping =
        serverSaved ??
        ({
          id: editingOmsId ?? createMappingId(omsForm.masterSku, omsForm.colorCode, omsMappings),
          ...payload,
          category: payload.category.trim() || 'Uncategorized',
          masterSku: payload.masterSku.trim().toUpperCase(),
          color: payload.color.trim().toUpperCase() || payload.colorCode.trim().toUpperCase(),
          colorCode: payload.colorCode.trim().toUpperCase()
        } satisfies OmsSkuMapping);

      setOmsMappings((items) => {
        const nextItems = editingOmsId ? items.map((item) => (item.id === editingOmsId ? saved : item)) : [saved, ...items];
        writeStorage('tts.omsMappings', nextItems);
        setOmsSummary(buildOmsSummary(nextItems));
        return nextItems;
      });
      setOmsForm(emptyOmsForm);
      setEditingOmsId(null);
      setNotice(`${saved.masterSku} ${saved.colorCode} saved`);
    };

    try {
      const url = editingOmsId ? `${apiUrl}/api/oms/sku-mappings/${editingOmsId}` : `${apiUrl}/api/oms/sku-mappings`;
      const response = await fetch(url, {
        method: editingOmsId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Could not save SKU mapping');
      }

      saveLocal((await response.json()) as OmsSkuMapping);
      reloadSummaries();
    } catch {
      saveLocal();
    }
  }

  async function deleteOmsMapping(id: string) {
    try {
      const response = await fetch(`${apiUrl}/api/oms/sku-mappings/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete SKU mapping');
    } catch {
      // Local fallback keeps the UI fully editable when the API is offline.
    }

    setOmsMappings((items) => {
      const nextItems = items.filter((item) => item.id !== id);
      writeStorage('tts.omsMappings', nextItems);
      setOmsSummary(buildOmsSummary(nextItems));
      return nextItems;
    });
    setNotice('SKU mapping deleted');
    reloadSummaries();
  }

  async function updateIntegration(slug: string, action: 'connect' | 'disconnect' | 'sync') {
    setActiveSlug(slug);
    const integration = integrations.find((item) => item.slug === slug);

    try {
      const response = await fetch(
        action === 'sync' ? `${apiUrl}/api/integrations/${slug}/sync` : `${apiUrl}/api/integrations/${slug}/connect`,
        {
          method: action === 'sync' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: action === 'sync' ? undefined : JSON.stringify({ connected: action === 'connect' })
        }
      );

      if (!response.ok) {
        throw new Error('Integration update failed');
      }

      const updated = (await response.json()) as Integration;
      setIntegrations((items) => {
        const nextItems = items.map((item) => (item.slug === slug ? updated : item));
        writeStorage('tts.integrations', nextItems);
        setSummary(buildIntegrationSummary(nextItems));
        return nextItems;
      });
      setNotice(`${updated.name} ${action === 'sync' ? 'synced' : updated.connected ? 'connected' : 'disconnected'} successfully`);
    } catch {
      setIntegrations((items) =>
        {
          const nextItems = items.map((item) => {
            if (item.slug !== slug) return item;
            const connected = action === 'disconnect' ? false : true;
            return {
              ...item,
              connected,
              status: connected ? 'Connected' : 'Available',
              lastSyncAt: connected ? new Date().toISOString() : null,
              syncCount: action === 'sync' ? item.syncCount + 1 : item.syncCount
            };
          });
          writeStorage('tts.integrations', nextItems);
          setSummary(buildIntegrationSummary(nextItems));
          return nextItems;
        }
      );
      setNotice(`${integration?.name ?? 'Integration'} updated locally`);
    } finally {
      setActiveSlug(null);
    }
  }

  async function saveFlipkartCredentials() {
    const response = await fetch(`${apiUrl}/api/portals/flipkart/credentials`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flipkartCredentials)
    });

    if (!response.ok) {
      setNotice('Could not save Flipkart credentials');
      return;
    }

    const profile = (await response.json()) as FlipkartProfile;
    setFlipkartProfile(profile);
    setInventoryForm((form) => ({ ...form, locationId: profile.locationId ?? form.locationId }));
    setFlipkartCredentials(emptyFlipkartCredentials);
    setNotice('Flipkart credentials saved for DMILLS Global');
  }

  async function runFlipkartAction(action: 'token' | 'listing' | 'inventory' | 'shipments') {
    const config =
      action === 'token'
        ? { url: `${apiUrl}/api/portals/flipkart/token`, body: undefined }
        : action === 'listing'
          ? { url: `${apiUrl}/api/portals/flipkart/listings/fetch`, body: { skus: flipkartSkuQuery } }
          : action === 'inventory'
            ? {
                url: `${apiUrl}/api/portals/flipkart/inventory`,
                body: {
                  ...inventoryForm,
                  inventory: Number(inventoryForm.inventory)
                }
              }
            : {
                url: `${apiUrl}/api/portals/flipkart/shipments/filter`,
                body: JSON.parse(shipmentFilter || '{}')
              };

    try {
      setFlipkartResult('Sending request to Flipkart...');
      const response = await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: config.body ? JSON.stringify(config.body) : undefined
      });
      const data = await response.json();
      setFlipkartResult(JSON.stringify(data, null, 2));
      setNotice(`Flipkart ${action} request completed`);
      if (action === 'token') {
        fetch(`${apiUrl}/api/portals/flipkart/profile`)
          .then((profileResponse) => (profileResponse.ok ? profileResponse.json() : sampleFlipkartProfile))
          .then(setFlipkartProfile)
          .catch(() => undefined);
      }
    } catch (error) {
      setFlipkartResult(error instanceof Error ? error.message : 'Flipkart request failed');
      setNotice('Flipkart request failed');
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-ink">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-2xl font-black">The Thread Sutra</p>
            <p className="text-sm text-black/55">Marketplace integrations console</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-md border border-black/10 bg-[#f3eee7] px-3 py-2 font-semibold">{summary.total} integrations</span>
            <span className="rounded-md border border-leaf/20 bg-leaf/10 px-3 py-2 font-semibold text-leaf">{summary.connected} connected</span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-7">
        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="rounded-lg border border-black/10 bg-white p-5">
            <p className="text-sm font-bold uppercase text-thread">Market in a box</p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl">Run every garment channel from one place.</h1>
            <p className="mt-4 leading-7 text-black/62">
              Connect web stores, online marketplaces, quick-commerce channels, logistics partners and finance tools for catalog, inventory,
              orders, shipping and reconciliation.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ['Live filters', `${integrations.length} visible`],
                ['Connected here', `${connectedCount} channels`],
                ['Marketplaces', `${summary.marketplaces} ready`],
                ['Logistics', `${summary.logistics} partners`]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-black/10 p-4">
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-1 text-sm text-black/55">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black">Integration command center</h2>
                <p className="mt-1 text-sm text-black/55">{notice}</p>
              </div>
              <div className="relative min-w-0 md:w-80">
                <Search className="pointer-events-none absolute left-3 top-3 text-black/40" size={18} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-11 w-full rounded-md border border-black/10 bg-[#fbfaf7] pl-10 pr-3 text-sm outline-none ring-thread/20 focus:ring-4"
                  placeholder="Search channel or capability"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => {
                const Icon = item.icon;
                const selected = category === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCategory(item.id)}
                    className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-bold ${
                      selected ? 'border-ink bg-ink text-white' : 'border-black/10 bg-white text-ink'
                    }`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {regions.map((item) => (
                <button
                  key={item}
                  onClick={() => setRegion(item)}
                  className={`h-9 shrink-0 rounded-md border px-3 text-sm font-bold ${
                    region === item ? 'border-thread bg-thread text-white' : 'border-black/10 bg-[#fbfaf7]'
                  }`}
                >
                  {item === 'all' ? 'All regions' : item}
                </button>
              ))}
            </div>

            <div id="integration-form" className="mt-5 rounded-md border border-black/10 bg-[#fbfaf7] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-black">{editingIntegrationSlug ? 'Edit integration' : 'Create integration'}</h3>
                {editingIntegrationSlug ? (
                  <button
                    onClick={() => {
                      setEditingIntegrationSlug(null);
                      setIntegrationForm(emptyIntegrationForm);
                    }}
                    className="inline-flex h-8 items-center gap-1 rounded-md border border-black/10 bg-white px-2 text-xs font-black"
                  >
                    <X size={14} /> Cancel
                  </button>
                ) : null}
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  value={integrationForm.name}
                  onChange={(event) => setIntegrationForm((form) => ({ ...form, name: event.target.value }))}
                  className="h-10 rounded-md border border-black/10 px-3 text-sm outline-none"
                  placeholder="Integration name"
                />
                <select
                  value={integrationForm.category}
                  onChange={(event) => setIntegrationForm((form) => ({ ...form, category: event.target.value as IntegrationCategory }))}
                  className="h-10 rounded-md border border-black/10 px-3 text-sm outline-none"
                >
                  {categories
                    .filter((item) => item.id !== 'all')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                </select>
                <input
                  value={integrationForm.regions}
                  onChange={(event) => setIntegrationForm((form) => ({ ...form, regions: event.target.value }))}
                  className="h-10 rounded-md border border-black/10 px-3 text-sm outline-none"
                  placeholder="Regions: India, Global"
                />
                <input
                  value={integrationForm.capabilities}
                  onChange={(event) => setIntegrationForm((form) => ({ ...form, capabilities: event.target.value }))}
                  className="h-10 rounded-md border border-black/10 px-3 text-sm outline-none"
                  placeholder="Capabilities: Catalog sync, Orders"
                />
                <input
                  value={integrationForm.description}
                  onChange={(event) => setIntegrationForm((form) => ({ ...form, description: event.target.value }))}
                  className="h-10 rounded-md border border-black/10 px-3 text-sm outline-none md:col-span-2"
                  placeholder="Description"
                />
              </div>
              <button
                onClick={saveIntegration}
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-black text-white"
              >
                <Plus size={16} />
                {editingIntegrationSlug ? 'Save integration' : 'Add integration'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {integrations.map((integration) => (
            <article key={integration.slug} className="flex min-h-[320px] flex-col rounded-lg border border-black/10 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase text-leaf">{integration.category.replace('-', ' ')}</p>
                  <h3 className="mt-2 text-2xl font-black">{integration.name}</h3>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-black ${
                    integration.connected ? 'bg-leaf/10 text-leaf' : 'bg-black/5 text-black/55'
                  }`}
                >
                  {integration.connected ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {integration.status}
                </span>
              </div>
              <p className="mt-4 flex-1 text-sm leading-6 text-black/62">{integration.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {integration.capabilities.map((capability) => (
                  <span key={capability} className="rounded-md bg-[#f3eee7] px-2.5 py-1 text-xs font-bold text-black/65">
                    {capability}
                  </span>
                ))}
              </div>
              <div className="mt-4 border-t border-black/10 pt-4 text-sm text-black/55">
                <p>
                  <span className="font-bold text-ink">Regions:</span> {integration.regions.join(', ')}
                </p>
                <p className="mt-1">
                  <span className="font-bold text-ink">Last sync:</span> {formatDate(integration.lastSyncAt)}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateIntegration(integration.slug, integration.connected ? 'disconnect' : 'connect')}
                  disabled={activeSlug === integration.slug}
                  className="h-10 rounded-md border border-black/15 bg-white text-sm font-black disabled:opacity-60"
                >
                  {integration.connected ? 'Disconnect' : 'Connect'}
                </button>
                <button
                  onClick={() => updateIntegration(integration.slug, 'sync')}
                  disabled={activeSlug === integration.slug}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-thread text-sm font-black text-white disabled:opacity-60"
                >
                  <RefreshCw size={15} className={activeSlug === integration.slug ? 'animate-spin' : ''} />
                  Sync
                </button>
                <button
                  onClick={() => startEditIntegration(integration)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-black/15 bg-white text-sm font-black"
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  onClick={() => deleteIntegration(integration.slug)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 text-sm font-black text-red-700"
                >
                  <Trash2 size={15} />
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-lg border border-black/10 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-thread">OMS sheet imported</p>
              <h2 className="mt-2 text-3xl font-black">Master SKU mapping</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-black/60">
                Client workbook data is now mapped into the order management layer: category, master SKU, color code, size set, pack count and
                marketplace-specific SKUs.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              {[
                ['Master SKUs', omsSummary.masterSkus],
                ['Variants', omsSummary.variants],
                ['Colors', omsSummary.colors]
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-black/10 bg-[#fbfaf7] px-4 py-3">
                  <p className="text-2xl font-black">{value}</p>
                  <p className="mt-1 text-xs font-bold text-black/50">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 text-black/40" size={18} />
              <input
                value={omsQuery}
                onChange={(event) => setOmsQuery(event.target.value)}
                className="h-11 w-full rounded-md border border-black/10 bg-[#fbfaf7] pl-10 pr-3 text-sm outline-none ring-thread/20 focus:ring-4"
                placeholder="Search SKU, color, marketplace SKU"
              />
            </div>
            <select
              value={marketplace}
              onChange={(event) => setMarketplace(event.target.value)}
              className="h-11 rounded-md border border-black/10 bg-[#fbfaf7] px-3 text-sm font-bold outline-none ring-thread/20 focus:ring-4"
            >
              <option value="all">All marketplaces</option>
              {omsSummary.marketplaces.map((item) => (
                <option key={item} value={item}>
                  {item.toUpperCase()} ({omsSummary.mappedCounts[item] ?? 0})
                </option>
              ))}
            </select>
          </div>

          <div id="oms-form" className="mt-5 rounded-md border border-black/10 bg-[#fbfaf7] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-black">{editingOmsId ? 'Edit SKU mapping' : 'Create SKU mapping'}</h3>
              {editingOmsId ? (
                <button
                  onClick={() => {
                    setEditingOmsId(null);
                    setOmsForm(emptyOmsForm);
                  }}
                  className="inline-flex h-8 items-center gap-1 rounded-md border border-black/10 bg-white px-2 text-xs font-black"
                >
                  <X size={14} /> Cancel
                </button>
              ) : null}
            </div>
            <div className="grid gap-2 md:grid-cols-4">
              {[
                ['category', 'Category'],
                ['masterSku', 'Master SKU'],
                ['color', 'Color'],
                ['colorCode', 'Color code'],
                ['sizes', 'Sizes'],
                ['packOf', 'Pack of'],
                ...marketplaceColumns.map((item) => [item, item.toUpperCase()])
              ].map(([key, label]) => (
                <input
                  key={key}
                  value={omsForm[key as keyof typeof omsForm]}
                  onChange={(event) => setOmsForm((form) => ({ ...form, [key]: event.target.value }))}
                  className="h-10 rounded-md border border-black/10 px-3 text-sm outline-none"
                  placeholder={label}
                />
              ))}
            </div>
            <button onClick={saveOmsMapping} className="mt-3 inline-flex h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-black text-white">
              <Plus size={16} />
              {editingOmsId ? 'Save mapping' : 'Add mapping'}
            </button>
          </div>

          <div className="mt-5 overflow-x-auto rounded-lg border border-black/10">
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead className="bg-[#f3eee7] text-xs uppercase text-black/55">
                <tr>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Master SKU</th>
                  <th className="px-4 py-3">Color</th>
                  <th className="px-4 py-3">Sizes</th>
                  <th className="px-4 py-3">Pack</th>
                  {omsSummary.marketplaces.map((item) => (
                    <th key={item} className="px-4 py-3">
                      {item}
                    </th>
                  ))}
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {omsMappings.map((item) => (
                  <tr key={item.id} className="border-t border-black/10">
                    <td className="px-4 py-3 font-bold">{item.category}</td>
                    <td className="px-4 py-3 font-black text-thread">{item.masterSku}</td>
                    <td className="px-4 py-3">
                      {item.color} <span className="text-black/45">({item.colorCode})</span>
                    </td>
                    <td className="px-4 py-3">{item.sizes.join(', ')}</td>
                    <td className="px-4 py-3">{item.packOf}</td>
                    {omsSummary.marketplaces.map((marketplaceName) => (
                      <td key={marketplaceName} className="max-w-[220px] px-4 py-3">
                        <span className={item.marketplaceSkus[marketplaceName] ? 'font-semibold text-ink' : 'text-black/30'}>
                          {item.marketplaceSkus[marketplaceName] || 'Not mapped'}
                        </span>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditOms(item)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-black/10 px-2 text-xs font-black"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteOmsMapping(item.id)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 text-xs font-black text-red-700"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-black/10 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-thread">Real portal integration</p>
              <h2 className="mt-2 text-3xl font-black">Flipkart - DMILLS Global</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-black/60">
                Configure Seller API credentials, generate OAuth tokens, fetch marketplace listings, update inventory and filter shipments from
                Flipkart production APIs.
              </p>
            </div>
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <span className={`rounded-md px-3 py-2 font-black ${flipkartProfile.configured ? 'bg-leaf/10 text-leaf' : 'bg-black/5 text-black/55'}`}>
                {flipkartProfile.configured ? 'Credentials configured' : 'Credentials pending'}
              </span>
              <span className={`rounded-md px-3 py-2 font-black ${flipkartProfile.tokenAvailable ? 'bg-leaf/10 text-leaf' : 'bg-black/5 text-black/55'}`}>
                {flipkartProfile.tokenAvailable ? 'Token available' : 'Token needed'}
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <div className="rounded-md border border-black/10 bg-[#fbfaf7] p-4">
                <h3 className="font-black">Credentials</h3>
                <p className="mt-1 text-xs text-black/50">Use Flipkart Seller Dashboard &gt; Manage Profile &gt; Developer Access.</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {[
                    ['appId', 'App ID'],
                    ['appSecret', 'App Secret'],
                    ['sellerId', 'Seller ID'],
                    ['locationId', 'Location ID']
                  ].map(([key, label]) => (
                    <input
                      key={key}
                      value={flipkartCredentials[key as keyof typeof flipkartCredentials]}
                      onChange={(event) => setFlipkartCredentials((form) => ({ ...form, [key]: event.target.value }))}
                      className="h-10 rounded-md border border-black/10 px-3 text-sm outline-none"
                      placeholder={label}
                      type={key === 'appSecret' ? 'password' : 'text'}
                    />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={saveFlipkartCredentials} className="h-10 rounded-md bg-ink px-4 text-sm font-black text-white">
                    Save credentials
                  </button>
                  <button onClick={() => runFlipkartAction('token')} className="h-10 rounded-md bg-thread px-4 text-sm font-black text-white">
                    Generate token
                  </button>
                </div>
                <div className="mt-3 text-xs leading-5 text-black/55">
                  <p>Portal: {flipkartProfile.portal}</p>
                  <p>Company: {flipkartProfile.companyName}</p>
                  <p>App ID: {flipkartProfile.appId ?? 'Not configured'}</p>
                  <p>Seller ID: {flipkartProfile.sellerId ?? 'Not configured'}</p>
                  <p>Location ID: {flipkartProfile.locationId ?? 'Not configured'}</p>
                  <p>Token expiry: {flipkartProfile.tokenExpiresAt ? formatDate(flipkartProfile.tokenExpiresAt) : 'No token'}</p>
                </div>
              </div>

              <div className="rounded-md border border-black/10 bg-[#fbfaf7] p-4">
                <h3 className="font-black">Listing and inventory</h3>
                <div className="mt-3 grid gap-2">
                  <input
                    value={flipkartSkuQuery}
                    onChange={(event) => setFlipkartSkuQuery(event.target.value)}
                    className="h-10 rounded-md border border-black/10 px-3 text-sm outline-none"
                    placeholder="Comma separated Flipkart seller SKUs"
                  />
                  <button onClick={() => runFlipkartAction('listing')} className="h-10 rounded-md bg-ink px-4 text-sm font-black text-white">
                    Fetch listing by SKU
                  </button>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {[
                    ['sku', 'Seller SKU'],
                    ['productId', 'Flipkart product ID / FSN'],
                    ['locationId', 'Location ID'],
                    ['inventory', 'Inventory']
                  ].map(([key, label]) => (
                    <input
                      key={key}
                      value={inventoryForm[key as keyof typeof inventoryForm]}
                      onChange={(event) => setInventoryForm((form) => ({ ...form, [key]: event.target.value }))}
                      className="h-10 rounded-md border border-black/10 px-3 text-sm outline-none"
                      placeholder={label}
                    />
                  ))}
                </div>
                <button onClick={() => runFlipkartAction('inventory')} className="mt-3 h-10 rounded-md bg-thread px-4 text-sm font-black text-white">
                  Update Flipkart inventory
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-md border border-black/10 bg-[#fbfaf7] p-4">
                <h3 className="font-black">Shipment filter</h3>
                <textarea
                  value={shipmentFilter}
                  onChange={(event) => setShipmentFilter(event.target.value)}
                  className="mt-3 min-h-32 w-full rounded-md border border-black/10 p-3 font-mono text-xs outline-none"
                />
                <button onClick={() => runFlipkartAction('shipments')} className="mt-3 h-10 rounded-md bg-ink px-4 text-sm font-black text-white">
                  Filter Flipkart shipments
                </button>
              </div>
              <div className="rounded-md border border-black/10 bg-[#1f2421] p-4 text-white">
                <h3 className="font-black">Flipkart response</h3>
                <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap text-xs leading-5 text-white/80">{flipkartResult}</pre>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
