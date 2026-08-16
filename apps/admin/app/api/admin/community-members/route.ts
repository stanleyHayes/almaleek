import { proxyAdminRequest } from '@/lib/admin-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  return proxyAdminRequest('/api/community/members', 'GET');
}
