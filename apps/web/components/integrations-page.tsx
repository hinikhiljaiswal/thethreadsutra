'use client';

import { CheckCircle2, Pencil, Plus, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from './app-shell';
import { apiUrl, sampleIntegrations, type Integration, type IntegrationCategory } from '../lib/integrations';

const emptyForm = { name: '', category: 'marketplaces' as IntegrationCategory, regions: 'India', description: '', capabilities: 'Catalog sync' };
const categories: (IntegrationCategory | 'all')[] = ['all', 'web-stores', 'marketplaces', 'logistics', 'tech'];

function list(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'integration';
}

export function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>(sampleIntegrations);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<IntegrationCategory | 'all'>('all');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState('Manage marketplace, web store, logistics and SaaS integrations.');

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category !== 'all') params.set('category', category);
    fetch(`${apiUrl}/api/integrations?${params}`)
      .then((response) => (response.ok ? response.json() : sampleIntegrations))
      .then(setItems)
      .catch(() => setItems(sampleIntegrations));
  }, [query, category]);

  function edit(item: Integration) {
    setEditing(item.slug);
    setForm({
      name: item.name,
      category: item.category,
      regions: item.regions.join(', '),
      description: item.description,
      capabilities: item.capabilities.join(', ')
    });
  }

  async function save() {
    if (!form.name.trim()) return setNotice('Integration name is required.');
    const payload = { ...form, regions: list(form.regions), capabilities: list(form.capabilities) };
    const url = editing ? `${apiUrl}/api/integrations/${editing}` : `${apiUrl}/api/integrations`;
    const method = editing ? 'PUT' : 'POST';
    let saved: Integration;
    try {
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error();
      saved = await response.json();
    } catch {
      saved = {
        slug: editing ?? slug(form.name),
        name: form.name,
        category: form.category,
        regions: payload.regions,
        description: form.description || 'Integration ready for setup.',
        capabilities: payload.capabilities,
        connected: false,
        status: 'Available',
        syncCount: 0,
        lastSyncAt: null
      };
    }
    setItems((current) => (editing ? current.map((item) => (item.slug === editing ? saved : item)) : [saved, ...current]));
    setForm(emptyForm);
    setEditing(null);
    setNotice(`${saved.name} saved.`);
  }

  async function remove(id: string) {
    try {
      await fetch(`${apiUrl}/api/integrations/${id}`, { method: 'DELETE' });
    } finally {
      setItems((current) => current.filter((item) => item.slug !== id));
      setNotice('Integration deleted.');
    }
  }

  async function sync(id: string) {
    const response = await fetch(`${apiUrl}/api/integrations/${id}/sync`, { method: 'POST' });
    if (response.ok) {
      const updated = await response.json();
      setItems((current) => current.map((item) => (item.slug === id ? updated : item)));
    }
  }

  return (
    <AppShell title="Integrations" subtitle={notice}>
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <aside className="rounded-lg border border-black/10 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black">{editing ? 'Edit integration' : 'Create integration'}</h2>
            {editing ? <button onClick={() => { setEditing(null); setForm(emptyForm); }}><X size={18} /></button> : null}
          </div>
          <div className="grid gap-3">
            <input className="h-11 rounded-md border border-black/10 px-3" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="h-11 rounded-md border border-black/10 px-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as IntegrationCategory })}>
              {categories.filter((item) => item !== 'all').map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <input className="h-11 rounded-md border border-black/10 px-3" placeholder="Regions" value={form.regions} onChange={(e) => setForm({ ...form, regions: e.target.value })} />
            <input className="h-11 rounded-md border border-black/10 px-3" placeholder="Capabilities" value={form.capabilities} onChange={(e) => setForm({ ...form, capabilities: e.target.value })} />
            <textarea className="min-h-24 rounded-md border border-black/10 p-3" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <button onClick={save} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 font-black text-white"><Plus size={16} /> Save</button>
          </div>
        </aside>
        <section>
          <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-black/40" size={18} />
              <input className="h-11 w-full rounded-md border border-black/10 bg-white pl-10" placeholder="Search integrations" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <select className="h-11 rounded-md border border-black/10 bg-white px-3" value={category} onChange={(e) => setCategory(e.target.value as IntegrationCategory | 'all')}>
              {categories.map((item) => <option key={item} value={item}>{item === 'all' ? 'All categories' : item}</option>)}
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article key={item.slug} className="rounded-lg border border-black/10 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-xs font-black uppercase text-leaf">{item.category}</p><h3 className="mt-1 text-2xl font-black">{item.name}</h3></div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-leaf/10 px-2 py-1 text-xs font-black text-leaf"><CheckCircle2 size={14} />{item.status}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-black/60">{item.description}</p>
                <p className="mt-3 text-xs font-bold text-black/50">{item.regions.join(', ')} · {item.capabilities.join(', ')}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <button onClick={() => edit(item)} className="h-10 rounded-md border font-black"><Pencil className="mx-auto" size={16} /></button>
                  <button onClick={() => sync(item.slug)} className="h-10 rounded-md border font-black"><RefreshCw className="mx-auto" size={16} /></button>
                  <button onClick={() => remove(item.slug)} className="h-10 rounded-md border border-red-200 bg-red-50 text-red-700"><Trash2 className="mx-auto" size={16} /></button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
