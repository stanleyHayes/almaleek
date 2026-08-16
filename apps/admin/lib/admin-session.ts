import 'server-only';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE='alm_admin_session';
const MAX_AGE=8*60*60;
const secret=()=>process.env.ADMIN_SESSION_SECRET?.trim();
const sign=(payload:string,key:string)=>createHmac('sha256',key).update(payload).digest('base64url');

export function sessionConfigured(){return Boolean(secret()&&process.env.ADMIN_EMAIL?.trim()&&process.env.ADMIN_PASSWORD?.trim())}
export function credentialsValid(email:string,password:string){const expectedEmail=process.env.ADMIN_EMAIL?.trim().toLowerCase()??'',expectedPassword=process.env.ADMIN_PASSWORD??'';const given=Buffer.from(password),expected=Buffer.from(expectedPassword);return email.trim().toLowerCase()===expectedEmail&&given.length===expected.length&&timingSafeEqual(given,expected)}
export function createSessionToken(){const key=secret();if(!key)throw new Error('ADMIN_SESSION_SECRET is not configured');const payload=Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+MAX_AGE,nonce:randomBytes(16).toString('hex')})).toString('base64url');return `${payload}.${sign(payload,key)}`}
export function verifySessionToken(token:string|undefined){const key=secret();if(!key||!token)return false;const [payload,signature,...extra]=token.split('.');if(!payload||!signature||extra.length)return false;const actual=Buffer.from(signature),expected=Buffer.from(sign(payload,key));if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return false;try{const value=JSON.parse(Buffer.from(payload,'base64url').toString()) as {exp?:number};return typeof value.exp==='number'&&value.exp>Math.floor(Date.now()/1000)}catch{return false}}
export async function hasAdminSession(){return verifySessionToken((await cookies()).get(ADMIN_SESSION_COOKIE)?.value)}
export const sessionCookieOptions={httpOnly:true,sameSite:'strict' as const,secure:process.env.NODE_ENV==='production',path:'/',maxAge:MAX_AGE,priority:'high' as const};
