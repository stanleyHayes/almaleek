import { PublicActionForm } from '@/components/public-action-form';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Partnerships',
  description:
    'AL Maleek partnerships create value for brands and community — clear, premium, and structured around real alignment, not superficial promotions.',
  path: '/partnerships',
  keywords: ['brand partnerships Ghana', 'cultural marketing Africa', 'sponsorship Ghana'],
});

export default function PartnershipsPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">Partnerships</p>
          <h1>Build campaigns and collaborations around culture, trust, and reach.</h1>
          <p className="lede">
            AL Maleek partnerships are designed to create value for both brands and the community—clear,
            premium, and structured around real alignment, not superficial promotions.
          </p>
        </div>
      </header>

      <section className="section-block">
        <div className="container card-grid three-up">
          <article className="detail-card">
            <span className="card-kicker">Campaigns</span>
            <h3>Audience-first marketing</h3>
            <p>Partnerships designed to integrate naturally into the brand and community experience with intent.</p>
          </article>
          <article className="detail-card">
            <span className="card-kicker">Sponsorships</span>
            <h3>Event & activation support</h3>
            <p>Strategic sponsor opportunities tied to live experiences, community moments, and cultural visibility.</p>
          </article>
          <article className="detail-card">
            <span className="card-kicker">Network</span>
            <h3>Creative ecosystem</h3>
            <p>Connect with collaborators, talent, and partners building bigger opportunities around the brand.</p>
          </article>
        </div>
      </section>

      <section className="section-block muted-block">
        <div className="container detail-grid">
          <div className="detail-card">
            <p className="eyebrow">Partnership model</p>
            <h2>A structured path from fit assessment to launch.</h2>
            <ul className="detail-list">
              <li>Review campaign objectives, audience fit, and activation goals before work begins.</li>
              <li>Professional proposal and clear commercial framing built around mutual value.</li>
              <li>Operational planning, execution support, and reporting with a partner-first mindset.</li>
            </ul>
          </div>

          <PublicActionForm kind="partnership" />
        </div>
      </section>
    </div>
  );
}
