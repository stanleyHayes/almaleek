import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';
import { DEFAULT_SITE_CONTENT, getSiteContent } from '@/lib/site-content';

const fallbackArt = [
  '/media/work-campaigns.svg',
  '/media/work-appearances.svg',
  '/media/work-collab.svg',
];

export const metadata = pageMetadata({
  title: 'Work With AL Maleek',
  description:
    'Book Ghanaian comedy that delivers: appearances, skits, campaigns, live events, sponsorships, and production — premium, high-trust opportunities for brands that want to connect with an engaged audience authentically.',
  path: '/work-with-al-maleek',
  keywords: ['book AL Maleek', 'brand collaboration Ghana', 'event appearances'],
});

export default async function WorkWithALMaleekPage() {
  const { work_with: workWith } = (await getSiteContent()).pages;
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">{workWith.hero.eyebrow}</p>
          <h1>{workWith.hero.headline}</h1>
          <p className="lede">{workWith.hero.lede}</p>
        </div>
      </header>

      {workWith.cards.map((card, index) => {
        const points = card.points?.length
          ? card.points
          : DEFAULT_SITE_CONTENT.pages.work_with.cards[index]?.points ?? [];
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
                <p className="offering-points-label">What you get</p>
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
            <p className="eyebrow">{workWith.muted_eyebrow}</p>
            <h2>{workWith.muted_heading}</h2>
            <ul className="detail-list">
              {workWith.muted_points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <PublicActionForm kind="work" />
        </div>
      </section>
    </div>
  );
}
