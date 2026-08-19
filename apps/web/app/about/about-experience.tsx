"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/api";
import { SocialIcon } from "@/components/site-shell";
import { EmptyState, PageSkeleton } from "@/components/state-primitives";

type Settings = {
  about_eyebrow: string;
  about_headline: string;
  about_introduction: string;
  about_story: string;
  about_mission: string;
  founder_name: string;
  founder_role: string;
  brands: Array<{
    name: string;
    category: string;
    description: string;
    url: string;
  }>;
  social_profiles: Array<{
    platform: string;
    handle: string;
    url: string;
    audience: string;
  }>;
};

export function AboutExperience() {
  const [content, setContent] = useState<Settings | null>(null),
    [error, setError] = useState(false),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${getApiBaseUrl()}/api/site/settings`, { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error || "Unable to load the brand story");
        setContent(body);
      })
      .catch((reason) => {
        if (reason.name !== "AbortError") setError(true);
      });
    return () => controller.abort();
  }, [attempt]);
  if (!content)
    return error ? (
      <main className="about-loading">
        <div role="alert">
          <EmptyState
            title="We couldn't load this page"
            description="Check your internet connection and try again. If it keeps happening, email hello@almaleekgh.com and we'll sort it out."
            action={
              <button
                className="button button-primary"
                onClick={() => {
                  setError(false);
                  setAttempt((count) => count + 1);
                }}
              >
                Try again
              </button>
            }
          />
        </div>
      </main>
    ) : (
      <PageSkeleton />
    );
  return (
    <div className="about-page">
      <header className="about-hero">
        <div className="container">
          <p className="eyebrow">{content.about_eyebrow}</p>
          <h1>{content.about_headline}</h1>
          <div className="about-intro">
            <p>{content.about_introduction}</p>
            <span>
              <strong>{content.founder_name}</strong>
              <small>{content.founder_role}</small>
            </span>
          </div>
        </div>
      </header>
      <section className="section-block">
        <div className="container about-story-grid">
          <article>
            <p className="eyebrow">Origin & direction</p>
            <h2>A Ghanaian story designed to travel.</h2>
            <p>{content.about_story}</p>
          </article>
          <aside>
            <p className="eyebrow">The mission</p>
            <blockquote>{content.about_mission}</blockquote>
            <Link className="button button-primary" href="/work-with-al-maleek">
              Build something together →
            </Link>
          </aside>
        </div>
      </section>
      <section className="section-block muted-block">
        <div className="container">
          <div className="about-section-heading">
            <div>
              <p className="eyebrow">The ecosystem</p>
              <h2>
                Brands built to create rooms, careers and cultural momentum.
              </h2>
            </div>
            <p>
              Each venture gives partners a different way to participate while
              strengthening one connected creative platform.
            </p>
          </div>
          <div className="brand-portfolio">
            {content.brands.map((brand, index) => (
              <Link
                href={brand.url}
                className={`brand-venture venture-${index + 1}`}
                key={brand.name}
              >
                <span>{brand.category}</span>
                <strong>{brand.name}</strong>
                <p>{brand.description}</p>
                <i>Explore →</i>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="section-block social-presence">
        <div className="container">
          <div className="about-section-heading">
            <div>
              <p className="eyebrow">Across the internet</p>
              <h2>One voice. Every platform where the community gathers.</h2>
            </div>
            <p>
              Follow the shows, ideas, conversations and partnership work as
              they move.
            </p>
          </div>
          <div className="social-presence-grid">
            {content.social_profiles.map((profile) => (
              <a
                href={profile.url}
                target="_blank"
                rel="noreferrer"
                key={profile.platform}
              >
                <span>
                  <SocialIcon platform={profile.platform} />
                </span>
                <div>
                  <strong>{profile.platform}</strong>
                  <small>{profile.handle}</small>
                </div>
                <p>{profile.audience}</p>
                <i>↗</i>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="about-partner">
        <div className="container">
          <p className="eyebrow">Partnership invitation</p>
          <h2>Back the work already moving culture.</h2>
          <p>
            Partner with an ecosystem that connects story, talent, live
            audiences, learning and commercial opportunity.
          </p>
          <Link className="button button-primary" href="/partnerships">
            Explore partnerships →
          </Link>
        </div>
      </section>
    </div>
  );
}
