import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { AdminShell } from '../components/admin-shell';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'AL Maleek Admin',
  description: 'Administrative dashboard for AL Maleek operations and creator workflows.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body><AdminShell>{children}</AdminShell></body>
    </html>
  );
}
