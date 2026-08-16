import Link from 'next/link';

const stories = [
  { type: 'New film', title: 'The room before the room', meta: '08:24 · Behind the scenes' },
  { type: 'Press', title: 'How AL Maleek is building culture beyond the feed', meta: 'Creative Ghana · 6 min read' },
  { type: 'Field note', title: 'What a live audience teaches you about community', meta: 'From the studio · Issue 04' },
];

export default function MediaPage() {
  return <div className="page-shell">
    <header className="page-header"><div className="container"><p className="eyebrow">Watch · read · listen</p><h1>Stories with a pulse beyond the timeline.</h1><p className="lede">Films, interviews, press, and working notes from the people and places shaping the AL Maleek ecosystem.</p></div></header>
    <section className="section-block"><div className="container card-grid three-up">{stories.map(story => <article className="feature-card" key={story.title}><span className="card-kicker">{story.type}</span><h3>{story.title}</h3><p>{story.meta}</p><Link href="/media" className="inline-link">Open story →</Link></article>)}</div></section>
    <section className="section-block muted-block"><div className="container split-layout align-start"><div><p className="eyebrow">Press room</p><h2>Need verified material for a story?</h2><p className="lede">Find approved biographies, brand notes, selected photography, and a direct press contact.</p></div><div className="form-card"><h3>Press enquiries</h3><p>Tell us your publication, deadline, and what you need.</p><Link className="button button-primary" href="mailto:press@almaleek.com">Contact the press desk</Link></div></div></section>
  </div>;
}
