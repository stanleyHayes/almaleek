import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Privacy',
  description:
    'What AL Maleek collects when you join the community, reserve an experience, or send an enquiry — and the choices you have over your information.',
  path: '/privacy',
  keywords: ['AL Maleek privacy policy'],
});

export default function PrivacyPage(){return <div className="page-shell"><header className="page-header"><div className="container"><p className="eyebrow">Privacy</p><h1>Your information should earn your trust.</h1><p className="lede">This summary explains what AL Maleek collects when you join the community, reserve an experience, or send a business enquiry.</p></div></header><section className="section-block"><div className="container card-grid two-up"><article className="detail-card"><h3>Information we use</h3><p>Contact details, membership preferences, event activity, and the messages you choose to send us.</p></article><article className="detail-card"><h3>Why we use it</h3><p>To deliver requested updates, manage access, answer enquiries, and improve the experiences you choose to join.</p></article><article className="detail-card"><h3>Your choices</h3><p>You may request access, correction, export, or deletion by contacting privacy@almaleek.com.</p></article><article className="detail-card"><h3>Data care</h3><p>We limit access to authorised operators and retain information only while it supports the purpose you agreed to.</p></article></div></section></div>}
