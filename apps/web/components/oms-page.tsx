'use client';

import {
  Archive,
  ArrowLeft,
  Check,
  Download,
  FileDown,
  LayoutDashboard,
  ListChecks,
  PackageCheck,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  Split,
  Trash2,
  Upload,
  UserPlus,
  Warehouse,
  X
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiUrl } from '../lib/integrations';
import { sampleOmsMappings, sampleOmsSummary, type OmsSkuMapping, type OmsSummary } from '../lib/oms';

type OmsTab = 'dashboard' | 'acknowledgement' | 'picklist' | 'shipping' | 'split' | 'handover' | 'mapping';
type OrderStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Allocated' | 'Picked' | 'Shipped';

type OrderRow = {
  id: string;
  extOrderNo: string;
  orderNo: string;
  channelName: string;
  orderType: string;
  orderDate: string;
  skuCode: string;
  skuDesc: string;
  walkinLocation: string;
  fulfillmentLocation: string;
  orderQty: number;
  lineNo: number;
  lineAmount: number;
  customer: string;
  status: OrderStatus;
  zone: string;
  bin: string;
};

type Wave = {
  id: string;
  zone: string;
  picklistType: string;
  orders: number;
  qty: number;
  status: 'Draft' | 'Generated' | 'Released';
  createdAt: string;
  filters?: Record<string, string>;
};

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

const emptyWave = {
  zone: '',
  binFrom: '',
  binTo: '',
  aisle: '',
  picklistType: '',
  minQty: '1',
  maxQty: '',
  orderProcessing: 'B2C',
  waveDescription: '',
  channel: '',
  orderType: '',
  brand: '',
  orderStatus: 'Allocated',
  skuCode: ''
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

const orderRows: OrderRow[] = [
  {
    id: 'TEST-0001',
    extOrderNo: 'TEST-0001',
    orderNo: 'ACD194',
    channelName: 'Jeevacare Magento-12',
    orderType: 'Prepaid',
    orderDate: '2026-07-07 12:00 PM',
    skuCode: 'DS_VINCULUM_A_001',
    skuDesc: 'DS_Vinculum_A_001 T',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 1,
    lineNo: 1,
    lineAmount: 1000,
    customer: 'Riya Sen',
    status: 'Pending',
    zone: 'A',
    bin: 'A-01-07'
  },
  {
    id: 'UWH6750973',
    extOrderNo: 'UWH6750973',
    orderNo: 'UWH6750973',
    channelName: 'Amazon SOUQ-113',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 12:03 PM',
    skuCode: '51H',
    skuDesc: 'Yonex CAB 6000 Plus',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 10,
    lineNo: 1,
    lineAmount: 100,
    customer: 'Aarav Mehta',
    status: 'Pending',
    zone: 'B',
    bin: 'B-04-11'
  },
  {
    id: 'UWH6750957',
    extOrderNo: 'UWH6750957',
    orderNo: 'UWH6750957',
    channelName: 'Test Woocommerce-33',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 12:00 PM',
    skuCode: 'DS2',
    skuDesc: 'Yonex CAB 7000 Plus',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 10,
    lineNo: 1,
    lineAmount: 20400,
    customer: 'Mira Rao',
    status: 'Allocated',
    zone: 'A',
    bin: 'A-03-22'
  },
  {
    id: 'UWH6750938',
    extOrderNo: 'UWH6750938',
    orderNo: 'UWH6750938',
    channelName: 'JX Karawaci',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 11:55 AM',
    skuCode: '1H',
    skuDesc: 'Yonex CAB 6000 Plus',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 10,
    lineNo: 1,
    lineAmount: 12340,
    customer: 'Devika Nair',
    status: 'Accepted',
    zone: 'C',
    bin: 'C-09-02'
  },
  {
    id: 'NWB933553',
    extOrderNo: 'NWB933553',
    orderNo: 'ACD193',
    channelName: 'Nykaa PO UAT',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 03:02 AM',
    skuCode: 'DS_VINCULUM_A_001',
    skuDesc: 'DS_Vinculum_A_001 T',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 3,
    lineNo: 1,
    lineAmount: 3000,
    customer: 'Ishaan Kapoor',
    status: 'Pending',
    zone: 'B',
    bin: 'B-02-18'
  },
  {
    id: 'NWB933572',
    extOrderNo: 'NWB933572',
    orderNo: 'ACD190',
    channelName: 'Nykaa PO UAT',
    orderType: 'COD',
    orderDate: '2026-07-04 03:02 AM',
    skuCode: 'DS_VINCULUM_A_001',
    skuDesc: 'DS_Vinculum_A_001 T',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 3,
    lineNo: 1,
    lineAmount: 3000,
    customer: 'Naina Shah',
    status: 'Rejected',
    zone: 'D',
    bin: 'D-05-19'
  },
  {
    id: 'NWB933577',
    extOrderNo: 'NWB933577',
    orderNo: 'ACD191',
    channelName: 'Fashion Techies Shopify-44',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 03:02 AM',
    skuCode: 'TSBKBLKLCMP12',
    skuDesc: 'Thread Sutra Cotton Blend Basic Bra',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 5,
    lineNo: 1,
    lineAmount: 4495,
    customer: 'Sara Dsouza',
    status: 'Allocated',
    zone: 'A',
    bin: 'A-08-04'
  },
  {
    id: 'NWB933578',
    extOrderNo: 'NWB933578',
    orderNo: 'ACD192',
    channelName: 'vajorOm-12',
    orderType: 'Prepaid',
    orderDate: '2026-07-04 03:02 AM',
    skuCode: 'DRBBKBLUDOTXLPO1',
    skuDesc: 'DressBerry Cotton Blend Bikini Briefs',
    walkinLocation: 'UWH-UWH233-JX Karawaci',
    fulfillmentLocation: 'UWH-UWH233-JX Karawaci',
    orderQty: 4,
    lineNo: 1,
    lineAmount: 2396,
    customer: 'Kabir Jain',
    status: 'Picked',
    zone: 'C',
    bin: 'C-01-10'
  }
];

const quickTabs: { key: OmsTab; label: string; icon: typeof ListChecks }[] = [
  { key: 'acknowledgement', label: 'Order Allocate/Unallocate', icon: ListChecks },
  { key: 'shipping', label: 'Delivery Shipping', icon: PackageCheck },
  { key: 'mapping', label: 'Bulk Order Update', icon: Upload },
  { key: 'picklist', label: 'Manage Picklist', icon: Archive },
  { key: 'split', label: 'Delivery Split', icon: Split },
  { key: 'handover', label: 'Shipment Handover', icon: Warehouse }
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

  if (keys.length === 0) throw new Error('Template headers were not recognized.');

  return dataRows.map((row) => {
    const form = { ...emptyForm };
    row.forEach((value, index) => {
      const key = keys[index];
      if (key) form[key] = value.replace(/^`+/, '').trim();
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

function toneForStatus(status: OrderStatus) {
  if (status === 'Accepted' || status === 'Allocated' || status === 'Picked' || status === 'Shipped') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'Rejected') return 'bg-red-50 text-red-700 border-red-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function marketplaceTone(marketplaceName: string) {
  const key = marketplaceName.toLowerCase();
  if (key.includes('flipkart')) return 'border-blue-200 bg-blue-50 text-blue-700';
  if (key.includes('myntra')) return 'border-pink-200 bg-pink-50 text-pink-700';
  if (key.includes('amazon')) return 'border-amber-200 bg-amber-50 text-amber-700';
  if (key.includes('ajio')) return 'border-violet-200 bg-violet-50 text-violet-700';
  if (key.includes('meesho')) return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid grid-cols-[150px_1fr] items-center gap-3 text-[13px] font-semibold text-slate-700">
      <span className="text-right">{label}</span>
      {children}
    </label>
  );
}

function SmallInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`h-8 rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-sky-500 ${props.className ?? ''}`} />;
}

function SmallSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`h-8 rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-sky-500 ${props.className ?? ''}`} />;
}

export function OmsPage() {
  const [activeTab, setActiveTab] = useState<OmsTab>('dashboard');
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
  const [orders, setOrders] = useState<OrderRow[]>(orderRows);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [waveForm, setWaveForm] = useState(emptyWave);
  const [waves, setWaves] = useState<Wave[]>([]);
  const [notice, setNotice] = useState('OMS workspace ready.');
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

  const loadOrders = useCallback(() => {
    return fetch(`${apiUrl}/api/oms/orders`)
      .then((response) => (response.ok ? response.json() : orderRows))
      .then(setOrders)
      .catch(() => setOrders(orderRows));
  }, []);

  const loadWaves = useCallback(() => {
    return fetch(`${apiUrl}/api/oms/waves`)
      .then((response) => (response.ok ? response.json() : []))
      .then(setWaves)
      .catch(() => setWaves([]));
  }, []);

  useEffect(() => {
    void loadSkuMappings();
  }, [loadSkuMappings]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    void loadWaves();
  }, [loadWaves]);

  useEffect(() => {
    fetch(`${apiUrl}/api/oms/summary`)
      .then((response) => (response.ok ? response.json() : sampleOmsSummary))
      .then(setSummary)
      .catch(() => setSummary(sampleOmsSummary));
  }, [items]);

  const channels = useMemo(() => [...new Set(orders.map((order) => order.channelName))].sort(), [orders]);
  const filteredOrders = useMemo(() => {
    const search = orderSearch.toLowerCase().trim();
    return orders.filter((order) => {
      const matchesChannel = channelFilter === 'all' || order.channelName === channelFilter;
      const matchesSearch = !search || Object.values(order).some((value) => String(value).toLowerCase().includes(search));
      return matchesChannel && matchesSearch;
    });
  }, [channelFilter, orderSearch, orders]);

  const metrics = useMemo(() => {
    const pending = orders.filter((order) => order.status === 'Pending').length;
    const allocated = orders.filter((order) => order.status === 'Allocated').length;
    const shipped = orders.filter((order) => order.status === 'Shipped').length;
    const revenue = orders.reduce((total, order) => total + order.lineAmount, 0);
    return { pending, allocated, shipped, revenue };
  }, [orders]);

  function edit(item: OmsSkuMapping) {
    setEditing(item.id);
    setShowForm(true);
    setForm(toForm(item));
    setActiveTab('mapping');
    setNotice(`Editing ${item.sellerSku}`);
  }

  function createNew() {
    setEditing(null);
    setShowForm(true);
    setForm(emptyForm);
    setActiveTab('mapping');
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

      const response = await fetch(`${apiUrl}/api/oms/sku-mappings/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      });

      if (!response.ok) throw new Error(await readApiError(response));

      const body = await response.json();
      await loadSkuMappings();
      setNotice(`${body.rows?.length ?? rows.length} OMS rows uploaded from ${file.name}.${body.skipped ? ` ${body.skipped} rows skipped.` : ''}`);
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
      const body = items.map((item) => `<tr>${exportHeaders.map((header) => `<td>${String(item[header.key] ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;')}</td>`).join('')}</tr>`).join('');
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

  async function updateSelectedOrders(status: OrderStatus) {
    const targetIds = selectedOrders.length > 0 ? selectedOrders : filteredOrders.map((order) => order.id);

    try {
      const response = await fetch(`${apiUrl}/api/oms/orders/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: targetIds,
          status,
          query: orderSearch,
          channel: channelFilter
        })
      });
      if (!response.ok) throw new Error(await readApiError(response));
      const body = await response.json();
      setOrders(body.allRows ?? body.rows ?? []);
      setNotice(`${body.count ?? targetIds.length} order${(body.count ?? targetIds.length) === 1 ? '' : 's'} moved to ${status}.`);
    } catch (error) {
      setOrders((current) => current.map((order) => (targetIds.includes(order.id) ? { ...order, status } : order)));
      setNotice(error instanceof Error ? `${error.message} Updated locally only.` : `${targetIds.length} orders updated locally only.`);
    } finally {
      setSelectedOrders([]);
    }
  }

  function toggleAllOrders() {
    const visibleIds = filteredOrders.map((order) => order.id);
    const allSelected = visibleIds.every((id) => selectedOrders.includes(id));
    setSelectedOrders(allSelected ? selectedOrders.filter((id) => !visibleIds.includes(id)) : [...new Set([...selectedOrders, ...visibleIds])]);
  }

  function exportOrders() {
    const headers = ['Ext Order No', 'Order No', 'Channel Name', 'Order Type', 'Order Date', 'SKU Code', 'SKU Desc', 'Fulfillment Location', 'Qty', 'Line Amount', 'Status'];
    const rows = filteredOrders.map((order) => [
      order.extOrderNo,
      order.orderNo,
      order.channelName,
      order.orderType,
      order.orderDate,
      order.skuCode,
      order.skuDesc,
      order.fulfillmentLocation,
      order.orderQty,
      order.lineAmount,
      order.status
    ]);
    downloadBlob([headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n'), 'orders-export.csv', 'text/csv;charset=utf-8');
  }

  async function generatePicklist() {
    if (!waveForm.zone.trim()) {
      setNotice('Zone is required to generate a picklist.');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/oms/waves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waveForm)
      });
      if (!response.ok) throw new Error(await readApiError(response));
      const body = await response.json();
      setWaves(body.waves ?? [body.wave, ...waves]);
      setOrders(body.allRows ?? orders);
      setNotice(`${body.wave.id} generated for Zone ${body.wave.zone}.`);
    } catch (error) {
      const eligible = orders.filter((order) => order.zone.toLowerCase() === waveForm.zone.toLowerCase() && ['Accepted', 'Allocated'].includes(order.status));
      const wave: Wave = {
        id: `WAVE-${String(waves.length + 1).padStart(4, '0')}`,
        zone: waveForm.zone.toUpperCase(),
        picklistType: waveForm.picklistType || 'Full',
        orders: eligible.length,
        qty: eligible.reduce((total, order) => total + order.orderQty, 0),
        status: 'Generated',
        createdAt: new Date().toISOString()
      };

      setWaves((current) => [wave, ...current]);
      setOrders((current) => current.map((order) => (eligible.some((item) => item.id === order.id) ? { ...order, status: 'Picked' } : order)));
      setNotice(error instanceof Error ? `${error.message} Generated locally only.` : `${wave.id} generated locally only.`);
    }
  }

  function renderDashboard() {
    const topChannels = channels.slice(0, 5).map((channel) => ({
      channel,
      count: orders.filter((order) => order.channelName === channel).length
    }));
    const maxChannel = Math.max(...topChannels.map((item) => item.count), 1);

    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
          {[
            ['Pending', metrics.pending, 'bg-emerald-500'],
            ['Allocated', metrics.allocated, 'bg-amber-500'],
            ['Rejected', orders.filter((order) => order.status === 'Rejected').length, 'bg-red-500'],
            ['Picked', orders.filter((order) => order.status === 'Picked').length, 'bg-cyan-500'],
            ['Shipped', metrics.shipped, 'bg-violet-500'],
            ['OMS Rows', summary.variants, 'bg-rose-500'],
            ['Master SKU', summary.masterSkus, 'bg-slate-600'],
            ['Channels', channels.length, 'bg-teal-500']
          ].map(([label, value, color]) => (
            <button key={label as string} onClick={() => setActiveTab(label === 'OMS Rows' ? 'mapping' : 'acknowledgement')} className={`${color as string} rounded-sm px-4 py-3 text-left text-white shadow-sm transition hover:brightness-95`}>
              <p className="text-2xl font-bold leading-none">{value as number}</p>
              <p className="mt-1 text-xs font-bold">{label as string}</p>
            </button>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <section className="border border-slate-300 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-bold">Order Count By Channel</div>
            <div className="space-y-3 p-5">
              {topChannels.map((item) => (
                <div key={item.channel} className="grid grid-cols-[170px_1fr_36px] items-center gap-3 text-sm">
                  <span className="truncate font-semibold">{item.channel}</span>
                  <span className="h-7 bg-sky-600" style={{ width: `${Math.max(12, (item.count / maxChannel) * 100)}%` }} />
                  <span className="text-right font-bold">{item.count}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-slate-300 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-bold">SKU Mapping Coverage</div>
            <div className="grid grid-cols-2 gap-4 p-5">
              {summary.marketplaces.map((place) => (
                <div key={place}>
                  <div className="flex items-end gap-3">
                    <span className="block w-20 bg-sky-600" style={{ height: `${42 + (summary.mappedCounts[place.toLowerCase()] ?? 1) * 10}px` }} />
                    <div>
                      <p className="text-2xl font-bold">{summary.mappedCounts[place.toLowerCase()] ?? 0}</p>
                      <p className="text-xs font-semibold text-slate-500">{place}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="col-span-2 rounded-sm bg-gradient-to-r from-red-400 via-orange-300 to-yellow-200 px-4 py-8 text-center text-sm font-bold text-slate-700">
                Revenue in scope: Rs. {metrics.revenue.toLocaleString('en-IN')}
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  function renderOrders() {
    return (
      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button onClick={() => updateSelectedOrders('Accepted')} className="inline-flex h-9 items-center gap-2 rounded bg-emerald-600 px-4 text-sm font-bold text-white"><Check size={16} />Accept</button>
            <button onClick={() => updateSelectedOrders('Rejected')} className="inline-flex h-9 items-center gap-2 rounded bg-red-600 px-4 text-sm font-bold text-white"><X size={16} />Reject</button>
            <button onClick={() => updateSelectedOrders('Allocated')} className="inline-flex h-9 items-center gap-2 rounded bg-orange-500 px-4 text-sm font-bold text-white"><PackageCheck size={16} />Allocate</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setOrderSearch(''); setChannelFilter('all'); }} className="inline-flex h-9 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-bold"><X size={15} />Reset</button>
            <button onClick={exportOrders} className="inline-flex h-9 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-bold"><FileDown size={15} />Export</button>
          </div>
        </div>

        <div className="border border-slate-300 bg-white">
          <div className="flex border-b border-slate-300 bg-[#ededf7] text-sm font-bold">
            <button className="border-b-2 border-red-500 bg-white px-4 py-2">Pending Acknowledgement</button>
            <button className="px-4 py-2">Acknowledgement History</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1720px] text-left text-sm">
              <thead>
                <tr className="bg-[#e8e8f2] text-xs font-bold text-slate-700">
                  <th className="w-11 border border-slate-300 px-3 py-2"><input type="checkbox" checked={filteredOrders.length > 0 && filteredOrders.every((order) => selectedOrders.includes(order.id))} onChange={toggleAllOrders} /></th>
                  {['Ext Order No', 'Order No', 'Channel Name', 'Order Type', 'Order Date', 'SKU Code', 'SKU Desc', 'Walkin Location', 'Fulfillment Location', 'Order Qty', 'Line No', 'Line Amount', 'Status', 'Customer'].map((heading) => (
                    <th key={heading} className="border border-slate-300 px-3 py-2">{heading}</th>
                  ))}
                </tr>
                <tr className="bg-[#e8e8f2]">
                  <th className="border border-slate-300 px-3 py-2" />
                  <th className="border border-slate-300 px-2 py-1"><SmallInput value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} /></th>
                  <th className="border border-slate-300 px-2 py-1"><SmallInput value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} /></th>
                  <th className="border border-slate-300 px-2 py-1">
                    <SmallSelect value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)}>
                      <option value="all">Select option</option>
                      {channels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
                    </SmallSelect>
                  </th>
                  <th className="border border-slate-300 px-2 py-1"><SmallSelect><option>--- Select ---</option><option>Prepaid</option><option>COD</option></SmallSelect></th>
                  <th className="border border-slate-300 px-2 py-1"><SmallInput placeholder="03/07/2026 - 10/07/2026" /></th>
                  <th className="border border-slate-300 px-2 py-1"><SmallInput value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} /></th>
                  <th colSpan={8} className="border border-slate-300 px-2 py-1" />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => (
                  <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#ededf7]'}>
                    <td className="border-y border-slate-100 px-3 py-4"><input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => setSelectedOrders((current) => current.includes(order.id) ? current.filter((id) => id !== order.id) : [...current, order.id])} /></td>
                    <td className="border-y border-slate-100 px-3 py-4 font-bold text-blue-600">{order.extOrderNo}</td>
                    <td className="border-y border-slate-100 px-3 py-4 font-semibold">{order.orderNo}</td>
                    <td className="border-y border-slate-100 px-3 py-4">{order.channelName}</td>
                    <td className="border-y border-slate-100 px-3 py-4">{order.orderType}</td>
                    <td className="border-y border-slate-100 px-3 py-4">{order.orderDate}</td>
                    <td className="border-y border-slate-100 px-3 py-4 font-mono text-xs">{order.skuCode}</td>
                    <td className="border-y border-slate-100 px-3 py-4">{order.skuDesc}</td>
                    <td className="border-y border-slate-100 px-3 py-4">{order.walkinLocation}</td>
                    <td className="border-y border-slate-100 px-3 py-4">{order.fulfillmentLocation}</td>
                    <td className="border-y border-slate-100 px-3 py-4 text-right">{order.orderQty.toFixed(3)}</td>
                    <td className="border-y border-slate-100 px-3 py-4 text-center">{order.lineNo}</td>
                    <td className="border-y border-slate-100 px-3 py-4 text-right">{order.lineAmount.toFixed(2)}</td>
                    <td className="border-y border-slate-100 px-3 py-4"><span className={`rounded border px-2 py-1 text-xs font-bold ${toneForStatus(order.status)}`}>{order.status}</span></td>
                    <td className="border-y border-slate-100 px-3 py-4">{order.customer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-300 bg-[#ededf7] px-3 py-2 text-xs text-slate-600">
            <span>Page 1 of 1</span>
            <span>View 1 - {filteredOrders.length} of {filteredOrders.length}</span>
          </div>
        </div>
      </section>
    );
  }

  function renderPicklist() {
    return (
      <section className="space-y-4">
        <div className="flex justify-end gap-2">
          <button onClick={() => setWaveForm(emptyWave)} className="inline-flex h-9 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-bold"><X size={15} />Reset</button>
          <button onClick={generatePicklist} className="inline-flex h-9 items-center gap-2 rounded bg-orange-500 px-4 text-sm font-bold text-white"><ListChecks size={15} />Generate Picklist</button>
          <button onClick={() => setNotice('Wave filter saved.')} className="inline-flex h-9 items-center gap-2 rounded bg-amber-500 px-4 text-sm font-bold text-white"><Check size={15} />Save Wave Filter</button>
        </div>

        <div className="border border-slate-300 bg-white">
          <div className="flex border-b border-slate-300 bg-[#ededf7] text-sm font-bold">
            <button className="px-4 py-2">Enquiry Picklist</button>
            <button className="border-b-2 border-red-500 bg-white px-4 py-2">Generate SKU Wise Picklist</button>
            <button className="px-4 py-2">Manage Wave</button>
            <button className="px-4 py-2">Template</button>
          </div>
          <div className="p-4">
            <div className="mb-3 flex gap-8 rounded border border-slate-200 px-5 py-3 text-sm">
              <label className="flex items-center gap-3"><input type="radio" name="mode" />Show Order List</label>
              <label className="flex items-center gap-3"><input type="radio" name="mode" defaultChecked />By Zone/Bin</label>
            </div>

            <fieldset className="border border-slate-300 px-5 pb-5 pt-3">
              <legend className="px-2 text-sm font-bold text-slate-400">Mandatory Section</legend>
              <div className="grid gap-x-12 gap-y-2 xl:grid-cols-3">
                <div className="space-y-2">
                  <Field label="Zone*"><SmallInput value={waveForm.zone} onChange={(event) => setWaveForm({ ...waveForm, zone: event.target.value })} placeholder="A" /></Field>
                  <Field label="Picklist Type"><SmallSelect value={waveForm.picklistType} onChange={(event) => setWaveForm({ ...waveForm, picklistType: event.target.value })}><option>--- Select ---</option><option>Full</option><option>Part</option></SmallSelect></Field>
                  <Field label="Count Of Order Per Picklist"><div className="grid grid-cols-2 gap-1"><SmallInput placeholder="Min" /><SmallInput placeholder="Max" /></div></Field>
                  <Field label="Order exists in selected Zone"><SmallSelect><option>--- Select ---</option><option>Full</option><option>Part</option></SmallSelect></Field>
                  <Field label="Ship By Date"><SmallInput /></Field>
                  <Field label="Grouping Sequence"><SmallInput /></Field>
                </div>
                <div className="space-y-2">
                  <Field label="Bin Range"><div className="grid grid-cols-[1fr_24px_1fr] gap-1"><SmallInput value={waveForm.binFrom} onChange={(event) => setWaveForm({ ...waveForm, binFrom: event.target.value })} /><span className="text-center">-</span><SmallInput value={waveForm.binTo} onChange={(event) => setWaveForm({ ...waveForm, binTo: event.target.value })} /></div></Field>
                  <Field label="Min Qty in Picklist*"><SmallInput value={waveForm.minQty} onChange={(event) => setWaveForm({ ...waveForm, minQty: event.target.value })} /></Field>
                  <Field label="Order Processing"><SmallSelect value={waveForm.orderProcessing} onChange={(event) => setWaveForm({ ...waveForm, orderProcessing: event.target.value })}><option>B2C</option><option>B2B</option></SmallSelect></Field>
                  <Field label="Order Allocate Zone"><SmallSelect><option>--select--</option><option>Same Zone</option><option>Any Zone</option></SmallSelect></Field>
                  <Field label="Split Zone Wise Picklist"><input type="checkbox" /></Field>
                  <Field label="Max No. of Picklist Count"><SmallSelect><option>--select--</option><option>5</option><option>10</option></SmallSelect></Field>
                </div>
                <div className="space-y-2">
                  <Field label="Aisle"><SmallInput value={waveForm.aisle} onChange={(event) => setWaveForm({ ...waveForm, aisle: event.target.value })} /></Field>
                  <Field label="Max Qty in Picklist*"><SmallSelect value={waveForm.maxQty} onChange={(event) => setWaveForm({ ...waveForm, maxQty: event.target.value })}><option>--- Select ---</option><option>25</option><option>50</option></SmallSelect></Field>
                  <Field label="Wave Description*"><SmallInput value={waveForm.waveDescription} onChange={(event) => setWaveForm({ ...waveForm, waveDescription: event.target.value })} /></Field>
                  <Field label="Picklist Tag"><SmallInput /></Field>
                  <Field label="OnHold"><SmallSelect><option>No</option><option>Yes</option></SmallSelect></Field>
                  <Field label="Max. Volume Per Order in Picklist"><SmallInput /></Field>
                </div>
              </div>
              <p className="mt-3 text-sm font-bold">*Either of the parameters in this section is mandatory.</p>
            </fieldset>

            <fieldset className="mt-4 border border-slate-300 px-5 pb-5 pt-3">
              <legend className="px-2 text-sm font-bold text-slate-400">Optional Section</legend>
              <div className="grid gap-x-12 gap-y-2 xl:grid-cols-3">
                {[
                  ['Channel', 'channel'],
                  ['Order Type', 'orderType'],
                  ['Order Date', 'orderDate'],
                  ['Customer Code', 'customer'],
                  ['Category', 'category'],
                  ['Order Status', 'orderStatus'],
                  ['Order No', 'orderNo'],
                  ['Delivery No', 'deliveryNo'],
                  ['Fulfilled By', 'fulfilledBy'],
                  ['Delivery Slot', 'slot'],
                  ['Order Tag', 'tag'],
                  ['SLA with in Hrs.', 'sla']
                ].map(([label]) => (
                  <Field key={label} label={label}><SmallInput /></Field>
                ))}
                <Field label="Brand"><textarea value={waveForm.brand} onChange={(event) => setWaveForm({ ...waveForm, brand: event.target.value })} className="min-h-14 rounded border border-slate-300 px-2 text-sm" placeholder="Max 10 Comma Separated" /></Field>
                <Field label="Shipping Pincode"><textarea className="min-h-14 rounded border border-slate-300 px-2 text-sm" placeholder="Max 10 Comma Separated" /></Field>
                <Field label="SKU Code"><textarea value={waveForm.skuCode} onChange={(event) => setWaveForm({ ...waveForm, skuCode: event.target.value })} className="min-h-14 rounded border border-slate-300 px-2 text-sm" placeholder="Max 50 Comma Separated" /></Field>
              </div>
            </fieldset>
          </div>
        </div>

        <div className="border border-slate-300 bg-white">
          <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold">Generated Waves</div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[#e8e8f2] text-xs font-bold">
              <tr>{['Wave No', 'Zone', 'Type', 'Orders', 'Qty', 'Status', 'Created'].map((heading) => <th key={heading} className="px-3 py-2">{heading}</th>)}</tr>
            </thead>
            <tbody>
              {(waves.length ? waves : [{ id: 'WAVE-0000', zone: '-', picklistType: '-', orders: 0, qty: 0, status: 'Draft' as const, createdAt: '-' }]).map((wave) => (
                <tr key={wave.id} className="border-t border-slate-100">
                  <td className="px-3 py-3 font-bold text-blue-600">{wave.id}</td>
                  <td className="px-3 py-3">{wave.zone}</td>
                  <td className="px-3 py-3">{wave.picklistType}</td>
                  <td className="px-3 py-3">{wave.orders}</td>
                  <td className="px-3 py-3">{wave.qty}</td>
                  <td className="px-3 py-3">{wave.status}</td>
                  <td className="px-3 py-3">{wave.createdAt === '-' ? '-' : new Date(wave.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function renderMapping() {
    return (
      <div className={`grid gap-4 ${showForm ? 'xl:grid-cols-[430px_1fr]' : ''}`}>
        {showForm ? (
          <aside className="border border-slate-300 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold">{editing ? 'Edit OMS code' : 'Create OMS code'}</h2>
              <button onClick={() => { setEditing(null); setShowForm(false); setForm(emptyForm); setNotice('Form closed.'); }}><X size={18} /></button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {formFields.map((field) => (
                <input
                  key={field.key}
                  className={`h-9 rounded border border-slate-300 px-2 text-sm ${field.key === 'productName' ? 'md:col-span-2' : ''}`}
                  placeholder={field.label}
                  value={form[field.key]}
                  onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                />
              ))}
            </div>
            <button onClick={save} className="mt-3 inline-flex h-9 items-center gap-2 rounded bg-sky-600 px-4 text-sm font-bold text-white"><Plus size={16} />Save OMS row</button>
          </aside>
        ) : null}

        <section>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button onClick={createNew} className="inline-flex h-9 items-center gap-2 rounded bg-emerald-600 px-4 text-sm font-bold text-white"><Plus size={16} />Create OMS Code</button>
            <input ref={fileInputRef} className="hidden" type="file" accept=".csv,.tsv,.txt,.xls" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadTemplate(file); }} />
            <button onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded bg-fuchsia-600 px-4 text-sm font-bold text-white"><Upload size={16} />BulkUpdate</button>
            <select className="h-9 rounded border border-slate-300 bg-white px-3 text-sm" value={downloadFormat} onChange={(event) => setDownloadFormat(event.target.value)}>
              <option value="csv">CSV</option>
              <option value="xls">XLS</option>
              <option value="json">JSON</option>
              <option value="tsv">TSV</option>
            </select>
            <button onClick={() => downloadRows(downloadFormat)} className="inline-flex h-9 items-center gap-2 rounded bg-orange-500 px-4 text-sm font-bold text-white"><Download size={16} />Download</button>
          </div>

          <div className="mb-3 grid gap-2 lg:grid-cols-[1fr_170px_170px_170px_170px]">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input className="h-9 w-full rounded border border-slate-300 bg-white pl-9 text-sm" placeholder="Search barcode, SKU, VAN, product, brand" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <SmallSelect value={marketplace} onChange={(event) => setMarketplace(event.target.value)}><option value="all">All marketplaces</option>{summary.marketplaces.map((item) => <option key={item} value={item}>{item}</option>)}</SmallSelect>
            <SmallSelect value={brand} onChange={(event) => setBrand(event.target.value)}><option value="all">All brands</option>{summary.brands.map((item) => <option key={item} value={item}>{item}</option>)}</SmallSelect>
            <SmallSelect value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All categories</option>{summary.categories.map((item) => <option key={item} value={item}>{item}</option>)}</SmallSelect>
            <SmallSelect value={barcode} onChange={(event) => setBarcode(event.target.value)}><option value="all">All barcodes</option>{(summary.barcodes ?? Object.keys(summary.barcodeCounts ?? {})).map((item) => <option key={item} value={item}>{item}</option>)}</SmallSelect>
          </div>

          <div className="overflow-x-auto border border-slate-300 bg-white">
            <table className="w-full min-w-[1500px] text-left text-sm">
              <thead className="bg-[#e8e8f2] text-xs uppercase text-slate-600">
                <tr>{['Bar Code', 'Market Place', 'Brand', 'Style Id', 'VAN', 'Seller SKU', 'Master SKU', 'SKU CODE', 'Size', 'Material', 'Pack', 'Style', 'Product Name', 'Category', 'Actions'].map((heading) => <th key={heading} className="border border-slate-300 px-3 py-2">{heading}</th>)}</tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#ededf7]'}>
                    <td className="px-3 py-3 font-bold">{item.barcode}</td>
                    <td className="px-3 py-3"><span className={`inline-flex rounded border px-2 py-1 text-xs font-bold ${marketplaceTone(item.marketPlace)}`}>{item.marketPlace}</span></td>
                    <td className="px-3 py-3">{item.brand}</td>
                    <td className="px-3 py-3">{item.styleId}</td>
                    <td className="px-3 py-3 font-mono text-xs">{item.van}</td>
                    <td className="px-3 py-3 font-mono text-xs font-bold text-blue-600">{item.sellerSku}</td>
                    <td className="px-3 py-3 font-mono text-xs">{item.masterSku}</td>
                    <td className="px-3 py-3 font-mono text-xs">{item.skuCode}</td>
                    <td className="px-3 py-3">{item.size}</td>
                    <td className="px-3 py-3">{item.material}</td>
                    <td className="px-3 py-3">{item.packOf}</td>
                    <td className="px-3 py-3">{item.style}</td>
                    <td className="max-w-[300px] px-3 py-3">{item.productName}</td>
                    <td className="px-3 py-3">{item.category}</td>
                    <td className="px-3 py-3"><div className="flex gap-2"><button onClick={() => edit(item)} className="rounded border p-2"><Pencil size={15} /></button><button onClick={() => remove(item.id)} className="rounded border border-red-200 bg-red-50 p-2 text-red-700"><Trash2 size={15} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  function renderSimpleOperation(title: string, action: OrderStatus) {
    return (
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="border border-slate-300 bg-white p-4">
          <h2 className="mb-3 text-base font-bold">{title}</h2>
          <div className="space-y-2">
            <Field label="Channel"><SmallSelect value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)}><option value="all">All Channels</option>{channels.map((channel) => <option key={channel}>{channel}</option>)}</SmallSelect></Field>
            <Field label="Order No"><SmallInput value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} /></Field>
            <Field label="Delivery Type"><SmallSelect><option>--- Select ---</option><option>Standard</option><option>Express</option></SmallSelect></Field>
            <Field label="Transporter"><SmallSelect><option>--- Select ---</option><option>Blue Dart</option><option>Delhivery</option></SmallSelect></Field>
            <Field label="Manifest"><SmallInput placeholder="Auto generated" /></Field>
          </div>
          <button onClick={() => updateSelectedOrders(action)} className="mt-4 inline-flex h-9 items-center gap-2 rounded bg-sky-600 px-4 text-sm font-bold text-white"><Check size={15} />Apply {action}</button>
        </section>
        {renderOrders()}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-800">
      <div className="flex min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-20 w-[62px] bg-[#20333a] text-slate-200">
          <div className="flex h-16 items-center justify-center border-b border-white/10 bg-white">
            <span className="grid h-11 w-11 place-items-center rounded-sm border-2 border-red-500 text-3xl font-black text-red-600">e</span>
          </div>
          <nav className="grid">
            {[
              [LayoutDashboard, 'dashboard'],
              [ListChecks, 'acknowledgement'],
              [ShoppingCart, 'picklist'],
              [Archive, 'mapping'],
              [RefreshCw, 'split'],
              [UserPlus, 'handover'],
              [Settings, 'shipping']
            ].map(([Icon, tab]) => (
              <button key={tab as string} onClick={() => setActiveTab(tab as OmsTab)} className={`grid h-14 place-items-center border-b border-white/10 ${(activeTab === tab) ? 'bg-[#16252a] text-white' : 'hover:bg-white/5'}`} title={tab as string}>
                <Icon size={22} />
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 pl-[62px]">
          <header className="sticky top-0 z-10 bg-[#368eb6] text-white shadow-sm">
            <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-2">
              <div className="flex items-center gap-3">
                <a href="/" className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><ArrowLeft size={22} /></a>
                <div className="flex max-w-4xl flex-wrap gap-2">
                  {quickTabs.map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)} className={`inline-flex h-8 items-center gap-1 rounded px-3 text-sm font-bold shadow-sm ${activeTab === key ? 'bg-[#ff1762]' : 'bg-[#b000d4]'}`}>
                      <Icon size={14} />{label}<X size={13} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">JX Karawaci</span>
                <select className="h-9 rounded-l bg-[#277aa2] px-3 text-sm font-bold outline-none"><option>Web Order No</option><option>SKU Code</option></select>
                <div className="relative">
                  <input className="h-9 w-52 rounded-r bg-white pl-3 pr-9 text-slate-800 outline-none" value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} />
                  <Search className="absolute right-2 top-2 text-slate-500" size={18} />
                </div>
              </div>
            </div>
          </header>

          <div className="border-b border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-600">
            WMS <span className="px-2 text-slate-400">&gt;</span> Order Processing <span className="px-2 text-slate-400">&gt;</span> <span className="text-slate-800">{activeTab === 'mapping' ? 'OMS Code Table' : activeTab.replace(/^\w/, (char) => char.toUpperCase())}</span>
          </div>

          <section className="p-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-600">{notice}</p>
              <div className="flex gap-2">
                <button onClick={() => setActiveTab('dashboard')} className="inline-flex h-9 items-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-bold"><LayoutDashboard size={15} />Dashboard</button>
                <button onClick={() => setActiveTab('mapping')} className="inline-flex h-9 items-center gap-2 rounded bg-sky-600 px-4 text-sm font-bold text-white"><Archive size={15} />OMS Codes</button>
              </div>
            </div>

            {activeTab === 'dashboard' ? renderDashboard() : null}
            {activeTab === 'acknowledgement' ? renderOrders() : null}
            {activeTab === 'picklist' ? renderPicklist() : null}
            {activeTab === 'mapping' ? renderMapping() : null}
            {activeTab === 'shipping' ? renderSimpleOperation('Delivery Shipping', 'Shipped') : null}
            {activeTab === 'split' ? renderSimpleOperation('Delivery Split', 'Allocated') : null}
            {activeTab === 'handover' ? renderSimpleOperation('Shipment Handover', 'Shipped') : null}
          </section>

          <footer className="fixed bottom-0 left-[62px] right-0 border-t border-slate-300 bg-white px-5 py-1 text-xs text-slate-600">
            <span>Copyright © 2012 <strong className="text-sky-600">Vinculum Solutions Pvt Ltd.</strong></span>
            <span className="float-right">All rights reserved. Version 9.3.186</span>
          </footer>
        </div>
      </div>
    </main>
  );
}
