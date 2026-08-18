import { AboutExperience } from "./about-experience";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "The story and mission behind AL Maleek — a creator-led culture engine turning attention into community, opportunity, and brands people belong to.",
  path: "/about",
  keywords: ["about AL Maleek", "creator-led culture engine"],
});

export default function AboutPage() {
  return <AboutExperience />;
}
