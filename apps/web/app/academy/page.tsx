import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/site-content';

export const metadata = pageMetadata({
  title: 'Academy',
  description:
    'AL Maleek Academy gives aspiring creators, operators, and performers practical education that translates into real income, stronger positioning, and sustainable creative growth.',
  path: '/academy',
  keywords: ['creator education', 'creative business training Ghana'],
});

export default async function AcademyPage() {
  const { academy } = (await getSiteContent()).pages;
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
        <div className="container card-grid three-up">
          {academy.cards.map((card) => (
            <article className="detail-card" key={card.title}>
              <span className="card-kicker">{card.kicker}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

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
