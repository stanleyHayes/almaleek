import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/site-content';

export const metadata = pageMetadata({
  title: 'Shop',
  description:
    'AL Maleek Shop is where fandom meets identity: own the catchphrases with limited-edition pieces, event merch, and digital products that carry the culture beyond the screen.',
  path: '/shop',
  keywords: ['AL Maleek shop', 'culture merch', 'limited edition drops Ghana'],
});

export default async function ShopPage() {
  const { shop } = (await getSiteContent()).pages;
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">{shop.hero.eyebrow}</p>
          <h1>{shop.hero.headline}</h1>
          <p className="lede">{shop.hero.lede}</p>
        </div>
      </header>

      <section className="section-block">
        <div className="container card-grid three-up">
          {shop.cards.map((card, index) => (
            <article className="detail-card media-card" key={card.title}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="media-thumb"
                src={`/media/shop-${['tee', 'cap', 'hoodie'][index % 3]}.svg`}
                alt=""
                loading="lazy"
              />
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
            <p className="eyebrow">{shop.muted_eyebrow}</p>
            <h2>{shop.muted_heading}</h2>
            <ul className="detail-list">
              {shop.muted_points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <PublicActionForm kind="shop" />
        </div>
      </section>
    </div>
  );
}
