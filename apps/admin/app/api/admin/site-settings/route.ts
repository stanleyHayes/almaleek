import { proxyAdminRequest } from "@/lib/admin-api";
export async function GET() {
  return proxyAdminRequest("/api/site/settings", "GET");
}
export async function PUT(request: Request) {
  try {
    return proxyAdminRequest("/api/site/settings", "PUT", await request.json());
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }
}
