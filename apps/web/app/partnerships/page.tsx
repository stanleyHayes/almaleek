import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';
import { DEFAULT_SITE_CONTENT, getSiteContent } from '@/lib/site-content';

const fallbackArt = [
  '/media/partner-campaigns.svg',
  '/media/partner-sponsorships.svg',
  '/media/partner-network.svg',
];

export const metadata = pageMetadata({
  title: 'Partnerships',
  description:
    'AL Maleek partnerships create value for brands and community — clear, premium, and structured around real alignment, not superficial promotions.',
  path: '/partnerships',
  keywords: ['brand partnerships Ghana', 'cultural marketing Africa', 'sponsorship Ghana'],
});

export default async function PartnershipsPage() {
  const { partnerships } = (await getSiteContent()).pages;
  const cards = partnerships.cards.length
    ? partnerships.cards
    : DEFAULT_SITE_CONTENT.pages.partnerships.cards;
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">{partnerships.hero.eyebrow}</p>
          <h1>{partnerships.hero.headline}</h1>
          <p className="lede">{partnerships.hero.lede}</p>
        </div>
      </header>

      {cards.map((card, index) => {
        const points = card.points?.length
          ? card.points
          : DEFAULT_SITE_CONTENT.pages.partnerships.cards[index]?.points ?? [];
        const image = card.image || fallbackArt[index % fallbackArt.length];
        return (
          <section className="section-block" key={card.title}>
            <div
              className={`container offering-grid${index % 2 === 1 ? ' offering-flip' : ''}`}
            >
              <div className="offering-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" loading="lazy" />
              </div>
              <div className="offering-copy">
                <span className="card-kicker">{card.kicker}</span>
                <h2>{card.title}</h2>
                <p>{card.text}</p>
                <p className="offering-points-label">What partners get</p>
                <ul className="detail-list">
                  {points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        );
      })}

      <section className="section-block muted-block">
        <div className="container detail-grid">
          <div className="detail-card">
            <p className="eyebrow">{partnerships.muted_eyebrow}</p>
            <h2>{partnerships.muted_heading}</h2>
            <ul className="detail-list">
              {partnerships.muted_points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <PublicActionForm kind="partnership" />
        </div>
      </section>
    </div>
  );
}
