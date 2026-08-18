import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/site-content';

export const metadata = pageMetadata({
  title: 'Partnerships',
  description:
    'AL Maleek partnerships create value for brands and community — clear, premium, and structured around real alignment, not superficial promotions.',
  path: '/partnerships',
  keywords: ['brand partnerships Ghana', 'cultural marketing Africa', 'sponsorship Ghana'],
});

export default async function PartnershipsPage() {
  const { partnerships } = (await getSiteContent()).pages;
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">{partnerships.hero.eyebrow}</p>
          <h1>{partnerships.hero.headline}</h1>
          <p className="lede">{partnerships.hero.lede}</p>
        </div>
      </header>

      <section className="section-block">
        <div className="container card-grid three-up">
          {partnerships.cards.map((card) => (
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
