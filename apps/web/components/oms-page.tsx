'use client';

import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from './app-shell';
import { apiUrl } from '../lib/integrations';
import { sampleOmsMappings, sampleOmsSummary, type OmsSkuMapping, type OmsSummary } from '../lib/oms';

const columns = ['amazon', 'myntra', 'flipkart', 'ajio', 'meesho', 'snapdeal'];
const emptyForm = { category: 'Camisole', masterSku: '', color: '', colorCode: '', sizes: 'S, M, L', packOf: '1', amazon: '', myntra: '', flipkart: '', ajio: '', meesho: '', snapdeal: '' };

function idFor(masterSku: string, colorCode: string) {
  return `${masterSku}-${colorCode}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'sku-mapping';
}

export function OmsPage() {
  const [items, setItems] = useState<OmsSkuMapping[]>(sampleOmsMappings);
  const [summary, setSummary] = useState<OmsSummary>(sampleOmsSummary);
  const [query, setQuery] = useState('');
  const [marketplace, setMarketplace] = useState('all');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (marketplace !== 'all') params.set('marketplace', marketplace);
    fetch(`${apiUrl}/api/oms/sku-mappings?${params}`)
      .then((response) => (response.ok ? response.json() : sampleOmsMappings))
      .then(setItems)
      .catch(() => setItems(sampleOmsMappings));
  }, [query, marketplace]);

  useEffect(() => {
    fetch(`${apiUrl}/api/oms/summary`)
      .then((response) => (response.ok ? response.json() : sampleOmsSummary))
      .then(setSummary)
      .catch(() => setSummary(sampleOmsSummary));
  }, [items]);

  function edit(item: OmsSkuMapping) {
    setEditing(item.id);
    setForm({
      category: item.category,
      masterSku: item.masterSku,
      color: item.color,
      colorCode: item.colorCode,
      sizes: item.sizes.join(', '),
      packOf: String(item.packOf),
      amazon: item.marketplaceSkus.amazon ?? '',
      myntra: item.marketplaceSkus.myntra ?? '',
      flipkart: item.marketplaceSkus.flipkart ?? '',
      ajio: item.marketplaceSkus.ajio ?? '',
      meesho: item.marketplaceSkus.meesho ?? '',
      snapdeal: item.marketplaceSkus.snapdeal ?? ''
    });
  }

  async function save() {
    const marketplaceSkus = columns.reduce<Record<string, string>>((acc, key) => ({ ...acc, [key]: form[key as keyof typeof form] }), {});
    const payload = { category: form.category, masterSku: form.masterSku, color: form.color, colorCode: form.colorCode, sizes: form.sizes.split(',').map((x) => x.trim()).filter(Boolean), packOf: Number(form.packOf || 1), marketplaceSkus };
    const url = editing ? `${apiUrl}/api/oms/sku-mappings/${editing}` : `${apiUrl}/api/oms/sku-mappings`;
    let saved: OmsSkuMapping;
    try {
      const response = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error();
      saved = await response.json();
    } catch {
      saved = { id: editing ?? idFor(form.masterSku, form.colorCode), ...payload };
    }
    setItems((current) => (editing ? current.map((item) => (item.id === editing ? saved : item)) : [saved, ...current]));
    setEditing(null);
    setForm(emptyForm);
  }

  async function remove(id: string) {
    try {
      await fetch(`${apiUrl}/api/oms/sku-mappings/${id}`, { method: 'DELETE' });
    } finally {
      setItems((current) => current.filter((item) => item.id !== id));
    }
  }

  return (
    <AppShell title="OMS SKU Mapping" subtitle="Manage master SKUs, colors, sizes and marketplace-specific SKU codes from the client OMS sheet.">
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {[
          ['Master SKUs', summary.masterSkus],
          ['Variants', summary.variants],
          ['Colors', summary.colors]
        ].map(([label, value]) => <div key={label as string} className="rounded-lg border border-black/10 bg-white p-5"><p className="text-3xl font-black">{value as number}</p><p className="text-sm font-bold text-black/50">{label as string}</p></div>)}
      </div>
      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <aside className="rounded-lg border border-black/10 bg-white p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl font-black">{editing ? 'Edit mapping' : 'Create mapping'}</h2>{editing ? <button onClick={() => { setEditing(null); setForm(emptyForm); }}><X size={18} /></button> : null}</div>
          <div className="grid gap-2 md:grid-cols-2">
            {['category', 'masterSku', 'color', 'colorCode', 'sizes', 'packOf', ...columns].map((key) => (
              <input key={key} className="h-10 rounded-md border border-black/10 px-3 text-sm" placeholder={key} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
            ))}
          </div>
          <button onClick={save} className="mt-3 inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 font-black text-white"><Plus size={16} /> Save mapping</button>
        </aside>
        <section>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative"><Search className="absolute left-3 top-3 text-black/40" size={18} /><input className="h-11 w-full rounded-md border border-black/10 bg-white pl-10" placeholder="Search SKU, color or marketplace code" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <select className="h-11 rounded-md border border-black/10 bg-white px-3" value={marketplace} onChange={(e) => setMarketplace(e.target.value)}>
              <option value="all">All marketplaces</option>
              {summary.marketplaces.map((item) => <option key={item} value={item}>{item.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#f3eee7] text-xs uppercase text-black/55"><tr>{['Category', 'Master SKU', 'Color', 'Sizes', ...columns, 'Actions'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
              <tbody>{items.map((item) => <tr key={item.id} className="border-t border-black/10"><td className="px-4 py-3 font-bold">{item.category}</td><td className="px-4 py-3 font-black text-thread">{item.masterSku}</td><td className="px-4 py-3">{item.color} ({item.colorCode})</td><td className="px-4 py-3">{item.sizes.join(', ')}</td>{columns.map((c) => <td key={c} className="px-4 py-3">{item.marketplaceSkus[c] || <span className="text-black/30">Not mapped</span>}</td>)}<td className="px-4 py-3"><div className="flex gap-2"><button onClick={() => edit(item)} className="rounded-md border p-2"><Pencil size={15} /></button><button onClick={() => remove(item.id)} className="rounded-md border border-red-200 bg-red-50 p-2 text-red-700"><Trash2 size={15} /></button></div></td></tr>)}</tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
