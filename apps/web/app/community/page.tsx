import { CommunityExperience } from "./community-experience";

export default function CommunityPage() {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div className="container">
          <p className="eyebrow">Community</p>
          <h1>Join the movement and turn attention into belonging.</h1>
          <p className="lede">
            The AL Maleek community is built for fans, friends, collaborators,
            and future members who want direct access to the work, the ideas,
            and the opportunities shaping the brand.
          </p>
        </div>
      </header>

      <CommunityExperience />
    </div>
  );
}
