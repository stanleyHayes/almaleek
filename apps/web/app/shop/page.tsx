import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Shop',
  description:
    'AL Maleek Shop is where fandom meets identity: limited-edition pieces, event merch, and digital products that carry the culture beyond the screen.',
  path: '/shop',
  keywords: ['AL Maleek shop', 'culture merch', 'limited edition drops Ghana'],
});

export default function ShopPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">Shop</p>
          <h1>Own the culture with premium drops and story-led merchandise.</h1>
          <p className="lede">
            AL Maleek Shop is where fandom meets identity: limited-edition pieces, event merch, and digital products
            that reflect the brand’s energy and give supporters a way to carry the culture beyond the screen.
          </p>
        </div>
      </header>

      <section className="section-block">
        <div className="container card-grid three-up">
          <article className="detail-card">
            <span className="card-kicker">Limited drop</span>
            <h3>Culture Tee Collection</h3>
            <p>Premium, wearable pieces made for fans who want style, comfort, and an unmistakable statement.</p>
          </article>
          <article className="detail-card">
            <span className="card-kicker">Event gear</span>
            <h3>Live Experience Merch</h3>
            <p>Commemorative products tied to signature nights, premieres, and community milestones.</p>
          </article>
          <article className="detail-card">
            <span className="card-kicker">Creator tools</span>
            <h3>Digital resources</h3>
            <p>Templates, prompts, and educational resources built for creators who want practical growth tools.</p>
          </article>
        </div>
      </section>

      <section className="section-block muted-block">
        <div className="container detail-grid">
          <div className="detail-card">
            <p className="eyebrow">Shop principles</p>
            <h2>Merch that feels like part of the story, not just a product add-on.</h2>
            <ul className="detail-list">
              <li>Limited-edition energy with scarcity and meaningful story context.</li>
              <li>Premium design language that still feels accessible and culturally relevant.</li>
              <li>Member-first access, drop alerts, and post-purchase retention built into the experience.</li>
            </ul>
          </div>

          <PublicActionForm kind="shop" />
        </div>
      </section>
    </div>
  );
}
