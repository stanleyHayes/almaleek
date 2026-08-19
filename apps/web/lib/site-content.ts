import { getApiBaseUrl } from "@/lib/api";

export type PageCard = {
  kicker: string;
  title: string;
  text: string;
};

export type WorkWithCard = {
  kicker: string;
  title: string;
  text: string;
  image: string;
  points: string[];
};

export type PageContent = {
  hero: { eyebrow: string; headline: string; lede: string };
  cards: PageCard[];
  muted_eyebrow: string;
  muted_heading: string;
  muted_points: string[];
};

export type LivePageContent = PageContent & {
  events: Array<{ date: string; title: string; text: string; image: string }>;
};

export type MediaPageContent = PageContent & {
  stories: Array<{ kind: string; title: string; meta: string; image: string }>;
  press_eyebrow: string;
  press_heading: string;
  press_lede: string;
  press_email: string;
};

export type HomeContent = {
  hero: { eyebrow: string; headline: string; lede: string };
  hero_card_pill: string;
  hero_card_title: string;
  hero_card_points: string[];
  stats: Array<{ value: string; label: string }>;
  journey_eyebrow: string;
  journey_heading: string;
  journey: Array<{ title: string; text: string; href: string }>;
  pillars_eyebrow: string;
  pillars_heading: string;
  pillars: string[];
  next_eyebrow: string;
  next_heading: string;
  next_moves: Array<{
    title: string;
    text: string;
    link_label: string;
    href: string;
  }>;
};

export type SiteContent = {
  footer_description: string;
  contact_email: string;
  location: string;
  home: HomeContent;
  pages: {
    academy: Omit<PageContent, "cards"> & { cards: WorkWithCard[] };
    live: LivePageContent;
    community: Omit<PageContent, "cards"> & { cards: WorkWithCard[] };
    media: MediaPageContent;
    partnerships: Omit<PageContent, "cards"> & { cards: WorkWithCard[] };
    shop: PageContent;
    work_with: Omit<PageContent, "cards"> & { cards: WorkWithCard[] };
  };
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  footer_description:
    "The digital home of Al Maleek — Ghanaian comedy creator and storyteller — and the community, shows, and ventures growing around the work.",
  contact_email: "hello@almaleekgh.com",
  location: "Accra, Ghana",
  home: {
    hero: {
      eyebrow: "Ghanaian comedy & digital content creator",
      headline: "The skits you quote. The community you belong to.",
      lede: "Al Maleek is the Ghanaian comedy creator behind Al Maleek & Crew — a three-time 2026 Ghana Comedy Awards nominee turning everyday stories into skits, live shows, learning, and ventures that move culture forward.",
    },
    hero_card_pill: "Award-nominated",
    hero_card_title: "Comedy with commercial momentum",
    hero_card_points: [
      "Three nominations at the 2026 Ghana Comedy Awards",
      "A skit community that shows up offline",
      "Live shows, merch, and creator education",
      "Brand partnerships that feel native",
    ],
    stats: [
      { value: "3", label: "Comedy Awards nods" },
      { value: "4", label: "Ways to plug in" },
      { value: "24/7", label: "Skits on the timeline" },
      { value: "100%", label: "Ghana to the world" },
    ],
    journey_eyebrow: "Built for the full ecosystem",
    journey_heading:
      "From the timeline to the ticket stub, every path has a clear next step.",
    journey: [
      {
        title: "Work With Al Maleek",
        text: "Book skits, appearances, campaigns, event partnerships, and creator collaborations built for culture-first impact.",
        href: "/work-with-al-maleek",
      },
      {
        title: "AL Maleek Live",
        text: "Catch the next comedy night, premiere, campus jam, or community showcase with seamless ticketing.",
        href: "/events/live",
      },
      {
        title: "Community",
        text: "Join a space designed for fans, friends, and future members who want access, belonging, and early opportunity.",
        href: "/community",
      },
      {
        title: "Media & stories",
        text: "Watch the skits, read field notes, and find press stories from inside the wider Al Maleek ecosystem.",
        href: "/media",
      },
      {
        title: "Shop",
        text: "Own the catchphrases — culture-driven drops, event merch, and premium collectibles that turn fandom into identity.",
        href: "/shop",
      },
      {
        title: "Academy",
        text: "Learn the craft of content, comedy, performance, and creator business with practical, real-world frameworks.",
        href: "/academy",
      },
      {
        title: "Partnerships",
        text: "Build sponsor, activation, and collaboration opportunities that feel aligned to the audience and the brand.",
        href: "/partnerships",
      },
    ],
    pillars_eyebrow: "Why it works",
    pillars_heading:
      "Premium, social, and commercially credible without losing the joke.",
    pillars: [
      "Award-nominated comedy with creator-led personality",
      "A community flywheel that turns laughs into belonging",
      "Events, commerce, and education that convert excitement into action",
      "Clear business pathways for brands, learners, collaborators, and fans",
    ],
    next_eyebrow: "Next move",
    next_heading: "Choose the path that fits your intent.",
    next_moves: [
      {
        title: "For fans and community members",
        text: "Get the skits first — plus the updates, access, and invites that make the community worth showing up for.",
        link_label: "Join the community →",
        href: "/community",
      },
      {
        title: "For brands and collaborators",
        text: "Start a structured conversation around events, partnerships, sponsorships, and culture-led growth.",
        link_label: "Explore partnerships →",
        href: "/partnerships",
      },
    ],
  },
  pages: {
    academy: {
      hero: {
        eyebrow: "Academy",
        headline: "Learn the craft. Build the business. Grow with clarity.",
        lede: "AL Maleek Academy is built for aspiring creators, skit makers, and performers who want practical education that translates into real income, stronger positioning, and sustainable creative growth.",
      },
      cards: [
        {
          kicker: "Creator growth",
          title: "Content strategy",
          text: "Build a consistent creator engine without losing your voice, attention, or creative momentum.",
          image: "",
          points: [
            "A repeatable content calendar that fits real life",
            "Hooks and formats that fit your voice",
            "Reading analytics without losing the joke",
            "A posting rhythm you can actually sustain",
          ],
        },
        {
          kicker: "Comedy & performance",
          title: "Craft & delivery",
          text: "Strengthen stage presence, storytelling, and timing so your ideas land with real audiences.",
          image: "",
          points: [
            "Writing drills that sharpen every premise",
            "Stage presence, timing, and delivery practice",
            "Testing material in front of live audiences",
            "Feedback that turns jokes into signatures",
          ],
        },
        {
          kicker: "Business systems",
          title: "Creator operations",
          text: "Learn the frameworks behind monetization, partnerships, packaging, and repeatable growth.",
          image: "",
          points: [
            "Pricing and packaging your creative work",
            "Brand-deal readiness from pitch to payment",
            "Systems for consistent creator income",
            "A growth plan that outlives the algorithm",
          ],
        },
      ],
      muted_eyebrow: "Why learners stay",
      muted_heading:
        "Actionable education built around real-world creative business.",
      muted_points: [
        "Practical modules covering content, brand, and business growth.",
        "Creator-first learning paths with clear outcomes and meaningful action.",
        "Premium education that reinforces trust and long-term brand value.",
      ],
    },
    live: {
      hero: {
        eyebrow: "AL Maleek Live",
        headline:
          "High-energy experiences built for community, culture, and connection.",
        lede: "Discover comedy nights, premieres, campus events, creator showcases, and intimate live moments designed to bring the timeline together in real life.",
      },
      cards: [],
      events: [
        {
          date: "May 16",
          title: "City Night Live",
          text: "A signature stand-up and Q&A night with sharp humor, crowd energy, and a premium live atmosphere.",
          image: "",
        },
        {
          date: "June 07",
          title: "Campus Comedy Jam",
          text: "A community-driven event for students, creators, and culture lovers who want a night with momentum.",
          image: "",
        },
        {
          date: "July 19",
          title: "Creator Circle Showcase",
          text: "Live performances, creative conversations, and behind-the-scenes moments from the wider ecosystem.",
          image: "",
        },
      ],
      muted_eyebrow: "What to expect",
      muted_heading:
        "Simple access, premium atmosphere, and a clear path to purchase.",
      muted_points: [
        "Venue details, access notes, and pre-show reminders sent directly to buyers.",
        "Tiered ticketing for community, VIP, and premium live experiences.",
        "Clear event storytelling built around social proof, trust, and excitement.",
      ],
    },
    community: {
      hero: {
        eyebrow: "Community",
        headline: "Join the movement and turn attention into belonging.",
        lede: "The Al Maleek community is built for fans, friends, collaborators, and future members who want direct access to the skits, the shows, and the opportunities shaping the brand.",
      },
      cards: [
        {
          kicker: "First access",
          title: "See it before the timeline",
          text: "Members watch the new skit first and hear every announcement before the public timeline does.",
          image: "",
          points: [
            "Early access to new skits and episodes",
            "Drop alerts for merch and releases",
            "Announcements before they go public",
            "Priority ticket windows for live events",
          ],
        },
        {
          kicker: "Member-only moments",
          title: "Experiences the public never sees",
          text: "Private rooms, live conversations, and behind-the-scenes moments reserved for the Circle.",
          image: "",
          points: [
            "Invites to member-only events and hangouts",
            "Live Q&As with Al Maleek & Crew",
            "Behind-the-scenes access from sets and shows",
            "Recordings of moments you missed live",
          ],
        },
        {
          kicker: "Direct line",
          title: "Your voice inside the room",
          text: "The community is not an audience — members shape what gets made and hear it straight from the source.",
          image: "",
          points: [
            "Polls that shape upcoming skits and shows",
            "Community challenges with real recognition",
            "Direct updates from Al Maleek",
            "A say in what the brand builds next",
          ],
        },
        {
          kicker: "Pathways",
          title: "From fan to collaborator",
          text: "Fandom is the on-ramp — the Circle opens doors into learning, stages, and the wider ecosystem.",
          image: "",
          points: [
            "A clear route into AL Maleek Academy",
            "Opportunities at live events and showcases",
            "Introductions to the wider creative ecosystem",
            "Room to grow from fan to collaborator",
          ],
        },
      ],
      muted_eyebrow: "Why community matters",
      muted_heading:
        "Built for retention, value, and participation that actually means something.",
      muted_points: [
        "Member-driven access and engagement loops that keep fans invested.",
        "Polls, Q&A sessions, challenges, and insider updates that create belonging.",
        "Clear pathways into premium experiences, event access, and brand moments.",
      ],
    },
    media: {
      hero: {
        eyebrow: "Watch · read · listen",
        headline: "Stories with a pulse beyond the timeline.",
        lede: "Skits, films, interviews, press, and working notes from the people and places shaping the Al Maleek ecosystem.",
      },
      cards: [],
      stories: [
        {
          kind: "New film",
          title: "The room before the room",
          meta: "08:24 · Behind the scenes",
          image: "",
        },
        {
          kind: "Press",
          title: "How Al Maleek is building culture beyond the feed",
          meta: "Creative Ghana · 6 min read",
          image: "",
        },
        {
          kind: "Field note",
          title: "What a live audience teaches you about community",
          meta: "From the studio · Issue 04",
          image: "",
        },
      ],
      press_eyebrow: "Press room",
      press_heading: "Need verified material for a story?",
      press_lede:
        "Find approved biographies, brand notes, selected photography, and a direct press contact.",
      press_email: "press@almaleekgh.com",
      muted_eyebrow: "",
      muted_heading: "",
      muted_points: [],
    },
    partnerships: {
      hero: {
        eyebrow: "Partnerships",
        headline:
          "Build campaigns and collaborations around culture, trust, and reach.",
        lede: "AL Maleek partnerships are designed to create value for both brands and the community—clear, premium, and structured around real alignment, not superficial promotions.",
      },
      cards: [
        {
          kicker: "Campaigns",
          title: "Audience-first marketing",
          text: "Partnerships designed to integrate naturally into the brand and community experience with intent.",
          image: "",
          points: [
            "Skit integrations in a trusted comic voice",
            "Concepts tailored to Ghanaian and diaspora audiences",
            "Reach across Instagram, TikTok, YouTube, and X",
            "Post-campaign reporting with real numbers",
          ],
        },
        {
          kicker: "Sponsorships",
          title: "Event & activation support",
          text: "Strategic sponsor opportunities tied to live experiences, community moments, and cultural visibility.",
          image: "",
          points: [
            "Brand presence inside sold-out rooms",
            "On-stage mentions and branded segments",
            "Access to a community that shows up",
            "Sponsor recap content after every event",
          ],
        },
        {
          kicker: "Network",
          title: "Creative ecosystem",
          text: "Connect with collaborators, talent, and partners building bigger opportunities around the brand.",
          image: "",
          points: [
            "Access to vetted creators and talent",
            "Co-production opportunities across the slate",
            "Multi-brand activations around live moments",
            "Introductions across the wider ecosystem",
          ],
        },
      ],
      muted_eyebrow: "Partnership model",
      muted_heading: "A structured path from fit assessment to launch.",
      muted_points: [
        "Review campaign objectives, audience fit, and activation goals before work begins.",
        "Professional proposal and clear commercial framing built around mutual value.",
        "Operational planning, execution support, and reporting with a partner-first mindset.",
      ],
    },
    shop: {
      hero: {
        eyebrow: "Shop",
        headline:
          "Own the culture with premium drops and story-led merchandise.",
        lede: "AL Maleek Shop is where fandom meets identity: limited-edition pieces, event merch, and digital products that carry the culture beyond the screen.",
      },
      cards: [
        {
          kicker: "Limited drop",
          title: "Culture Tee Collection",
          text: "Premium, wearable pieces made for fans who want style, comfort, and an unmistakable statement.",
        },
        {
          kicker: "Event gear",
          title: "Live Experience Merch",
          text: "Commemorative products tied to signature nights, premieres, and community milestones.",
        },
        {
          kicker: "Creator tools",
          title: "Digital resources",
          text: "Templates, prompts, and educational resources built for creators who want practical growth tools.",
        },
      ],
      muted_eyebrow: "Shop principles",
      muted_heading:
        "Merch that feels like part of the story, not just a product add-on.",
      muted_points: [
        "Limited-edition energy with scarcity and meaningful story context.",
        "Premium design language that still feels accessible and culturally relevant.",
        "Member-first access, drop alerts, and post-purchase retention built into the experience.",
      ],
    },
    work_with: {
      hero: {
        eyebrow: "Work with Al Maleek",
        headline: "Build a partnership that feels native to culture.",
        lede: "From skit integrations and campaigns to live events, sponsorships, and production, Al Maleek creates premium, high-trust opportunities for brands and organizations that want to connect with an engaged audience in a way that feels authentic, not forced.",
      },
      cards: [
        {
          kicker: "Brand deals",
          title: "Campaigns & activations",
          text: "High-impact partnerships designed to build visibility, community trust, and measurable response.",
          image: "",
          points: [
            "Skit integrations written around your brand, not pasted onto it",
            "Campaign concepts tailored to Ghanaian and diaspora audiences",
            "Distribution across Instagram, TikTok, YouTube, and X",
            "Post-campaign reporting with reach and engagement numbers",
          ],
        },
        {
          kicker: "Events",
          title: "Appearances & hostings",
          text: "On-stage talent, live hosting, and branded experiences that convert attention into attendance.",
          image: "",
          points: [
            "Hosting, MC work, and stage appearances",
            "Branded event segments that feel like part of the show",
            "Crowd warm-up and audience engagement",
            "Promotion to the community before the event",
          ],
        },
        {
          kicker: "Productions",
          title: "Collaborative content",
          text: "Story-led creative work that blends talent, narrative, and distribution without losing the brand voice.",
          image: "",
          points: [
            "Co-created skits and series with your team",
            "Script-to-screen production with Al Maleek & Crew",
            "Brand voice preserved inside native comedy formats",
            "Usage rights agreed upfront",
          ],
        },
      ],
      muted_eyebrow: "What partners get",
      muted_heading: "A clear, structured path from brief to launch.",
      muted_points: [
        "Audience and engagement context for qualified commercial conversations.",
        "Creative options tailored to live experiences, content, events, and brand storytelling.",
        "Transparent process from inquiry to proposal, execution, and post-campaign follow-up.",
      ],
    },
  },
};

function mergeSection<T extends { hero: { headline: string } }>(
  fetched: T | undefined,
  fallback: T,
): T {
  if (!fetched || fetched.hero?.headline === "") return fallback;
  return fetched;
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/site/settings`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return DEFAULT_SITE_CONTENT;
    const fetched = (await response.json()) as Partial<SiteContent>;
    const pages = fetched.pages ?? ({} as SiteContent["pages"]);
    return {
      ...DEFAULT_SITE_CONTENT,
      footer_description:
        fetched.footer_description || DEFAULT_SITE_CONTENT.footer_description,
      contact_email: fetched.contact_email || DEFAULT_SITE_CONTENT.contact_email,
      location: fetched.location || DEFAULT_SITE_CONTENT.location,
      home: mergeSection(fetched.home, DEFAULT_SITE_CONTENT.home),
      pages: {
        academy: mergeSection(pages.academy, DEFAULT_SITE_CONTENT.pages.academy),
        live: mergeSection(pages.live, DEFAULT_SITE_CONTENT.pages.live),
        community: mergeSection(
          pages.community,
          DEFAULT_SITE_CONTENT.pages.community,
        ),
        media: mergeSection(pages.media, DEFAULT_SITE_CONTENT.pages.media),
        partnerships: mergeSection(
          pages.partnerships,
          DEFAULT_SITE_CONTENT.pages.partnerships,
        ),
        shop: mergeSection(pages.shop, DEFAULT_SITE_CONTENT.pages.shop),
        work_with: mergeSection(
          pages.work_with,
          DEFAULT_SITE_CONTENT.pages.work_with,
        ),
      },
    };
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}
