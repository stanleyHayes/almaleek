import type { Metadata } from "next";

export const SITE_NAME = "AL Maleek";
export const SITE_TAGLINE = "Culture in motion";
export const SITE_DESCRIPTION =
  "AL Maleek is the digital home for culture, community, creativity, and opportunity — live events, media, learning, commerce, and partnerships built for culture and business growth.";

/**
 * Absolute URL for a site path. Defaults to the production domain so canonical
 * and Open Graph URLs never leak a staging or request origin; set
 * NEXT_PUBLIC_SITE_URL per environment (see .env.example).
 */
export function siteUrl(path = "/"): string {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NEXT_PUBLIC_APP_ENV === "production"
      ? "https://almaleekgh.com"
      : "http://localhost:3000")
  ).replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Search keywords. These describe what AL Maleek actually offers — the terms
 * someone looking would type — rather than stuffing synonyms.
 *
 * Global terms apply everywhere; a page adds its own on top.
 */
const BRAND_KEYWORDS = [
  "AL Maleek",
  "almaleekgh",
  "Ghana culture brand",
  "creator community Ghana",
  "live events Accra",
  "comedy night Ghana",
  "creator academy Ghana",
  "African creator economy",
  "culture and community platform",
  "event merchandise Ghana",
];

export function keywordsFor(extra: readonly string[] = []): string[] {
  // De-duplicated case-insensitively so a page repeating a brand term does not
  // emit it twice.
  const seen = new Map<string, string>();
  for (const keyword of [...BRAND_KEYWORDS, ...extra]) {
    const value = keyword.trim();
    if (value) seen.set(value.toLowerCase(), value);
  }
  return [...seen.values()];
}

/** The generated brand card at /og is the share image for every page. */
export const SOCIAL_IMAGE = { url: "/og", width: 1200, height: 630 } as const;

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  /** Page-specific terms, added to the brand set. */
  keywords?: readonly string[];
}): Metadata {
  const url = siteUrl(input.path);
  return {
    title: input.title,
    description: input.description,
    keywords: keywordsFor(input.keywords),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_GH",
      title: input.title,
      description: input.description,
      url,
      images: [{ ...SOCIAL_IMAGE, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [SOCIAL_IMAGE.url],
    },
  };
}

/** JSON-LD with `<` escaped so the script body cannot break out of the tag. */
export function jsonLd(value: object) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
