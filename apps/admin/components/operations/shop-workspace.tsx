'use client';

import React, { useState, type FormEvent } from 'react';

const seed = [
  { name: 'Culture Capsule', sku: 'ALM-014', units: 286, stock: 74, roi: '18.2%', tone: 'mint' },
  { name: 'Front Row Tee', sku: 'ALM-088', units: 140, stock: 28, roi: '12.4%', tone: 'lilac' },
  { name: 'Signature Hoodie', sku: 'ALM-116', units: 214, stock: 42, roi: '21.9%', tone: 'peach' },
];

export function ShopWorkspace() {
  const [items, setItems] = useState(seed);
  const [open,setOpen] = useState(false);
  const add = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const data = new FormData(event.currentTarget); setItems(list => [{ name:String(data.get('name')), sku:String(data.get('sku')), units:0, stock:Number(data.get('stock')), roi:'—', tone:'mint' },...list]); setOpen(false); };
  return <><header className="top-strip"><div><p className="eyebrow">Merch and commerce</p><h1>Product performance</h1><p className="page-intro">See what is moving, protect inventory and launch the next culture drop.</p></div><button className="button button-primary" type="button" onClick={() => setOpen(true)}>＋ New drop</button></header>
  <div className="stats-grid"><article className="stat-card"><p>Revenue</p><strong>GH₵ 419k</strong><small>+14.8% this cycle</small></article><article className="stat-card"><p>Units sold</p><strong>1,134</strong><small>Across 8 products</small></article><article className="stat-card"><p>Return rate</p><strong>4.1%</strong><small>Below target</small></article><article className="stat-card"><p>Repeat buyers</p><strong>26%</strong><small>Community-led growth</small></article></div>
  <section className="workspace-section"><div className="workspace-section-head"><div><p className="eyebrow">Current capsule</p><h2>Products people want</h2></div><span>{items.length} active products</span></div><div className="operation-card-grid">{items.map((item,index)=><article className={`operation-card product-card ${item.tone}`} key={item.sku}><div className="product-visual"><span>ALM</span><b>{String(index+1).padStart(2,'0')}</b></div><div className="operation-card-top"><span className="status-pill">Live</span><small>{item.sku}</small></div><h3>{item.name}</h3><div className="product-metrics"><span><small>Units sold</small><strong>{item.units}</strong></span><span><small>In stock</small><strong>{item.stock}</strong></span><span><small>ROI</small><strong>{item.roi}</strong></span></div><button className="card-action" type="button">View product <span>↗</span></button></article>)}</div></section>
  {open&&<SimpleDrawer title="Create new drop" onClose={()=>setOpen(false)} onSubmit={add}><label>Product name<input name="name" required placeholder="e.g. Founders jacket" /></label><div className="drawer-form-grid"><label>SKU<input name="sku" required placeholder="ALM-120" /></label><label>Opening stock<input name="stock" type="number" min="1" required defaultValue="50" /></label></div></SimpleDrawer>}</>;
}

function SimpleDrawer({title,onClose,onSubmit,children}:{title:string;onClose:()=>void;onSubmit:(event:FormEvent<HTMLFormElement>)=>void;children:React.ReactNode}) { return <div className="drawer-root" role="dialog" aria-modal="true"><button className="drawer-scrim" type="button" aria-label="Close" onClick={onClose}/><aside className="form-drawer"><header><div><p className="eyebrow">Commerce studio</p><h2>{title}</h2></div><button type="button" onClick={onClose}>×</button></header><form onSubmit={onSubmit}><div className="drawer-section"><h3>Product details</h3><p>Create the item now, then add imagery and pricing from its product workspace.</p>{children}</div><footer><button className="button button-soft" type="button" onClick={onClose}>Cancel</button><button className="button button-primary">Create drop</button></footer></form></aside></div> }
