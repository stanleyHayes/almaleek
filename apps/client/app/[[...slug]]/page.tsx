import { PortalApp } from "@/components/portal-app";
import { notFound } from "next/navigation";

const sections = new Set([
  "home",
  "onboarding",
  "messages",
  "opportunities",
  "collaborations",
  "campaigns",
  "earnings",
  "media-kit",
  "deliverables",
  "files",
  "reports",
  "billing",
  "community",
  "events",
  "benefits",
  "orders",
  "academy",
  "sessions",
  "certificates",
  "profile",
  "security",
  "preferences",
  "notifications",
]);

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  if (slug.length > 1) return notFound();
  const section = slug[0] ?? "home";
  if (!sections.has(section)) return notFound();
  return <PortalApp section={section} />;
}
