import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Thread Sutra',
  description: 'Garments marketplace across Amazon, Flipkart, Myntra, and quick-commerce channels.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
