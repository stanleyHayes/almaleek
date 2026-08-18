import { AboutExperience } from "./about-experience";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "The story and mission behind AL Maleek — the Ghanaian comedy creator turning everyday stories into award-nominated skits, live shows, and ventures that move culture forward.",
  path: "/about",
  keywords: ["about AL Maleek", "Ghanaian comedy creator"],
});

export default function AboutPage() {
  return <AboutExperience />;
}
