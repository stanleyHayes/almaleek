import Link from 'next/link';

const journeyCards = [
  {
    title: 'Work With AL Maleek',
    href: '/work-with-al-maleek',
    text: 'Book appearances, campaigns, event partnerships, and creator collaborations built for culture-first impact.',
  },
  {
    title: 'AL Maleek Live',
    href: '/events/live',
    text: 'Discover the next comedy night, premiere, campus showcase, or community event with seamless ticketing.',
  },
  {
    title: 'Community',
    href: '/community',
    text: 'Join a space designed for fans, friends, and future members who want access, belonging, and early opportunity.',
  },
  {
    title: 'Media & stories',
    href: '/media',
    text: 'Watch films, read field notes, and find press stories from inside the wider AL Maleek ecosystem.',
  },
  {
    title: 'Shop',
    href: '/shop',
    text: 'Own culture-driven drops, event merch, and premium collectibles that turn fandom into identity.',
  },
  {
    title: 'Academy',
    href: '/academy',
    text: 'Learn the craft of content, comedy, performance, and creator business with practical, real-world frameworks.',
  },
  {
    title: 'Partnerships',
    href: '/partnerships',
    text: 'Build sponsor, activation, and collaboration opportunities that feel aligned to the audience and the brand.',
  },
];

const pillars = [
  'Premium brand trust with creator-led personality',
  'A community flywheel that turns attention into belonging',
  'Events, commerce, and education that convert excitement into action',
  'Clear business pathways for brands, learners, collaborators, and fans',
];

export default function HomePage() {
  return (
    <div className="page-shell">
      <section className="hero-section">
        <div className="container split-layout">
          <div>
            <p className="eyebrow">Creator-led culture engine</p>
            <h1>Turn attention into a brand people belong to.</h1>
            <p className="lede">
              AL Maleek is the digital home for culture, community, creativity, and opportunity. From
              live experiences and commerce to education and partnerships, every touchpoint is designed
              to move people from discovery into deeper connection and action.
            </p>
            <div className="cta-row">
              <Link href="/community" className="button button-primary">
                Join the community
              </Link>
              <Link href="/work-with-al-maleek" className="button button-secondary">
                Work with AL Maleek
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <span className="pill">Built to convert</span>
            <h3>Culture with commercial momentum</h3>
            <ul>
              <li>Low-friction community growth</li>
              <li>Premium tickets and live experiences</li>
              <li>Creator education and retail pathways</li>
              <li>Brand and partnership opportunities</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="stats-bar">
        <div className="container stats-grid">
          <div>
            <strong>1k+</strong>
            <span>Community signups</span>
          </div>
          <div>
            <strong>5</strong>
            <span>Core growth loops</span>
          </div>
          <div>
            <strong>24/7</strong>
            <span>Audience conversion path</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>Owned ecosystem focus</span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <div className="section-head">
            <p className="eyebrow">Built for the full ecosystem</p>
            <h2>From discovery to deeper conversion, every path has a clear next step.</h2>
          </div>

          <div className="card-grid three-up">
            {journeyCards.map((card) => (
              <Link key={card.href} href={card.href} className="feature-card">
                <span className="card-kicker">Explore</span>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block muted-block">
        <div className="container split-layout align-start">
          <div>
            <p className="eyebrow">Why it works</p>
            <h2>Premium, social, and commercially credible without losing authenticity.</h2>
          </div>

          <div className="check-list" aria-label="Brand pillars list">
            {pillars.map((item) => (
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
            <p className="eyebrow">Next move</p>
            <h2>Choose the path that fits your intent.</h2>
          </div>

          <div className="card-grid two-up">
            <div className="mini-card highlight-card">
              <h3>For fans and community members</h3>
              <p>Get the updates, access, and invites that make the brand feel personal and worth showing up for.</p>
              <Link href="/community" className="inline-link">
                Join the community →
              </Link>
            </div>

            <div className="mini-card highlight-card">
              <h3>For brands and collaborators</h3>
              <p>Start a structured conversation around events, partnerships, sponsorships, and culture-led growth.</p>
              <Link href="/partnerships" className="inline-link">
                Explore partnerships →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
