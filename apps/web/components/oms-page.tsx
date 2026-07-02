'use client';

import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from './app-shell';
import { apiUrl } from '../lib/integrations';
import { sampleOmsMappings, sampleOmsSummary, type OmsSkuMapping, type OmsSummary } from '../lib/oms';

const emptyForm = {
  barcode: '',
  marketPlace: 'Flipkart',
  brand: '',
  styleId: '',
  van: '',
  sellerSku: '',
  masterSku: '',
  skuCode: '',
  size: '',
  material: 'Cotton',
  packOf: '1',
  grouping: '',
  closure: '',
  style: '',
  productName: '',
  category: ''
};

const formFields: { key: keyof typeof emptyForm; label: string }[] = [
  { key: 'barcode', label: 'Bar Code' },
  { key: 'marketPlace', label: 'Market Place' },
  { key: 'brand', label: 'Brand' },
  { key: 'styleId', label: 'Style Id' },
  { key: 'van', label: 'VAN' },
  { key: 'sellerSku', label: 'Seller SKU' },
  { key: 'masterSku', label: 'Master SKU' },
  { key: 'skuCode', label: 'SKU CODE' },
  { key: 'size', label: 'Size' },
  { key: 'material', label: 'Material' },
  { key: 'packOf', label: 'Pack of' },
  { key: 'grouping', label: 'Grouping' },
  { key: 'closure', label: 'Closure' },
  { key: 'style', label: 'Style' },
  { key: 'productName', label: 'Product Name' },
  { key: 'category', label: 'Category' }
];

function makeId(item: typeof emptyForm) {
  return `${item.barcode}-${item.marketPlace}-${item.brand}-${item.sellerSku}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'oms-code';
}

function toForm(item: OmsSkuMapping) {
  return {
    barcode: item.barcode,
    marketPlace: item.marketPlace,
    brand: item.brand,
    styleId: item.styleId,
    van: item.van,
    sellerSku: item.sellerSku,
    masterSku: item.masterSku,
    skuCode: item.skuCode,
    size: item.size,
    material: item.material,
    packOf: String(item.packOf),
    grouping: item.grouping,
    closure: item.closure,
    style: item.style,
    productName: item.productName,
    category: item.category
  };
}

function toPayload(form: typeof emptyForm) {
  return {
    ...form,
    packOf: Number(form.packOf || 1)
  };
}

export function OmsPage() {
  const [items, setItems] = useState<OmsSkuMapping[]>(sampleOmsMappings);
  const [summary, setSummary] = useState<OmsSummary>(sampleOmsSummary);
  const [query, setQuery] = useState('');
  const [marketplace, setMarketplace] = useState('all');
  const [brand, setBrand] = useState('all');
  const [category, setCategory] = useState('all');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState('Manage OMS code rows from the latest client sheet.');

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (marketplace !== 'all') params.set('marketplace', marketplace);
    if (brand !== 'all') params.set('brand', brand);
    if (category !== 'all') params.set('category', category);
    fetch(`${apiUrl}/api/oms/sku-mappings?${params}`)
      .then((response) => (response.ok ? response.json() : sampleOmsMappings))
      .then(setItems)
      .catch(() => setItems(sampleOmsMappings));
  }, [query, marketplace, brand, category]);

  useEffect(() => {
    fetch(`${apiUrl}/api/oms/summary`)
      .then((response) => (response.ok ? response.json() : sampleOmsSummary))
      .then(setSummary)
      .catch(() => setSummary(sampleOmsSummary));
  }, [items]);

  function edit(item: OmsSkuMapping) {
    setEditing(item.id);
    setForm(toForm(item));
    setNotice(`Editing ${item.sellerSku}`);
  }

  async function save() {
    if (!form.masterSku.trim() || !form.sellerSku.trim()) {
      setNotice('Master SKU and Seller SKU are required.');
      return;
    }

    const payload = toPayload(form);
    const url = editing ? `${apiUrl}/api/oms/sku-mappings/${editing}` : `${apiUrl}/api/oms/sku-mappings`;
    let saved: OmsSkuMapping;

    try {
      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Could not save OMS row');
      saved = await response.json();
    } catch {
      saved = {
        id: editing ?? makeId(form),
        ...payload
      };
    }

    setItems((current) => (editing ? current.map((item) => (item.id === editing ? saved : item)) : [saved, ...current]));
    setEditing(null);
    setForm(emptyForm);
    setNotice(`${saved.sellerSku} saved.`);
  }

  async function remove(id: string) {
    try {
      await fetch(`${apiUrl}/api/oms/sku-mappings/${id}`, { method: 'DELETE' });
    } finally {
      setItems((current) => current.filter((item) => item.id !== id));
      setNotice('OMS row deleted.');
    }
  }

  return (
    <AppShell title="OMS Code Table" subtitle={notice}>
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        {[
          ['Rows', summary.variants],
          ['Master SKUs', summary.masterSkus],
          ['Marketplaces', summary.marketplaces.length],
          ['Categories', summary.categories.length]
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-lg border border-black/10 bg-white p-5">
            <p className="text-3xl font-black">{value as number}</p>
            <p className="text-sm font-bold text-black/50">{label as string}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[440px_1fr]">
        <aside className="rounded-lg border border-black/10 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black">{editing ? 'Edit OMS code' : 'Create OMS code'}</h2>
            {editing ? (
              <button onClick={() => { setEditing(null); setForm(emptyForm); setNotice('Edit cancelled.'); }}>
                <X size={18} />
              </button>
            ) : null}
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {formFields.map((field) => (
              <input
                key={field.key}
                className={`h-10 rounded-md border border-black/10 px-3 text-sm ${field.key === 'productName' ? 'md:col-span-2' : ''}`}
                placeholder={field.label}
                value={form[field.key]}
                onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
              />
            ))}
          </div>
          <button onClick={save} className="mt-3 inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 font-black text-white">
            <Plus size={16} /> Save OMS row
          </button>
        </aside>

        <section>
          <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_180px_180px_180px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-black/40" size={18} />
              <input
                className="h-11 w-full rounded-md border border-black/10 bg-white pl-10"
                placeholder="Search barcode, SKU, VAN, product, brand"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <select className="h-11 rounded-md border border-black/10 bg-white px-3" value={marketplace} onChange={(event) => setMarketplace(event.target.value)}>
              <option value="all">All marketplaces</option>
              {summary.marketplaces.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className="h-11 rounded-md border border-black/10 bg-white px-3" value={brand} onChange={(event) => setBrand(event.target.value)}>
              <option value="all">All brands</option>
              {summary.brands.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select className="h-11 rounded-md border border-black/10 bg-white px-3" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {summary.categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
            <table className="w-full min-w-[1500px] text-left text-sm">
              <thead className="bg-[#f3eee7] text-xs uppercase text-black/55">
                <tr>
                  {['Bar Code', 'Market Place', 'Brand', 'Style Id', 'VAN', 'Seller SKU', 'Master SKU', 'SKU CODE', 'Size', 'Material', 'Pack', 'Style', 'Product Name', 'Category', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 py-3">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-black/10">
                    <td className="px-4 py-3 font-bold">{item.barcode}</td>
                    <td className="px-4 py-3">{item.marketPlace}</td>
                    <td className="px-4 py-3">{item.brand}</td>
                    <td className="px-4 py-3">{item.styleId}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.van}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-thread">{item.sellerSku}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.masterSku}</td>
                    <td className="px-4 py-3 font-mono text-xs">{item.skuCode}</td>
                    <td className="px-4 py-3">{item.size}</td>
                    <td className="px-4 py-3">{item.material}</td>
                    <td className="px-4 py-3">{item.packOf}</td>
                    <td className="px-4 py-3">{item.style}</td>
                    <td className="max-w-[300px] px-4 py-3">{item.productName}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => edit(item)} className="rounded-md border p-2"><Pencil size={15} /></button>
                        <button onClick={() => remove(item.id)} className="rounded-md border border-red-200 bg-red-50 p-2 text-red-700"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
