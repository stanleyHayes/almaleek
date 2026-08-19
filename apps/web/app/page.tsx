import Link from 'next/link';
import { getSiteContent } from '@/lib/site-content';

export default async function HomePage() {
  const { home, pages } = await getSiteContent();
  return (
    <div className="page-shell">
      <section className="hero-section">
        <div className="container split-layout">
          <div>
            <p className="eyebrow">{home.hero.eyebrow}</p>
            <h1>{home.hero.headline}</h1>
            <p className="lede">{home.hero.lede}</p>
            <div className="cta-row">
              <Link href="/community" className="button button-primary">
                Join the community
              </Link>
              <Link href="/work-with-al-maleek" className="button button-secondary">
                Work with AL Maleek
              </Link>
            </div>
          </div>

          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="hero-art"
              src="/media/hero-skits.svg"
              alt="Illustration of an Al Maleek skit on a phone screen"
            />
            <div className="hero-card">
              <span className="pill">{home.hero_card_pill}</span>
              <h3>{home.hero_card_title}</h3>
              <ul>
                {home.hero_card_points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container stats-grid">
          {home.stats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">{home.journey_eyebrow}</p>
            <h2>{home.journey_heading}</h2>
          </div>

          <div className="card-grid three-up">
            {home.journey.map((card) => (
              <Link key={card.href} href={card.href} className="feature-card">
                <span className="card-kicker">Explore</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Fresh from the timeline</p>
            <h2>Skits, stories, and press — straight from the studio.</h2>
          </div>

          <div className="card-grid three-up">
            {pages.media.stories.map((story, index) => (
              <Link key={story.title} href="/media" className="feature-card media-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="media-thumb"
                  src={story.image || `/media/poster-${(index % 3) + 1}.svg`}
                  alt=""
                  loading="lazy"
                />
                <span className="card-kicker">{story.kind}</span>
                <h3>{story.title}</h3>
                <p>{story.meta}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block muted-block">
        <div className="container split-layout align-start">
          <div>
            <p className="eyebrow">{home.pillars_eyebrow}</p>
            <h2>{home.pillars_heading}</h2>
          </div>

          <div className="check-list" aria-label="Brand pillars list">
            {home.pillars.map((item) => (
              <div key={item} className="check-item">
                <span aria-hidden="true">✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <div className="section-head narrow">
            <p className="eyebrow">{home.next_eyebrow}</p>
            <h2>{home.next_heading}</h2>
          </div>

          <div className="card-grid two-up">
            {home.next_moves.map((move) => (
              <div key={move.href} className="mini-card highlight-card">
                <h3>{move.title}</h3>
                <p>{move.text}</p>
                <Link href={move.href} className="inline-link">
                  {move.link_label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
