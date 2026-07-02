'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/integrations', label: 'Integrations' },
  { href: '/oms', label: 'OMS' },
  { href: '/flipkart', label: 'Flipkart' }
];

export function AppShell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-ink">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-2xl font-black">The Wisteria</p>
            <p className="text-sm text-black/55">DMILLS Global marketplace operations</p>
          </div>
          <nav className="flex gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 rounded-md border px-4 py-2 text-sm font-black ${
                    active ? 'border-ink bg-ink text-white' : 'border-black/10 bg-[#fbfaf7] text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-5 py-7">
        <div className="mb-6">
          <h1 className="text-4xl font-black">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-black/60">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
