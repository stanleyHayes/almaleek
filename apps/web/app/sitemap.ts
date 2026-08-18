import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

const routes: Array<{
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/events/live", changeFrequency: "weekly", priority: 0.9 },
  { path: "/community", changeFrequency: "monthly", priority: 0.9 },
  { path: "/media", changeFrequency: "weekly", priority: 0.7 },
  { path: "/shop", changeFrequency: "weekly", priority: 0.7 },
  { path: "/academy", changeFrequency: "monthly", priority: 0.7 },
  { path: "/partnerships", changeFrequency: "monthly", priority: 0.6 },
  { path: "/work-with-al-maleek", changeFrequency: "monthly", priority: 0.8 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: siteUrl(route.path),
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
