import { PublicActionForm } from '@/components/public-action-form';

export default function LivePage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">AL Maleek Live</p>
          <h1>High-energy experiences built for community, culture, and connection.</h1>
          <p className="lede">
            Discover comedy nights, premieres, campus events, creator showcases, and intimate live moments
            designed to bring together the audience in a premium but accessible way.
          </p>
        </div>
      </header>

      <section className="section-block">
        <div className="container card-grid three-up">
          <article className="detail-card">
            <span className="card-kicker">May 16</span>
            <h3>City Night Live</h3>
            <p>A signature stand-up and Q&A night with sharp humor, crowd energy, and a premium live atmosphere.</p>
          </article>
          <article className="detail-card">
            <span className="card-kicker">June 07</span>
            <h3>Campus Comedy Jam</h3>
            <p>A community-driven event for students, creators, and culture lovers who want a night with momentum.</p>
          </article>
          <article className="detail-card">
            <span className="card-kicker">July 19</span>
            <h3>Creator Circle Showcase</h3>
            <p>Live performances, creative conversations, and behind-the-scenes moments from the wider ecosystem.</p>
          </article>
        </div>
      </section>

      <section className="section-block muted-block">
        <div className="container detail-grid">
          <div className="detail-card">
            <p className="eyebrow">What to expect</p>
            <h2>Simple access, premium atmosphere, and a clear path to purchase.</h2>
            <ul className="detail-list">
              <li>Venue details, access notes, and pre-show reminders sent directly to buyers.</li>
              <li>Tiered ticketing for community, VIP, and premium live experiences.</li>
              <li>Clear event storytelling built around social proof, trust, and excitement.</li>
            </ul>
          </div>

          <PublicActionForm kind="ticket" />
        </div>
      </section>
    </div>
  );
}
