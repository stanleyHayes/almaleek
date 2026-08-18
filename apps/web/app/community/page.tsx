import { CommunityExperience } from "./community-experience";
import { pageMetadata } from "@/lib/seo";
import { getSiteContent } from "@/lib/site-content";

export const metadata = pageMetadata({
  title: "Community",
  description:
    "Join the AL Maleek community — built for fans, friends, collaborators, and future members who want direct access to the work, the ideas, and the opportunities shaping the brand.",
  path: "/community",
  keywords: ["join AL Maleek community", "fan community Ghana"],
});

export default async function CommunityPage() {
  const { community } = (await getSiteContent()).pages;
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">{community.hero.eyebrow}</p>
          <h1>{community.hero.headline}</h1>
          <p className="lede">{community.hero.lede}</p>
        </div>
      </header>

      <CommunityExperience
        mutedContent={{
          muted_eyebrow: community.muted_eyebrow,
          muted_heading: community.muted_heading,
          muted_points: community.muted_points,
        }}
      />
    </div>
  );
}
