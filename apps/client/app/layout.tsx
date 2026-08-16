import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets:['latin'], variable:'--font-outfit' });
export const metadata: Metadata = { title:'AL Maleek Circle', description:'Your collaborations, campaigns, community and opportunities with AL Maleek.' };
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" className={outfit.variable}><body>{children}</body></html>}
