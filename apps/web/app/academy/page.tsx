import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Academy',
  description:
    'AL Maleek Academy gives aspiring creators, operators, and performers practical education that translates into real income, stronger positioning, and sustainable creative growth.',
  path: '/academy',
  keywords: ['creator education', 'creative business training Ghana'],
});

export default function AcademyPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">Academy</p>
          <h1>Learn the craft. Build the business. Grow with clarity.</h1>
          <p className="lede">
            AL Maleek Academy is designed for aspiring creators, operators, and performers who want practical
            education that translates into real income, stronger positioning, and more sustainable creative growth.
          </p>
        </div>
      </header>

      <section className="section-block">
        <div className="container card-grid three-up">
          <article className="detail-card">
            <span className="card-kicker">Creator growth</span>
            <h3>Content strategy</h3>
            <p>Build a consistent creator engine without losing your voice, attention, or creative momentum.</p>
          </article>
          <article className="detail-card">
            <span className="card-kicker">Comedy & performance</span>
            <h3>Craft & delivery</h3>
            <p>Strengthen stage presence, storytelling, and messaging so your ideas land with real audiences.</p>
          </article>
          <article className="detail-card">
            <span className="card-kicker">Business systems</span>
            <h3>Creator operations</h3>
            <p>Learn the frameworks behind monetization, partnerships, packaging, and repeatable growth.</p>
          </article>
        </div>
      </section>

      <section className="section-block muted-block">
        <div className="container detail-grid">
          <div className="detail-card">
            <p className="eyebrow">Why learners stay</p>
            <h2>Actionable education built around real-world creative business.</h2>
            <ul className="detail-list">
              <li>Practical modules covering content, brand, and business growth.</li>
              <li>Creator-first learning paths with clear outcomes and meaningful action.</li>
              <li>Premium education that reinforces trust and long-term brand value.</li>
            </ul>
          </div>

          <PublicActionForm kind="academy" />
        </div>
      </section>
    </div>
  );
}
