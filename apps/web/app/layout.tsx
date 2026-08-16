import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { SiteShell } from '@/components/site-shell';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'AL Maleek | Culture, Community, Creativity, Opportunity',
  description:
    'AL Maleek is the digital home for community, events, commerce, learning, and partnerships built for culture and business growth.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
