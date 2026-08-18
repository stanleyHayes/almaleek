import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/site-content';

export const metadata = pageMetadata({
  title: 'AL Maleek Live',
  description:
    'Discover AL Maleek Live: comedy nights, premieres, campus events, creator showcases, and intimate live moments that bring the audience together.',
  path: '/events/live',
  keywords: ['AL Maleek Live', 'comedy shows Accra', 'campus events Ghana', 'event tickets Ghana'],
});

export default async function LivePage() {
  const { live } = (await getSiteContent()).pages;
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">{live.hero.eyebrow}</p>
          <h1>{live.hero.headline}</h1>
          <p className="lede">{live.hero.lede}</p>
        </div>
      </header>

      <section className="section-block">
        <div className="container card-grid three-up">
          {live.events.map((event, index) => (
            <article className="detail-card media-card" key={event.title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="media-thumb"
                src={event.image || `/media/poster-${(index % 3) + 1}.svg`}
                alt=""
                loading="lazy"
              />
              <span className="card-kicker">{event.date}</span>
              <h3>{event.title}</h3>
              <p>{event.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block muted-block">
        <div className="container detail-grid">
          <div className="detail-card">
            <p className="eyebrow">{live.muted_eyebrow}</p>
            <h2>{live.muted_heading}</h2>
            <ul className="detail-list">
              {live.muted_points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <PublicActionForm kind="ticket" />
        </div>
      </section>
    </div>
  );
}
