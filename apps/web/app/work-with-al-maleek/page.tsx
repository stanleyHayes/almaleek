import { PublicActionForm } from '@/components/public-action-form';

export default function WorkWithALMaleekPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">Work with AL Maleek</p>
          <h1>Build a partnership that feels native to culture.</h1>
          <p className="lede">
            From appearances and campaigns to live events, sponsorships, and production, AL Maleek
            creates premium, high-trust opportunities for brands and organizations that want to connect
            with an engaged audience in a way that feels authentic, not forced.
          </p>
        </div>
      </header>

      <section className="section-block">
        <div className="container">
          <div className="card-grid three-up">
            <article className="detail-card">
              <span className="card-kicker">Brand deals</span>
              <h3>Campaigns & activations</h3>
              <p>High-impact partnerships designed to build visibility, community trust, and measurable response.</p>
            </article>
            <article className="detail-card">
              <span className="card-kicker">Events</span>
              <h3>Appearances & hostings</h3>
              <p>On-stage talent, live hosting, and branded experiences that convert attention into attendance.</p>
            </article>
            <article className="detail-card">
              <span className="card-kicker">Productions</span>
              <h3>Collaborative content</h3>
              <p>Story-led creative work that blends talent, narrative, and distribution without losing the brand voice.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-block muted-block">
        <div className="container detail-grid">
          <div className="detail-card">
            <p className="eyebrow">What partners get</p>
            <h2>A clear, structured path from brief to launch.</h2>
            <ul className="detail-list">
              <li>Audience and engagement context for qualified commercial conversations.</li>
              <li>Creative options tailored to live experiences, content, events, and brand storytelling.</li>
              <li>Transparent process from inquiry to proposal, execution, and post-campaign follow-up.</li>
            </ul>
          </div>

          <PublicActionForm kind="work" />
        </div>
      </section>
    </div>
  );
}
