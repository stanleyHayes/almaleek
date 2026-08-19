import { CommunityExperience } from "./community-experience";
import { pageMetadata } from "@/lib/seo";
import { DEFAULT_SITE_CONTENT, getSiteContent } from "@/lib/site-content";

const fallbackArt = [
  "/media/circle-access.svg",
  "/media/circle-experiences.svg",
  "/media/circle-insider.svg",
  "/media/circle-growth.svg",
];

export const metadata = pageMetadata({
  title: "Community",
  description:
    "Join the AL Maleek Circle — early skits, member-only moments, a direct line to Al Maleek, and pathways from fan to collaborator, built for fans who want access and belonging.",
  path: "/community",
  keywords: ["join AL Maleek community", "fan community Ghana"],
});

export default async function CommunityPage() {
  const { community } = (await getSiteContent()).pages;
  const cards = community.cards.length
    ? community.cards
    : DEFAULT_SITE_CONTENT.pages.community.cards;
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">{community.hero.eyebrow}</p>
          <h1>{community.hero.headline}</h1>
          <p className="lede">{community.hero.lede}</p>
        </div>
      </header>

      {cards.map((card, index) => {
        const points = card.points?.length
          ? card.points
          : DEFAULT_SITE_CONTENT.pages.community.cards[index]?.points ?? [];
        const image = card.image || fallbackArt[index % fallbackArt.length];
        return (
          <section className="section-block" key={card.title}>
            <div
              className={`container offering-grid${index % 2 === 1 ? " offering-flip" : ""}`}
            >
              <div className="offering-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" loading="lazy" />
              </div>
              <div className="offering-copy">
                <span className="card-kicker">{card.kicker}</span>
                <h2>{card.title}</h2>
                <p>{card.text}</p>
                <p className="offering-points-label">What members get</p>
                <ul className="detail-list">
                  {points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        );
      })}

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
