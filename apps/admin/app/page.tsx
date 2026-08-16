import Link from 'next/link';

const stats = [
  { label: 'Owned audience', value: '8,964', note: '+12.8% this month' },
  { label: 'Live revenue', value: 'GH₵ 284k', note: 'Across tickets & shop' },
  { label: 'Active briefs', value: '16', note: '5 need a response' },
  { label: 'Content reach', value: '1.2m', note: '+18.4% vs July' },
];
const priorities = [['City Night Live','Ticket sales','72%'],['Culture Capsule','Shop inventory','48%'],['Campus tour','Partner approvals','84%']];

export default function AdminHomePage() {
  return <>
    <header className="top-strip"><div><p className="eyebrow">Sunday operating brief</p><h1>Good afternoon, Ama.</h1></div><Link className="button button-primary" href="/events">+ Create event</Link></header>
    <div className="stats-grid">{stats.map(item => <article key={item.label} className="stat-card"><p>{item.label}</p><strong>{item.value}</strong><small>{item.note}</small></article>)}</div>
    <section className="panel-grid dashboard-grid">
      <article className="panel-card performance-card"><div className="panel-heading"><div><p className="eyebrow">Audience momentum</p><h2>Growth across the ecosystem</h2></div><span className="period-chip">Last 6 months</span></div><div className="bar-chart" aria-label="Audience growth from March to August">{[42,58,51,76,68,92].map((height,index) => <div key={height} className="bar-column"><i style={{height:`${height}%`}} /><span>{['Mar','Apr','May','Jun','Jul','Aug'][index]}</span></div>)}</div></article>
      <article className="panel-card focus-card"><p className="eyebrow">This week</p><h2>Three moves deserve attention.</h2><div className="priority-list">{priorities.map(([name,label,progress]) => <div key={name} className="priority-row"><div><strong>{name}</strong><span>{label}</span></div><b>{progress}</b></div>)}</div></article>
      <article className="panel-card activity-card"><div className="panel-heading"><h2>Live activity</h2><Link href="/notifications" className="text-button">View all →</Link></div><ul className="activity-list"><li><strong>New partnership brief</strong> Absa Ghana · 12 minutes ago</li><li><strong>42 tickets sold</strong> City Night Live · 38 minutes ago</li><li><strong>Video ready to publish</strong> Backstage Accra · 1 hour ago</li><li><strong>Community milestone</strong> Insiders reached 2,200 members</li></ul></article>
    </section>
  </>;
}
