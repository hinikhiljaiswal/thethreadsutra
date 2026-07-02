'use client';

import { ArrowRight, PackageCheck, Plug, ShoppingBag, Table2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AppShell } from './app-shell';
import { apiUrl, sampleSummary, type IntegrationSummary } from '../lib/integrations';
import { sampleOmsSummary, type OmsSummary } from '../lib/oms';

export function DashboardPage() {
  const [integrations, setIntegrations] = useState<IntegrationSummary>(sampleSummary);
  const [oms, setOms] = useState<OmsSummary>(sampleOmsSummary);

  useEffect(() => {
    fetch(`${apiUrl}/api/integrations/summary`)
      .then((response) => (response.ok ? response.json() : sampleSummary))
      .then(setIntegrations)
      .catch(() => setIntegrations(sampleSummary));
    fetch(`${apiUrl}/api/oms/summary`)
      .then((response) => (response.ok ? response.json() : sampleOmsSummary))
      .then(setOms)
      .catch(() => setOms(sampleOmsSummary));
  }, []);

  return (
    <AppShell title="Operations Dashboard" subtitle="Choose a focused module instead of working from one long page.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Integrations', `${integrations.total} channels`, '/integrations', Plug],
          ['Connected', `${integrations.connected} active`, '/integrations', PackageCheck],
          ['OMS variants', `${oms.variants} mappings`, '/oms', Table2],
          ['Flipkart', 'Live API setup', '/flipkart', ShoppingBag]
        ].map(([label, value, href, Icon]) => (
          <Link key={label as string} href={href as string} className="rounded-lg border border-black/10 bg-white p-5 transition hover:border-thread/40">
            <Icon className="text-thread" size={24} />
            <p className="mt-5 text-3xl font-black">{value as string}</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-black text-black/55">
              {label as string} <ArrowRight size={15} />
            </p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
