import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';
import { DEFAULT_SITE_CONTENT, getSiteContent } from '@/lib/site-content';

const fallbackArt = [
  '/media/academy-content.svg',
  '/media/academy-comedy.svg',
  '/media/academy-business.svg',
];

export const metadata = pageMetadata({
  title: 'Academy',
  description:
    'AL Maleek Academy gives aspiring creators, operators, and performers practical education that translates into real income, stronger positioning, and sustainable creative growth.',
  path: '/academy',
  keywords: ['creator education', 'creative business training Ghana'],
});

export default async function AcademyPage() {
  const { academy } = (await getSiteContent()).pages;
  const cards = academy.cards.length
    ? academy.cards
    : DEFAULT_SITE_CONTENT.pages.academy.cards;
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">{academy.hero.eyebrow}</p>
          <h1>{academy.hero.headline}</h1>
          <p className="lede">{academy.hero.lede}</p>
        </div>
      </header>

      <section className="section-block">
        <div className="container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="section-art"
            src="/media/academy-workshop.svg"
            alt="Illustration of an Al Maleek Academy workshop"
            loading="lazy"
          />
        </div>
      </section>

      {cards.map((card, index) => {
        const points = card.points?.length
          ? card.points
          : DEFAULT_SITE_CONTENT.pages.academy.cards[index]?.points ?? [];
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
                <p className="offering-points-label">What you walk away with</p>
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
            <p className="eyebrow">{academy.muted_eyebrow}</p>
            <h2>{academy.muted_heading}</h2>
            <ul className="detail-list">
              {academy.muted_points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <PublicActionForm kind="academy" />
        </div>
      </section>
    </div>
  );
}
