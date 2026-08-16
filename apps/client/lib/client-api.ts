export function getClientApiUrl() {
  const configured = (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL
  )
    ?.trim()
    .replace(/\/$/, "");
  if (configured) return configured;
  if (process.env.NODE_ENV === "development") return "http://127.0.0.1:18080";
  return null;
}
