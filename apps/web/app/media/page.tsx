import Link from 'next/link';
import { pageMetadata } from '@/lib/seo';
import { getSiteContent } from '@/lib/site-content';

export const metadata = pageMetadata({
  title: 'Media & Stories',
  description:
    'Films, interviews, press, and working notes from the people and places shaping the AL Maleek ecosystem.',
  path: '/media',
  keywords: ['AL Maleek media', 'Ghana culture stories', 'creator interviews'],
});

export default async function MediaPage() {
  const { media } = (await getSiteContent()).pages;
  return <div className="page-shell">
    <header className="page-header"><div className="container"><p className="eyebrow">{media.hero.eyebrow}</p><h1>{media.hero.headline}</h1><p className="lede">{media.hero.lede}</p></div></header>
    <section className="section-block"><div className="container card-grid three-up">{media.stories.map((story, index) => <article className="feature-card media-card" key={story.title}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="media-thumb" src={story.image || `/media/poster-${(index % 3) + 1}.svg`} alt="" loading="lazy" />
      <span className="card-kicker">{story.kind}</span><h3>{story.title}</h3><p>{story.meta}</p><Link href="/media" className="inline-link">Open story →</Link></article>)}</div></section>
    <section className="section-block muted-block"><div className="container split-layout align-start"><div><p className="eyebrow">{media.press_eyebrow}</p><h2>{media.press_heading}</h2><p className="lede">{media.press_lede}</p></div><div className="form-card"><h3>Press enquiries</h3><p>Tell us your publication, deadline, and what you need.</p><Link className="button button-primary" href={`mailto:${media.press_email}`}>Contact the press desk</Link></div></div></section>
  </div>;
}
