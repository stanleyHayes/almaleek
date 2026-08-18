import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/site-content';

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

      <section className="section-block">
        <div className="container">
          <div className="card-grid three-up">
            {workWith.cards.map((card) => (
              <article className="detail-card" key={card.title}>
                <span className="card-kicker">{card.kicker}</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

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
