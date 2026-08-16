import "server-only";
import { hasAdminSession } from "./admin-session";
type Method = "GET" | "POST" | "PUT";
export async function proxyAdminRequest(
  path: string,
  method: Method,
  body?: unknown,
) {
  if (!(await hasAdminSession()))
    return Response.json({ error: "Admin session required." }, { status: 401 });
  const base = process.env.API_URL?.trim().replace(/\/$/, "");
  const key = process.env.ADMIN_API_KEY?.trim();
  if (!base || !key)
    return Response.json(
      {
        error:
          "Admin API proxy is not configured. Set API_URL and ADMIN_API_KEY on the server.",
      },
      { status: 503 },
    );
  try {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${key}`,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const text = await response.text();
    let payload: unknown;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = {
        error: response.ok
          ? "Invalid upstream response"
          : "Admin API request failed.",
      };
    }
    return Response.json(payload, { status: response.status });
  } catch {
    return Response.json(
      { error: "Admin API is currently unreachable." },
      { status: 502 },
    );
  }
}
