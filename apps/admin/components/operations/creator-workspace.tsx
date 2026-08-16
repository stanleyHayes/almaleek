'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

const seed = [
  { name:'Amara Cole', handle:'@amaracole', niche:'Comedy & culture', status:'Active', revenue:'GH₵ 84k', initials:'AC' },
  { name:'Kai Morgan', handle:'@kaimorgan', niche:'Creator business', status:'Reviewing', revenue:'GH₵ 31k', initials:'KM' },
  { name:'Noah Vale', handle:'@noahvale', niche:'Community events', status:'Active', revenue:'GH₵ 126k', initials:'NV' },
  { name:'Lena Cross', handle:'@lenacross', niche:'Lifestyle media', status:'Onboarding', revenue:'GH₵ 18k', initials:'LC' },
];

export function CreatorWorkspace() {
  const [creators,setCreators] = useState(seed);
  const [open,setOpen] = useState(false);
  const [notice,setNotice] = useState('');
  const add = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name'));
    setCreators(list => [{ name, handle:String(data.get('handle')), niche:String(data.get('niche')), status:'Onboarding', revenue:'GH₵ 0', initials:name.split(' ').map(word=>word[0]).join('').slice(0,2).toUpperCase() }, ...list]);
    setOpen(false); setNotice(`${name} was added to the creator pipeline.`);
  };
  return <>
    <header className="top-strip"><div><p className="eyebrow">Creator operations</p><h1>Creator pipeline</h1><p className="page-intro">Discover, onboard and grow the people shaping the next cultural moment.</p></div><button className="button button-primary" onClick={()=>setOpen(true)}>＋ Add creator</button></header>
    {notice&&<div className="workspace-toast" role="status"><span>✓</span>{notice}<button onClick={()=>setNotice('')}>×</button></div>}
    <div className="stats-grid"><article className="stat-card"><p>Qualified leads</p><strong>128</strong><small>23 ready for review</small></article><article className="stat-card"><p>New this week</p><strong>19</strong><small>Across 6 disciplines</small></article><article className="stat-card"><p>Conversion rate</p><strong>24%</strong><small>+3.2 points</small></article><article className="stat-card"><p>Avg. revenue</p><strong>GH₵ 52k</strong><small>Per active creator</small></article></div>
    <section className="workspace-section"><div className="workspace-section-head"><div><p className="eyebrow">Featured roster</p><h2>Creators in motion</h2></div><span>{creators.length} shown</span></div><div className="creator-card-grid">{creators.map((creator,index)=><article className="creator-card" key={creator.handle}><div className={`creator-portrait tone-${index%4}`}><span>{creator.initials}</span><i>ALM / {String(index+1).padStart(2,'0')}</i></div><div className="operation-card-top"><span className="status-pill">{creator.status}</span><button aria-label={`Manage ${creator.name}`}>···</button></div><h3>{creator.name}</h3><p>{creator.handle} · {creator.niche}</p><footer><span><small>Attributed revenue</small><strong>{creator.revenue}</strong></span><button>View profile ↗</button></footer></article>)}</div></section>
    {open&&<div className="drawer-root" role="dialog" aria-modal="true"><button className="drawer-scrim" aria-label="Close" onClick={()=>setOpen(false)}/><aside className="form-drawer"><header><div><p className="eyebrow">Roster intake</p><h2>Add creator</h2></div><button onClick={()=>setOpen(false)}>×</button></header><form onSubmit={add}><div className="drawer-section"><h3>Creator profile</h3><p>Add their core identity now. Audience and commercial details can follow during onboarding.</p><label>Full name<input name="name" required placeholder="Creator name"/></label><label>Social handle<input name="handle" required placeholder="@handle"/></label><BrandedNicheSelect/><label>Email address<input name="email" type="email" required placeholder="creator@example.com"/></label></div><footer><button className="button button-soft" type="button" onClick={()=>setOpen(false)}>Cancel</button><button className="button button-primary">Add creator</button></footer></form></aside></div>}
  </>;
}

function BrandedNicheSelect() {
  const options = ['Comedy & culture','Creator business','Music & performance','Lifestyle media','Community events'];
  const [value,setValue] = useState(options[0]);
  const [open,setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); }; document.addEventListener('pointerdown',close); return () => document.removeEventListener('pointerdown',close); },[]);
  return <div className="branded-field" ref={root}><span>Primary niche</span><input type="hidden" name="niche" value={value}/><button className="branded-select-trigger" type="button" aria-haspopup="listbox" aria-expanded={open} onClick={()=>setOpen(state=>!state)}><span>{value}</span><i>⌄</i></button>{open&&<div className="branded-select-menu" role="listbox" aria-label="Primary niche">{options.map(option=><button type="button" role="option" aria-selected={value===option} key={option} onClick={()=>{setValue(option);setOpen(false)}}><span>{value===option?'✓':'·'}</span>{option}</button>)}</div>}</div>;
}
