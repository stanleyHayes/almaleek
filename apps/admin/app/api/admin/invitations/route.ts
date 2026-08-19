import { proxyAdminRequest } from '@/lib/admin-api';
export async function GET(){return proxyAdminRequest('/api/invitations','GET')}
export async function POST(request:Request){try{return proxyAdminRequest('/api/invitations','POST',await request.json())}catch{return Response.json({error:'Request body must be valid JSON.'},{status:400})}}
