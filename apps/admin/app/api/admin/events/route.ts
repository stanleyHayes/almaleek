import { proxyAdminRequest } from '@/lib/admin-api';
export const dynamic='force-dynamic';
export async function GET(){return proxyAdminRequest('/api/events','GET')}
export async function POST(request:Request){try{return proxyAdminRequest('/api/events','POST',await request.json())}catch{return Response.json({error:'Request body must be valid JSON.'},{status:400})}}
