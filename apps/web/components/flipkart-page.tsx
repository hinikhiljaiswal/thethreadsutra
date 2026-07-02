'use client';

import { useEffect, useState } from 'react';
import { AppShell } from './app-shell';
import { sampleFlipkartProfile, type FlipkartProfile } from '../lib/flipkart';
import { apiUrl } from '../lib/integrations';

const emptyCredentials = { appId: '', appSecret: '', sellerId: '', locationId: '' };
const emptyInventory = { sku: 'TS-CAMS-PM-BG-S', productId: '', locationId: '', inventory: '10' };

export function FlipkartPage() {
  const [profile, setProfile] = useState<FlipkartProfile>(sampleFlipkartProfile);
  const [credentials, setCredentials] = useState(emptyCredentials);
  const [sku, setSku] = useState('TS-CAMS-PM-BG-S');
  const [inventory, setInventory] = useState(emptyInventory);
  const [shipmentFilter, setShipmentFilter] = useState('{"filter":{"type":"preDispatch","states":["APPROVED"]}}');
  const [result, setResult] = useState('No Flipkart request sent yet.');

  useEffect(() => {
    fetch(`${apiUrl}/api/portals/flipkart/profile`)
      .then((response) => (response.ok ? response.json() : sampleFlipkartProfile))
      .then(setProfile)
      .catch(() => setProfile(sampleFlipkartProfile));
  }, []);

  async function saveCredentials() {
    try {
      const response = await fetch(`${apiUrl}/api/portals/flipkart/credentials`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
      const data = await response.json();
      setProfile(data);
      setResult(JSON.stringify(data, null, 2));
      setCredentials(emptyCredentials);
    } catch (error) {
      setResult(`Request failed.\n\nAPI URL: ${apiUrl}\n\n${error instanceof Error ? error.message : 'Network error'}`);
    }
  }

  async function post(path: string, body?: unknown) {
    try {
      setResult('Sending request...');
      const response = await fetch(`${apiUrl}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      const text = await response.text();
      setResult(JSON.stringify(text ? JSON.parse(text) : {}, null, 2));
    } catch (error) {
      setResult(`Request failed.\n\nAPI URL: ${apiUrl}\n\n${error instanceof Error ? error.message : 'Network error'}`);
    }
  }

  return (
    <AppShell title="Flipkart Portal" subtitle="Configure DMILLS Global seller API access and run Flipkart listing, inventory and shipment actions.">
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-5">
          <div className="rounded-lg border border-black/10 bg-white p-5">
            <h2 className="text-xl font-black">Credentials</h2>
            <p className="mt-1 text-sm text-black/55">API Key and API Secret are from Flipkart Seller Developer Access.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ['appId', 'API Key'],
                ['appSecret', 'API Secret'],
                ['sellerId', 'Seller ID optional'],
                ['locationId', 'Location ID optional']
              ].map(([key, label]) => <input key={key} type={key === 'appSecret' ? 'password' : 'text'} className="h-11 rounded-md border border-black/10 px-3" placeholder={label} value={credentials[key as keyof typeof credentials]} onChange={(e) => setCredentials({ ...credentials, [key]: e.target.value })} />)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2"><button onClick={saveCredentials} className="h-11 rounded-md bg-ink px-4 font-black text-white">Save credentials</button><button onClick={() => post('/api/portals/flipkart/token')} className="h-11 rounded-md bg-thread px-4 font-black text-white">Generate token</button></div>
            <div className="mt-4 text-sm leading-6 text-black/55"><p>Company: {profile.companyName}</p><p>API Key: {profile.appId ?? 'Not configured'}</p><p>Seller ID: {profile.sellerId ?? 'Not configured'}</p><p>Location ID: {profile.locationId ?? 'Not configured'}</p><p>Token expiry: {profile.tokenExpiresAt ?? 'No token'}</p></div>
          </div>
          <div className="rounded-lg border border-black/10 bg-white p-5">
            <h2 className="text-xl font-black">Listing and inventory</h2>
            <input className="mt-4 h-11 w-full rounded-md border border-black/10 px-3" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Seller SKUs" />
            <button onClick={() => post('/api/portals/flipkart/listings/fetch', { skus: sku })} className="mt-3 h-11 w-full rounded-md bg-ink font-black text-white">Fetch listing by SKU</button>
            <div className="mt-4 grid gap-3 md:grid-cols-2">{Object.keys(emptyInventory).map((key) => <input key={key} className="h-11 rounded-md border border-black/10 px-3" placeholder={key} value={inventory[key as keyof typeof inventory]} onChange={(e) => setInventory({ ...inventory, [key]: e.target.value })} />)}</div>
            <button onClick={() => post('/api/portals/flipkart/inventory', { ...inventory, inventory: Number(inventory.inventory) })} className="mt-3 h-11 rounded-md bg-thread px-4 font-black text-white">Update inventory</button>
          </div>
        </section>
        <section className="space-y-5">
          <div className="rounded-lg border border-black/10 bg-white p-5"><h2 className="text-xl font-black">Shipment filter</h2><textarea className="mt-4 min-h-40 w-full rounded-md border border-black/10 p-3 font-mono text-xs" value={shipmentFilter} onChange={(e) => setShipmentFilter(e.target.value)} /><button onClick={() => post('/api/portals/flipkart/shipments/filter', JSON.parse(shipmentFilter || '{}'))} className="mt-3 h-11 rounded-md bg-ink px-4 font-black text-white">Filter shipments</button></div>
          <div className="rounded-lg border border-black/10 bg-[#1f2421] p-5 text-white"><h2 className="text-xl font-black">Flipkart response</h2><pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap text-xs leading-5 text-white/80">{result}</pre></div>
        </section>
      </div>
    </AppShell>
  );
}
