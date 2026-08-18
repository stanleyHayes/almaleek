import './globals.css';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { SiteShell } from '@/components/site-shell';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  jsonLd,
  keywordsFor,
  siteUrl,
  SOCIAL_IMAGE,
} from '@/lib/seo';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: siteUrl('/'),
  logo: siteUrl('/brand/al-maleek-mark.png'),
  description: SITE_DESCRIPTION,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl('/')),
  title: {
    default: `${SITE_NAME} | Ghanaian Comedy, Skits & Community`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: keywordsFor(),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_GH',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: '/',
    images: [{ ...SOCIAL_IMAGE, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE.url],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteShell>{children}</SiteShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
