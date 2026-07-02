'use client';

import { Download, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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

const requiredFormFields: { key: keyof typeof emptyForm; label: string }[] = [
  { key: 'barcode', label: 'Bar Code' },
  { key: 'marketPlace', label: 'Market Place' },
  { key: 'brand', label: 'Brand' },
  { key: 'sellerSku', label: 'Seller SKU' },
  { key: 'masterSku', label: 'Master SKU' },
  { key: 'category', label: 'Category' }
];

const exportHeaders: { key: keyof OmsSkuMapping; label: string }[] = [
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

const headerAliases: Record<string, keyof typeof emptyForm> = {
  barcode: 'barcode',
  'bar code': 'barcode',
  marketplace: 'marketPlace',
  'market place': 'marketPlace',
  brand: 'brand',
  'style id': 'styleId',
  styleid: 'styleId',
  van: 'van',
  'seller sku': 'sellerSku',
  sellersku: 'sellerSku',
  'master sku': 'masterSku',
  mastersku: 'masterSku',
  'sku code': 'skuCode',
  skucode: 'skuCode',
  size: 'size',
  material: 'material',
  'pack of': 'packOf',
  packof: 'packOf',
  grouping: 'grouping',
  closure: 'closure',
  style: 'style',
  'product name': 'productName',
  productname: 'productName',
  category: 'category'
};

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

function marketplaceTone(marketplaceName: string) {
  const key = marketplaceName.toLowerCase();
  if (key.includes('flipkart')) return 'border-blue-200 bg-blue-50 text-blue-700';
  if (key.includes('myntra')) return 'border-pink-200 bg-pink-50 text-pink-700';
  if (key.includes('amazon')) return 'border-amber-200 bg-amber-50 text-amber-700';
  if (key.includes('ajio')) return 'border-violet-200 bg-violet-50 text-violet-700';
  if (key.includes('meesho')) return 'border-rose-200 bg-rose-50 text-rose-700';
  if (key.includes('snapdeal')) return 'border-orange-200 bg-orange-50 text-orange-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[`"'_/-]+/g, ' ').replace(/\s+/g, ' ');
}

function parseDelimitedRows(text: string) {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  const delimiter = text.split('\n')[0]?.includes('\t') ? '\t' : ',';

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);

  return rows;
}

function rowsToMappings(text: string) {
  const rows = parseDelimitedRows(text);
  const [headers = [], ...dataRows] = rows;
  const keys = headers.map((header) => headerAliases[normalizeHeader(header)]).filter(Boolean);

  if (keys.length === 0) {
    throw new Error('Template headers were not recognized.');
  }

  return dataRows
    .map((row) => {
      const form = { ...emptyForm };
      row.forEach((value, index) => {
        const key = keys[index];
        if (!key) return;
        form[key] = value.replace(/^`+/, '').trim();
      });
      return {
        id: makeId(form),
        ...toPayload(form)
      };
    });
}

function escapeCell(value: unknown) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadBlob(content: string, fileName: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function readApiError(response: Response) {
  try {
    const body = await response.json();
    if (Array.isArray(body.errors) && body.errors.length > 0) return body.errors.slice(0, 3).join(' | ');
    if (Array.isArray(body.message)) return body.message.join(', ');
    if (typeof body.message === 'string') return body.message;
  } catch {
    return 'Request failed.';
  }

  return 'Request failed.';
}

export function OmsPage() {
  const [items, setItems] = useState<OmsSkuMapping[]>(sampleOmsMappings);
  const [summary, setSummary] = useState<OmsSummary>(sampleOmsSummary);
  const [query, setQuery] = useState('');
  const [marketplace, setMarketplace] = useState('all');
  const [brand, setBrand] = useState('all');
  const [category, setCategory] = useState('all');
  const [barcode, setBarcode] = useState('all');
  const [downloadFormat, setDownloadFormat] = useState('csv');
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('Manage OMS code rows from the latest client sheet.');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSkuMappings = useCallback(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (marketplace !== 'all') params.set('marketplace', marketplace);
    if (brand !== 'all') params.set('brand', brand);
    if (category !== 'all') params.set('category', category);
    if (barcode !== 'all') params.set('barcode', barcode);
    return fetch(`${apiUrl}/api/oms/sku-mappings?${params}`)
      .then((response) => (response.ok ? response.json() : sampleOmsMappings))
      .then(setItems)
      .catch(() => setItems(sampleOmsMappings));
  }, [barcode, brand, category, marketplace, query]);

  useEffect(() => {
    void loadSkuMappings();
  }, [loadSkuMappings]);

  useEffect(() => {
    fetch(`${apiUrl}/api/oms/summary`)
      .then((response) => (response.ok ? response.json() : sampleOmsSummary))
      .then(setSummary)
      .catch(() => setSummary(sampleOmsSummary));
  }, [items]);

  function edit(item: OmsSkuMapping) {
    setEditing(item.id);
    setShowForm(true);
    setForm(toForm(item));
    setNotice(`Editing ${item.sellerSku}`);
  }

  function createNew() {
    setEditing(null);
    setShowForm(true);
    setForm(emptyForm);
    setNotice('Create a new OMS code row.');
  }

  async function save() {
    const missingFields = requiredFormFields.filter((field) => !form[field.key].trim()).map((field) => field.label);

    if (missingFields.length > 0) {
      setNotice(`${missingFields.join(', ')} ${missingFields.length === 1 ? 'is' : 'are'} required.`);
      return;
    }

    if (Number(form.packOf || 1) <= 0) {
      setNotice('Pack of must be greater than 0.');
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
      if (!response.ok) throw new Error(await readApiError(response));
      saved = await response.json();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save OMS row.');
      return;
    }

    setItems((current) => (editing ? current.map((item) => (item.id === editing ? saved : item)) : [saved, ...current]));
    setEditing(null);
    setShowForm(false);
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

  async function uploadTemplate(file: File) {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'xlsx') {
      setNotice('Please export the sheet as CSV or Excel 97-2003 .xls, then upload it here.');
      return;
    }

    try {
      const text = await file.text();
      const rows = rowsToMappings(text);

      if (rows.length === 0) {
        setNotice('No valid OMS rows found. Master SKU and Seller SKU are required.');
        return;
      }

      let savedRows = rows;
      const response = await fetch(`${apiUrl}/api/oms/sku-mappings/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const body = await response.json();
      savedRows = body.rows ?? rows;
      await loadSkuMappings();
      setNotice(`${savedRows.length} OMS rows uploaded from ${file.name}.${body.skipped ? ` ${body.skipped} rows skipped.` : ''}`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not read the uploaded file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function downloadRows(format: string) {
    const fileBase = `oms-${marketplace === 'all' ? 'all-marketplaces' : marketplace.toLowerCase()}-${new Date().toISOString().slice(0, 10)}`;

    if (format === 'json') {
      downloadBlob(JSON.stringify(items, null, 2), `${fileBase}.json`, 'application/json;charset=utf-8');
      return;
    }

    if (format === 'xls') {
      const headings = exportHeaders.map((header) => `<th>${header.label}</th>`).join('');
      const body = items
        .map((item) => `<tr>${exportHeaders.map((header) => `<td>${String(item[header.key] ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td>`).join('')}</tr>`)
        .join('');
      downloadBlob(`<table><thead><tr>${headings}</tr></thead><tbody>${body}</tbody></table>`, `${fileBase}.xls`, 'application/vnd.ms-excel;charset=utf-8');
      return;
    }

    const delimiter = format === 'tsv' ? '\t' : ',';
    const content = [
      exportHeaders.map((header) => escapeCell(header.label)).join(delimiter),
      ...items.map((item) => exportHeaders.map((header) => escapeCell(item[header.key])).join(delimiter))
    ].join('\n');
    downloadBlob(content, `${fileBase}.${format}`, format === 'tsv' ? 'text/tab-separated-values;charset=utf-8' : 'text/csv;charset=utf-8');
  }

  return (
    <AppShell title="OMS Code Table" subtitle={notice}>
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        {[
          ['Rows', summary.variants],
          ['Master SKUs', summary.masterSkus],
          ['Marketplaces', summary.marketplaces.length],
          ['Barcodes', summary.barcodes?.length ?? Object.keys(summary.barcodeCounts ?? {}).length],
          ['Categories', summary.categories.length]
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-lg border border-black/10 bg-white p-5">
            <p className="text-3xl font-black">{value as number}</p>
            <p className="text-sm font-bold text-black/50">{label as string}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={createNew} className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 font-black text-white">
          <Plus size={16} /> Create OMS Code
        </button>
        <input
          ref={fileInputRef}
          className="hidden"
          type="file"
          accept=".csv,.tsv,.txt,.xls"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void uploadTemplate(file);
          }}
        />
        <button onClick={() => fileInputRef.current?.click()} className="inline-flex h-11 items-center gap-2 rounded-md border border-black/10 bg-white px-4 font-black text-ink">
          <Upload size={16} /> BulkUpdate
        </button>
        <select className="h-11 rounded-md border border-black/10 bg-white px-3" value={downloadFormat} onChange={(event) => setDownloadFormat(event.target.value)}>
          <option value="csv">CSV</option>
          <option value="xls">XLS</option>
          <option value="json">JSON</option>
          <option value="tsv">TSV</option>
        </select>
        <button onClick={() => downloadRows(downloadFormat)} className="inline-flex h-11 items-center gap-2 rounded-md bg-thread px-4 font-black text-white">
          <Download size={16} /> Download
        </button>
      </div>

      <div className={`grid gap-5 ${showForm ? 'xl:grid-cols-[440px_1fr]' : ''}`}>
        {showForm ? (
        <aside className="rounded-lg border border-black/10 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-black">{editing ? 'Edit OMS code' : 'Create OMS code'}</h2>
            <button onClick={() => { setEditing(null); setShowForm(false); setForm(emptyForm); setNotice('Form closed.'); }}>
              <X size={18} />
            </button>
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
        ) : null}

        <section>
          <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_170px_170px_170px_170px]">
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
            <select className="h-11 rounded-md border border-black/10 bg-white px-3" value={barcode} onChange={(event) => setBarcode(event.target.value)}>
              <option value="all">All barcodes</option>
              {(summary.barcodes ?? Object.keys(summary.barcodeCounts ?? {})).map((item) => <option key={item} value={item}>{item}</option>)}
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
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${marketplaceTone(item.marketPlace)}`}>{item.marketPlace}</span>
                    </td>
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
