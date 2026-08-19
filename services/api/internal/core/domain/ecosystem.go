package domain

import (
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"
)

const (
	InvitationStatusPending  = "pending"
	InvitationStatusAccepted = "accepted"

	EventStatusDraft      = "draft"
	EventStatusPublished  = "published"
	EventStatusOnSale     = "on_sale"
	EventStatusInviteOnly = "invite_only"
	EventStatusCancelled  = "cancelled"

	IntakeStatusNew       = "new"
	IntakeStatusReviewing = "reviewing"

	MembershipTierFree     = "free"
	MembershipTierInsider  = "insider"
	MembershipTierFrontRow = "front_row"
	MembershipStatusActive = "active"
)

var invitationRoles = map[string]struct{}{
	"creator": {}, "collaborator": {}, "brand_partner": {}, "community_member": {}, "academy_member": {},
}

var intakeKinds = map[string]struct{}{
	"community": {}, "academy": {}, "shop": {}, "partnership": {}, "work": {}, "ticket": {},
}

var membershipTiers = map[string][]string{
	MembershipTierFree:     {"community_feed", "announcements", "public_events"},
	MembershipTierInsider:  {"community_feed", "announcements", "public_events", "exclusive_posts", "member_events", "recordings", "member_discounts"},
	MembershipTierFrontRow: {"community_feed", "announcements", "public_events", "exclusive_posts", "member_events", "recordings", "member_discounts", "priority_tickets", "private_sessions", "vip_experiences"},
}

type CommunityMember struct {
	ID                 string    `json:"id" bson:"id"`
	Name               string    `json:"name" bson:"name"`
	Email              string    `json:"email" bson:"email"`
	Tier               string    `json:"tier" bson:"tier"`
	MembershipStatus   string    `json:"membership_status" bson:"membership_status"`
	SubscriptionStatus string    `json:"subscription_status" bson:"subscription_status"`
	Entitlements       []string  `json:"entitlements" bson:"entitlements"`
	CreatedAt          time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt          time.Time `json:"updated_at" bson:"updated_at"`
}

type MembershipPlan struct {
	Code        string    `json:"code" bson:"code"`
	Name        string    `json:"name" bson:"name"`
	Kicker      string    `json:"kicker" bson:"kicker"`
	Description string    `json:"description" bson:"description"`
	PriceCents  int       `json:"price_cents" bson:"price_cents"`
	Currency    string    `json:"currency" bson:"currency"`
	Interval    string    `json:"interval" bson:"interval"`
	CTA         string    `json:"cta" bson:"cta"`
	Benefits    []string  `json:"benefits" bson:"benefits"`
	Active      bool      `json:"active" bson:"active"`
	SortOrder   int       `json:"sort_order" bson:"sort_order"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
}

type SiteSettings struct {
	FooterDescription string          `json:"footer_description" bson:"footer_description"`
	ContactEmail      string          `json:"contact_email" bson:"contact_email"`
	Location          string          `json:"location" bson:"location"`
	AboutEyebrow      string          `json:"about_eyebrow" bson:"about_eyebrow"`
	AboutHeadline     string          `json:"about_headline" bson:"about_headline"`
	AboutIntroduction string          `json:"about_introduction" bson:"about_introduction"`
	AboutStory        string          `json:"about_story" bson:"about_story"`
	AboutMission      string          `json:"about_mission" bson:"about_mission"`
	AboutStats        []HomeStat      `json:"about_stats" bson:"about_stats"`
	FounderName       string          `json:"founder_name" bson:"founder_name"`
	FounderRole       string          `json:"founder_role" bson:"founder_role"`
	Brands            []BrandProfile  `json:"brands" bson:"brands"`
	SocialProfiles    []SocialProfile `json:"social_profiles" bson:"social_profiles"`
	Home              HomeContent     `json:"home" bson:"home"`
	Pages             PageSet         `json:"pages" bson:"pages"`
	UpdatedAt         time.Time       `json:"updated_at" bson:"updated_at"`
}

type BrandProfile struct {
	Name        string `json:"name" bson:"name"`
	Description string `json:"description" bson:"description"`
	URL         string `json:"url" bson:"url"`
	Category    string `json:"category" bson:"category"`
}
type SocialProfile struct {
	Platform string `json:"platform" bson:"platform"`
	Handle   string `json:"handle" bson:"handle"`
	URL      string `json:"url" bson:"url"`
	Audience string `json:"audience" bson:"audience"`
}

type PageHero struct {
	Eyebrow  string `json:"eyebrow" bson:"eyebrow"`
	Headline string `json:"headline" bson:"headline"`
	Lede     string `json:"lede" bson:"lede"`
}
type ContentCard struct {
	Kicker string `json:"kicker" bson:"kicker"`
	Title  string `json:"title" bson:"title"`
	Text   string `json:"text" bson:"text"`
}
type HomeStat struct {
	Value string `json:"value" bson:"value"`
	Label string `json:"label" bson:"label"`
}
type HomeJourneyCard struct {
	Title string `json:"title" bson:"title"`
	Text  string `json:"text" bson:"text"`
	Href  string `json:"href" bson:"href"`
}
type NextMoveCard struct {
	Title     string `json:"title" bson:"title"`
	Text      string `json:"text" bson:"text"`
	LinkLabel string `json:"link_label" bson:"link_label"`
	Href      string `json:"href" bson:"href"`
}
type LiveEvent struct {
	Date  string `json:"date" bson:"date"`
	Title string `json:"title" bson:"title"`
	Text  string `json:"text" bson:"text"`
	Image string `json:"image" bson:"image"`
}
type MediaStory struct {
	Kind  string `json:"kind" bson:"kind"`
	Title string `json:"title" bson:"title"`
	Meta  string `json:"meta" bson:"meta"`
	Image string `json:"image" bson:"image"`
}
type HomeContent struct {
	Hero           PageHero          `json:"hero" bson:"hero"`
	HeroCardPill   string            `json:"hero_card_pill" bson:"hero_card_pill"`
	HeroCardTitle  string            `json:"hero_card_title" bson:"hero_card_title"`
	HeroCardPoints []string          `json:"hero_card_points" bson:"hero_card_points"`
	Stats          []HomeStat        `json:"stats" bson:"stats"`
	JourneyEyebrow string            `json:"journey_eyebrow" bson:"journey_eyebrow"`
	JourneyHeading string            `json:"journey_heading" bson:"journey_heading"`
	Journey        []HomeJourneyCard `json:"journey" bson:"journey"`
	PillarsEyebrow string            `json:"pillars_eyebrow" bson:"pillars_eyebrow"`
	PillarsHeading string            `json:"pillars_heading" bson:"pillars_heading"`
	Pillars        []string          `json:"pillars" bson:"pillars"`
	NextEyebrow    string            `json:"next_eyebrow" bson:"next_eyebrow"`
	NextHeading    string            `json:"next_heading" bson:"next_heading"`
	NextMoves      []NextMoveCard    `json:"next_moves" bson:"next_moves"`
}
type PageContent struct {
	Hero         PageHero      `json:"hero" bson:"hero"`
	Cards        []ContentCard `json:"cards" bson:"cards"`
	MutedEyebrow string        `json:"muted_eyebrow" bson:"muted_eyebrow"`
	MutedHeading string        `json:"muted_heading" bson:"muted_heading"`
	MutedPoints  []string      `json:"muted_points" bson:"muted_points"`
}
type WorkOffering struct {
	Kicker string   `json:"kicker" bson:"kicker"`
	Title  string   `json:"title" bson:"title"`
	Text   string   `json:"text" bson:"text"`
	Image  string   `json:"image" bson:"image"`
	Points []string `json:"points" bson:"points"`
}
type WorkWithPageContent struct {
	Hero         PageHero       `json:"hero" bson:"hero"`
	Cards        []WorkOffering `json:"cards" bson:"cards"`
	MutedEyebrow string         `json:"muted_eyebrow" bson:"muted_eyebrow"`
	MutedHeading string         `json:"muted_heading" bson:"muted_heading"`
	MutedPoints  []string       `json:"muted_points" bson:"muted_points"`
}
type CommunityPageContent = WorkWithPageContent
type AcademyPageContent = WorkWithPageContent
type PartnershipsPageContent = WorkWithPageContent
type LivePageContent struct {
	PageContent
	Events []LiveEvent `json:"events" bson:"events"`
}
type MediaPageContent struct {
	PageContent
	Stories      []MediaStory `json:"stories" bson:"stories"`
	PressEyebrow string       `json:"press_eyebrow" bson:"press_eyebrow"`
	PressHeading string       `json:"press_heading" bson:"press_heading"`
	PressLede    string       `json:"press_lede" bson:"press_lede"`
	PressEmail   string       `json:"press_email" bson:"press_email"`
}
type PageSet struct {
	Academy      AcademyPageContent      `json:"academy" bson:"academy"`
	Live         LivePageContent         `json:"live" bson:"live"`
	Community    CommunityPageContent    `json:"community" bson:"community"`
	Media        MediaPageContent        `json:"media" bson:"media"`
	Partnerships PartnershipsPageContent `json:"partnerships" bson:"partnerships"`
	Shop         PageContent             `json:"shop" bson:"shop"`
	WorkWith     WorkWithPageContent     `json:"work_with" bson:"work_with"`
}

func DefaultSiteSettings() SiteSettings {
	return SiteSettings{
		FooterDescription: "The digital home of Al Maleek — Ghanaian comedy creator and storyteller — and the community, shows, and ventures growing around the work.", ContactEmail: "hello@almaleekgh.com", Location: "Accra, Ghana",
		AboutEyebrow: "The story behind the skits", AboutHeadline: "Al Maleek turns everyday Ghanaian life into comedy the whole timeline quotes.", AboutIntroduction: "Al Maleek is a Ghanaian digital content creator, comedian, and host — the face of Al Maleek & Crew — building community through skits, storytelling, live shows, and ambitious creative ventures.", AboutStory: "What began as short comedy skits in Accra has grown into one of Ghana's most recognisable new comic voices. In 2026, Al Maleek picked up three nominations at the 6th Ghana Comedy Awards — Comedy Skit Act of the Year, Comic Discovery of the Year, and Comic Group of the Year alongside Al Maleek & Crew. The work is grounded in Ghana, shaped by community, and designed to travel — turning laughs into belonging and creative energy into lasting opportunity.", AboutMission: "To create stages, stories, and systems that help African talent be seen, supported, and paid — while giving brands a credible way to participate in the culture.", FounderName: "Al Maleek", FounderRole: "Comedy creator · Host · Culture builder",
		AboutStats:     []HomeStat{{Value: "3", Label: "2026 Ghana Comedy Awards nominations"}, {Value: "6", Label: "Platforms, one voice"}, {Value: "4", Label: "Live event formats"}, {Value: "100%", Label: "Made in Ghana"}},
		Brands:         []BrandProfile{{Name: "AL Maleek", Category: "Creator brand", Description: "Comedy skits, culture commentary, hosting, and partnerships built around a distinctive Ghanaian voice.", URL: "/"}, {Name: "City Night Live", Category: "Live experiences", Description: "Live comedy and culture rooms that turn online audiences into a community that shows up.", URL: "/events/live"}, {Name: "AL Maleek Academy", Category: "Learning", Description: "Practical learning, mentorship, and access for the next generation of Ghanaian creators.", URL: "/academy"}},
		SocialProfiles: []SocialProfile{{Platform: "instagram", Handle: "@almaleekgh", URL: "https://instagram.com/almaleekgh", Audience: "Skits & behind the scenes"}, {Platform: "tiktok", Handle: "@almaleekgh", URL: "https://tiktok.com/@almaleekgh", Audience: "Comedy & culture"}, {Platform: "youtube", Handle: "@almaleekgh", URL: "https://youtube.com/@almaleekgh", Audience: "Skits & long-form"}, {Platform: "x", Handle: "@almaleekgh", URL: "https://x.com/almaleekgh", Audience: "Conversation"}, {Platform: "facebook", Handle: "Al Maleek", URL: "https://facebook.com/almaleekgh", Audience: "Community"}, {Platform: "linkedin", Handle: "AL Maleek", URL: "https://linkedin.com/company/almaleekgh", Audience: "Business & partnerships"}},
		Home: HomeContent{
			Hero:           PageHero{Eyebrow: "Ghanaian comedy & digital content creator", Headline: "The skits you quote. The community you belong to.", Lede: "Al Maleek is the Ghanaian comedy creator behind Al Maleek & Crew — a three-time 2026 Ghana Comedy Awards nominee turning everyday stories into skits, live shows, learning, and ventures that move culture forward."},
			HeroCardPill:   "Award-nominated",
			HeroCardTitle:  "Comedy with commercial momentum",
			HeroCardPoints: []string{"Three nominations at the 2026 Ghana Comedy Awards", "A skit community that shows up offline", "Live shows, merch, and creator education", "Brand partnerships that feel native"},
			Stats:          []HomeStat{{Value: "3", Label: "Comedy Awards nods"}, {Value: "4", Label: "Ways to plug in"}, {Value: "24/7", Label: "Skits on the timeline"}, {Value: "100%", Label: "Ghana to the world"}},
			JourneyEyebrow: "Built for the full ecosystem",
			JourneyHeading: "From the timeline to the ticket stub, every path has a clear next step.",
			Journey: []HomeJourneyCard{
				{Title: "Work With Al Maleek", Text: "Book skits, appearances, campaigns, event partnerships, and creator collaborations built for culture-first impact.", Href: "/work-with-al-maleek"},
				{Title: "AL Maleek Live", Text: "Catch the next comedy night, premiere, campus jam, or community showcase with seamless ticketing.", Href: "/events/live"},
				{Title: "Community", Text: "Join a space designed for fans, friends, and future members who want access, belonging, and early opportunity.", Href: "/community"},
				{Title: "Media & stories", Text: "Watch the skits, read field notes, and find press stories from inside the wider Al Maleek ecosystem.", Href: "/media"},
				{Title: "Shop", Text: "Own the catchphrases — culture-driven drops, event merch, and premium collectibles that turn fandom into identity.", Href: "/shop"},
				{Title: "Academy", Text: "Learn the craft of content, comedy, performance, and creator business with practical, real-world frameworks.", Href: "/academy"},
				{Title: "Partnerships", Text: "Build sponsor, activation, and collaboration opportunities that feel aligned to the audience and the brand.", Href: "/partnerships"},
			},
			PillarsEyebrow: "Why it works",
			PillarsHeading: "Premium, social, and commercially credible without losing the joke.",
			Pillars:        []string{"Award-nominated comedy with creator-led personality", "A community flywheel that turns laughs into belonging", "Events, commerce, and education that convert excitement into action", "Clear business pathways for brands, learners, collaborators, and fans"},
			NextEyebrow:    "Next move",
			NextHeading:    "Choose the path that fits your intent.",
			NextMoves: []NextMoveCard{
				{Title: "For fans and community members", Text: "Get the skits first — plus the updates, access, and invites that make the community worth showing up for.", LinkLabel: "Join the community →", Href: "/community"},
				{Title: "For brands and collaborators", Text: "Start a structured conversation around events, partnerships, sponsorships, and culture-led growth.", LinkLabel: "Explore partnerships →", Href: "/partnerships"},
			},
		},
		Pages: PageSet{
			Academy: AcademyPageContent{
				Hero: PageHero{Eyebrow: "Academy", Headline: "Learn the craft. Build the business. Grow with clarity.", Lede: "AL Maleek Academy is built for aspiring creators, skit makers, and performers who want practical education that translates into real income, stronger positioning, and sustainable creative growth."},
				Cards: []WorkOffering{
					{Kicker: "Creator growth", Title: "Content strategy", Text: "Build a consistent creator engine without losing your voice, attention, or creative momentum.", Image: "", Points: []string{"A repeatable content calendar that fits real life", "Hooks and formats that fit your voice", "Reading analytics without losing the joke", "A posting rhythm you can actually sustain"}},
					{Kicker: "Comedy & performance", Title: "Craft & delivery", Text: "Strengthen stage presence, storytelling, and timing so your ideas land with real audiences.", Image: "", Points: []string{"Writing drills that sharpen every premise", "Stage presence, timing, and delivery practice", "Testing material in front of live audiences", "Feedback that turns jokes into signatures"}},
					{Kicker: "Business systems", Title: "Creator operations", Text: "Learn the frameworks behind monetization, partnerships, packaging, and repeatable growth.", Image: "", Points: []string{"Pricing and packaging your creative work", "Brand-deal readiness from pitch to payment", "Systems for consistent creator income", "A growth plan that outlives the algorithm"}},
				},
				MutedEyebrow: "Why learners stay",
				MutedHeading: "Actionable education built around real-world creative business.",
				MutedPoints:  []string{"Practical modules covering content, brand, and business growth.", "Creator-first learning paths with clear outcomes and meaningful action.", "Premium education that reinforces trust and long-term brand value."},
			},
			Live: LivePageContent{
				PageContent: PageContent{
					Hero:         PageHero{Eyebrow: "AL Maleek Live", Headline: "High-energy experiences built for community, culture, and connection.", Lede: "Discover comedy nights, premieres, campus events, creator showcases, and intimate live moments designed to bring the timeline together in real life."},
					MutedEyebrow: "What to expect",
					MutedHeading: "Simple access, premium atmosphere, and a clear path to purchase.",
					MutedPoints:  []string{"Venue details, access notes, and pre-show reminders sent directly to buyers.", "Tiered ticketing for community, VIP, and premium live experiences.", "Clear event storytelling built around social proof, trust, and excitement."},
				},
				Events: []LiveEvent{
					{Date: "May 16", Title: "City Night Live", Text: "A signature stand-up and Q&A night with sharp humor, crowd energy, and a premium live atmosphere."},
					{Date: "June 07", Title: "Campus Comedy Jam", Text: "A community-driven event for students, creators, and culture lovers who want a night with momentum."},
					{Date: "July 19", Title: "Creator Circle Showcase", Text: "Live performances, creative conversations, and behind-the-scenes moments from the wider ecosystem."},
				},
			},
			Community: CommunityPageContent{
				Hero: PageHero{Eyebrow: "Community", Headline: "Join the movement and turn attention into belonging.", Lede: "The Al Maleek community is built for fans, friends, collaborators, and future members who want direct access to the skits, the shows, and the opportunities shaping the brand."},
				Cards: []WorkOffering{
					{Kicker: "First access", Title: "See it before the timeline", Text: "Members watch the new skit first and hear every announcement before the public timeline does.", Image: "", Points: []string{"Early access to new skits and episodes", "Drop alerts for merch and releases", "Announcements before they go public", "Priority ticket windows for live events"}},
					{Kicker: "Member-only moments", Title: "Experiences the public never sees", Text: "Private rooms, live conversations, and behind-the-scenes moments reserved for the Circle.", Image: "", Points: []string{"Invites to member-only events and hangouts", "Live Q&As with Al Maleek & Crew", "Behind-the-scenes access from sets and shows", "Recordings of moments you missed live"}},
					{Kicker: "Direct line", Title: "Your voice inside the room", Text: "The community is not an audience — members shape what gets made and hear it straight from the source.", Image: "", Points: []string{"Polls that shape upcoming skits and shows", "Community challenges with real recognition", "Direct updates from Al Maleek", "A say in what the brand builds next"}},
					{Kicker: "Pathways", Title: "From fan to collaborator", Text: "Fandom is the on-ramp — the Circle opens doors into learning, stages, and the wider ecosystem.", Image: "", Points: []string{"A clear route into AL Maleek Academy", "Opportunities at live events and showcases", "Introductions to the wider creative ecosystem", "Room to grow from fan to collaborator"}},
				},
				MutedEyebrow: "Why community matters",
				MutedHeading: "Built for retention, value, and participation that actually means something.",
				MutedPoints:  []string{"Member-driven access and engagement loops that keep fans invested.", "Polls, Q&A sessions, challenges, and insider updates that create belonging.", "Clear pathways into premium experiences, event access, and brand moments."},
			},
			Media: MediaPageContent{
				PageContent: PageContent{
					Hero: PageHero{Eyebrow: "Watch · read · listen", Headline: "Stories with a pulse beyond the timeline.", Lede: "Skits, films, interviews, press, and working notes from the people and places shaping the Al Maleek ecosystem."},
				},
				Stories: []MediaStory{
					{Kind: "New film", Title: "The room before the room", Meta: "08:24 · Behind the scenes"},
					{Kind: "Press", Title: "How Al Maleek is building culture beyond the feed", Meta: "Creative Ghana · 6 min read"},
					{Kind: "Field note", Title: "What a live audience teaches you about community", Meta: "From the studio · Issue 04"},
				},
				PressEyebrow: "Press room",
				PressHeading: "Need verified material for a story?",
				PressLede:    "Find approved biographies, brand notes, selected photography, and a direct press contact.",
				PressEmail:   "press@almaleekgh.com",
			},
			Partnerships: PartnershipsPageContent{
				Hero: PageHero{Eyebrow: "Partnerships", Headline: "Build campaigns and collaborations around culture, trust, and reach.", Lede: "AL Maleek partnerships are designed to create value for both brands and the community—clear, premium, and structured around real alignment, not superficial promotions."},
				Cards: []WorkOffering{
					{Kicker: "Campaigns", Title: "Audience-first marketing", Text: "Partnerships designed to integrate naturally into the brand and community experience with intent.", Image: "", Points: []string{"Skit integrations in a trusted comic voice", "Concepts tailored to Ghanaian and diaspora audiences", "Reach across Instagram, TikTok, YouTube, and X", "Post-campaign reporting with real numbers"}},
					{Kicker: "Sponsorships", Title: "Event & activation support", Text: "Strategic sponsor opportunities tied to live experiences, community moments, and cultural visibility.", Image: "", Points: []string{"Brand presence inside sold-out rooms", "On-stage mentions and branded segments", "Access to a community that shows up", "Sponsor recap content after every event"}},
					{Kicker: "Network", Title: "Creative ecosystem", Text: "Connect with collaborators, talent, and partners building bigger opportunities around the brand.", Image: "", Points: []string{"Access to vetted creators and talent", "Co-production opportunities across the slate", "Multi-brand activations around live moments", "Introductions across the wider ecosystem"}},
				},
				MutedEyebrow: "Partnership model",
				MutedHeading: "A structured path from fit assessment to launch.",
				MutedPoints:  []string{"Review campaign objectives, audience fit, and activation goals before work begins.", "Professional proposal and clear commercial framing built around mutual value.", "Operational planning, execution support, and reporting with a partner-first mindset."},
			},
			Shop: PageContent{
				Hero: PageHero{Eyebrow: "Shop", Headline: "Own the culture with premium drops and story-led merchandise.", Lede: "AL Maleek Shop is where fandom meets identity: limited-edition pieces, event merch, and digital products that carry the culture beyond the screen."},
				Cards: []ContentCard{
					{Kicker: "Limited drop", Title: "Culture Tee Collection", Text: "Premium, wearable pieces made for fans who want style, comfort, and an unmistakable statement."},
					{Kicker: "Event gear", Title: "Live Experience Merch", Text: "Commemorative products tied to signature nights, premieres, and community milestones."},
					{Kicker: "Creator tools", Title: "Digital resources", Text: "Templates, prompts, and educational resources built for creators who want practical growth tools."},
				},
				MutedEyebrow: "Shop principles",
				MutedHeading: "Merch that feels like part of the story, not just a product add-on.",
				MutedPoints:  []string{"Limited-edition energy with scarcity and meaningful story context.", "Premium design language that still feels accessible and culturally relevant.", "Member-first access, drop alerts, and post-purchase retention built into the experience."},
			},
			WorkWith: WorkWithPageContent{
				Hero: PageHero{Eyebrow: "Work with Al Maleek", Headline: "Build a partnership that feels native to culture.", Lede: "From skit integrations and campaigns to live events, sponsorships, and production, Al Maleek creates premium, high-trust opportunities for brands and organizations that want to connect with an engaged audience in a way that feels authentic, not forced."},
				Cards: []WorkOffering{
					{Kicker: "Brand deals", Title: "Campaigns & activations", Text: "High-impact partnerships designed to build visibility, community trust, and measurable response.", Image: "", Points: []string{"Skit integrations written around your brand, not pasted onto it", "Campaign concepts tailored to Ghanaian and diaspora audiences", "Distribution across Instagram, TikTok, YouTube, and X", "Post-campaign reporting with reach and engagement numbers"}},
					{Kicker: "Events", Title: "Appearances & hostings", Text: "On-stage talent, live hosting, and branded experiences that convert attention into attendance.", Image: "", Points: []string{"Hosting, MC work, and stage appearances", "Branded event segments that feel like part of the show", "Crowd warm-up and audience engagement", "Promotion to the community before the event"}},
					{Kicker: "Productions", Title: "Collaborative content", Text: "Story-led creative work that blends talent, narrative, and distribution without losing the brand voice.", Image: "", Points: []string{"Co-created skits and series with your team", "Script-to-screen production with Al Maleek & Crew", "Brand voice preserved inside native comedy formats", "Usage rights agreed upfront"}},
				},
				MutedEyebrow: "What partners get",
				MutedHeading: "A clear, structured path from brief to launch.",
				MutedPoints:  []string{"Audience and engagement context for qualified commercial conversations.", "Creative options tailored to live experiences, content, events, and brand storytelling.", "Transparent process from inquiry to proposal, execution, and post-campaign follow-up."},
			},
		},
	}
}
func (s *SiteSettings) Normalize() {
	s.FooterDescription = strings.TrimSpace(s.FooterDescription)
	s.ContactEmail = strings.ToLower(strings.TrimSpace(s.ContactEmail))
	s.Location = strings.TrimSpace(s.Location)
	s.AboutEyebrow = strings.TrimSpace(s.AboutEyebrow)
	s.AboutHeadline = strings.TrimSpace(s.AboutHeadline)
	s.AboutIntroduction = strings.TrimSpace(s.AboutIntroduction)
	s.AboutStory = strings.TrimSpace(s.AboutStory)
	s.AboutMission = strings.TrimSpace(s.AboutMission)
	for index := range s.AboutStats {
		s.AboutStats[index].Value = strings.TrimSpace(s.AboutStats[index].Value)
		s.AboutStats[index].Label = strings.TrimSpace(s.AboutStats[index].Label)
	}
	s.FounderName = strings.TrimSpace(s.FounderName)
	s.FounderRole = strings.TrimSpace(s.FounderRole)
	for index := range s.Brands {
		s.Brands[index].Name = strings.TrimSpace(s.Brands[index].Name)
		s.Brands[index].Description = strings.TrimSpace(s.Brands[index].Description)
		s.Brands[index].URL = strings.TrimSpace(s.Brands[index].URL)
		s.Brands[index].Category = strings.TrimSpace(s.Brands[index].Category)
	}
	for index := range s.SocialProfiles {
		s.SocialProfiles[index].Platform = strings.ToLower(strings.TrimSpace(s.SocialProfiles[index].Platform))
		s.SocialProfiles[index].Handle = strings.TrimSpace(s.SocialProfiles[index].Handle)
		s.SocialProfiles[index].URL = strings.TrimSpace(s.SocialProfiles[index].URL)
		s.SocialProfiles[index].Audience = strings.TrimSpace(s.SocialProfiles[index].Audience)
	}
	normalizeHomeContent(&s.Home)
	normalizeWorkWithContent(&s.Pages.Academy)
	normalizePageContent(&s.Pages.Live.PageContent)
	for index := range s.Pages.Live.Events {
		s.Pages.Live.Events[index].Date = strings.TrimSpace(s.Pages.Live.Events[index].Date)
		s.Pages.Live.Events[index].Title = strings.TrimSpace(s.Pages.Live.Events[index].Title)
		s.Pages.Live.Events[index].Text = strings.TrimSpace(s.Pages.Live.Events[index].Text)
		s.Pages.Live.Events[index].Image = strings.TrimSpace(s.Pages.Live.Events[index].Image)
	}
	normalizeWorkWithContent(&s.Pages.Community)
	normalizePageContent(&s.Pages.Media.PageContent)
	for index := range s.Pages.Media.Stories {
		s.Pages.Media.Stories[index].Kind = strings.TrimSpace(s.Pages.Media.Stories[index].Kind)
		s.Pages.Media.Stories[index].Title = strings.TrimSpace(s.Pages.Media.Stories[index].Title)
		s.Pages.Media.Stories[index].Meta = strings.TrimSpace(s.Pages.Media.Stories[index].Meta)
		s.Pages.Media.Stories[index].Image = strings.TrimSpace(s.Pages.Media.Stories[index].Image)
	}
	s.Pages.Media.PressEyebrow = strings.TrimSpace(s.Pages.Media.PressEyebrow)
	s.Pages.Media.PressHeading = strings.TrimSpace(s.Pages.Media.PressHeading)
	s.Pages.Media.PressLede = strings.TrimSpace(s.Pages.Media.PressLede)
	s.Pages.Media.PressEmail = strings.ToLower(strings.TrimSpace(s.Pages.Media.PressEmail))
	normalizeWorkWithContent(&s.Pages.Partnerships)
	normalizePageContent(&s.Pages.Shop)
	normalizeWorkWithContent(&s.Pages.WorkWith)
}

func normalizePageHero(hero *PageHero) {
	hero.Eyebrow = strings.TrimSpace(hero.Eyebrow)
	hero.Headline = strings.TrimSpace(hero.Headline)
	hero.Lede = strings.TrimSpace(hero.Lede)
}

func normalizeHomeContent(home *HomeContent) {
	normalizePageHero(&home.Hero)
	home.HeroCardPill = strings.TrimSpace(home.HeroCardPill)
	home.HeroCardTitle = strings.TrimSpace(home.HeroCardTitle)
	for index := range home.HeroCardPoints {
		home.HeroCardPoints[index] = strings.TrimSpace(home.HeroCardPoints[index])
	}
	for index := range home.Stats {
		home.Stats[index].Value = strings.TrimSpace(home.Stats[index].Value)
		home.Stats[index].Label = strings.TrimSpace(home.Stats[index].Label)
	}
	home.JourneyEyebrow = strings.TrimSpace(home.JourneyEyebrow)
	home.JourneyHeading = strings.TrimSpace(home.JourneyHeading)
	for index := range home.Journey {
		home.Journey[index].Title = strings.TrimSpace(home.Journey[index].Title)
		home.Journey[index].Text = strings.TrimSpace(home.Journey[index].Text)
		home.Journey[index].Href = strings.TrimSpace(home.Journey[index].Href)
	}
	home.PillarsEyebrow = strings.TrimSpace(home.PillarsEyebrow)
	home.PillarsHeading = strings.TrimSpace(home.PillarsHeading)
	for index := range home.Pillars {
		home.Pillars[index] = strings.TrimSpace(home.Pillars[index])
	}
	home.NextEyebrow = strings.TrimSpace(home.NextEyebrow)
	home.NextHeading = strings.TrimSpace(home.NextHeading)
	for index := range home.NextMoves {
		home.NextMoves[index].Title = strings.TrimSpace(home.NextMoves[index].Title)
		home.NextMoves[index].Text = strings.TrimSpace(home.NextMoves[index].Text)
		home.NextMoves[index].LinkLabel = strings.TrimSpace(home.NextMoves[index].LinkLabel)
		home.NextMoves[index].Href = strings.TrimSpace(home.NextMoves[index].Href)
	}
}

func normalizePageContent(page *PageContent) {
	normalizePageHero(&page.Hero)
	for index := range page.Cards {
		page.Cards[index].Kicker = strings.TrimSpace(page.Cards[index].Kicker)
		page.Cards[index].Title = strings.TrimSpace(page.Cards[index].Title)
		page.Cards[index].Text = strings.TrimSpace(page.Cards[index].Text)
	}
	page.MutedEyebrow = strings.TrimSpace(page.MutedEyebrow)
	page.MutedHeading = strings.TrimSpace(page.MutedHeading)
	for index := range page.MutedPoints {
		page.MutedPoints[index] = strings.TrimSpace(page.MutedPoints[index])
	}
}

func normalizeWorkWithContent(page *WorkWithPageContent) {
	normalizePageHero(&page.Hero)
	for index := range page.Cards {
		page.Cards[index].Kicker = strings.TrimSpace(page.Cards[index].Kicker)
		page.Cards[index].Title = strings.TrimSpace(page.Cards[index].Title)
		page.Cards[index].Text = strings.TrimSpace(page.Cards[index].Text)
		page.Cards[index].Image = strings.TrimSpace(page.Cards[index].Image)
		for point := range page.Cards[index].Points {
			page.Cards[index].Points[point] = strings.TrimSpace(page.Cards[index].Points[point])
		}
	}
	page.MutedEyebrow = strings.TrimSpace(page.MutedEyebrow)
	page.MutedHeading = strings.TrimSpace(page.MutedHeading)
	for index := range page.MutedPoints {
		page.MutedPoints[index] = strings.TrimSpace(page.MutedPoints[index])
	}
}
func (s SiteSettings) Validate() error {
	if s.FooterDescription == "" || s.Location == "" {
		return errors.New("footer description and location are required")
	}
	if _, err := mail.ParseAddress(s.ContactEmail); err != nil {
		return errors.New("contact email is invalid")
	}
	if s.AboutHeadline == "" || s.AboutIntroduction == "" || s.AboutStory == "" || s.AboutMission == "" {
		return errors.New("about headline, introduction, story and mission are required")
	}
	if len(s.Brands) < 1 || len(s.SocialProfiles) < 1 {
		return errors.New("at least one brand and social profile are required")
	}
	for _, profile := range s.SocialProfiles {
		if profile.Platform == "" || profile.Handle == "" || !strings.HasPrefix(profile.URL, "https://") {
			return errors.New("every social profile requires a platform, handle and https URL")
		}
	}
	return nil
}

func DefaultMembershipPlans() []MembershipPlan {
	return []MembershipPlan{
		{Code: MembershipTierFree, Name: "Circle", Kicker: "Free", Description: "Get the updates, conversations, and community moments that keep you close to the work.", Currency: "USD", Interval: "month", CTA: "Join free", Benefits: []string{"Community feed", "Announcements", "Public events"}, Active: true, SortOrder: 1},
		{Code: MembershipTierInsider, Name: "Insiders", Kicker: "Member", Description: "Early access, premium updates, and entry to exclusive community moments and event opportunities.", PriceCents: 1900, Currency: "USD", Interval: "month", CTA: "Upgrade to Insiders", Benefits: []string{"Exclusive stories", "Recordings", "Member events", "Discounts"}, Active: true, SortOrder: 2},
		{Code: MembershipTierFrontRow, Name: "Front Row", Kicker: "VIP", Description: "Priority access to events, community recognition, and premium experiences with deeper involvement.", PriceCents: 4900, Currency: "USD", Interval: "month", CTA: "Unlock premium access", Benefits: []string{"Priority tickets", "Private sessions", "VIP experiences"}, Active: true, SortOrder: 3},
	}
}

func (p *MembershipPlan) Normalize() {
	p.Code = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(p.Code), " ", "_"))
	p.Name, p.Kicker, p.Description, p.CTA = strings.TrimSpace(p.Name), strings.TrimSpace(p.Kicker), strings.TrimSpace(p.Description), strings.TrimSpace(p.CTA)
	p.Currency = strings.ToUpper(strings.TrimSpace(p.Currency))
	p.Interval = strings.ToLower(strings.TrimSpace(p.Interval))
	if p.Currency == "" {
		p.Currency = "USD"
	}
	if p.Interval == "" {
		p.Interval = "month"
	}
	for index := range p.Benefits {
		p.Benefits[index] = strings.TrimSpace(p.Benefits[index])
	}
}

func (p MembershipPlan) Validate() error {
	if _, ok := membershipTiers[p.Code]; !ok {
		return fmt.Errorf("membership plan %q is not supported", p.Code)
	}
	if p.Name == "" || p.Description == "" || p.CTA == "" {
		return errors.New("plan name, description and call to action are required")
	}
	if p.PriceCents < 0 {
		return errors.New("plan price cannot be negative")
	}
	if p.Currency != "USD" {
		return errors.New("membership plan currency must be USD")
	}
	if p.Interval != "month" {
		return errors.New("membership plan interval must be month")
	}
	if len(p.Benefits) < 1 {
		return errors.New("at least one plan benefit is required")
	}
	return nil
}

func (m *CommunityMember) Normalize() {
	m.Name = strings.TrimSpace(m.Name)
	m.Email = strings.ToLower(strings.TrimSpace(m.Email))
	m.Tier = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(m.Tier), " ", "_"))
	if m.Tier == "" {
		m.Tier = MembershipTierFree
	}
	m.MembershipStatus = MembershipStatusActive
	if m.Tier == MembershipTierFree {
		m.SubscriptionStatus = "not_required"
	} else {
		m.SubscriptionStatus = "active"
	}
	m.Entitlements = append([]string(nil), membershipTiers[m.Tier]...)
}

func (m CommunityMember) Validate() error {
	if m.Name == "" {
		return errors.New("member name is required")
	}
	if _, err := mail.ParseAddress(m.Email); err != nil {
		return errors.New("member email is invalid")
	}
	if _, ok := membershipTiers[m.Tier]; !ok {
		return fmt.Errorf("membership tier %q is not supported", m.Tier)
	}
	return nil
}

type Invitation struct {
	ID         string     `json:"id" bson:"id"`
	Token      string     `json:"token" bson:"token"`
	Name       string     `json:"name" bson:"name"`
	Email      string     `json:"email" bson:"email"`
	Role       string     `json:"role" bson:"role"`
	Status     string     `json:"status" bson:"status"`
	ExpiresAt  time.Time  `json:"expires_at" bson:"expires_at"`
	AcceptedAt *time.Time `json:"accepted_at,omitempty" bson:"accepted_at,omitempty"`
	CreatedAt  time.Time  `json:"created_at" bson:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at" bson:"updated_at"`
}

func (i *Invitation) Normalize() {
	i.Name = strings.TrimSpace(i.Name)
	i.Email = strings.ToLower(strings.TrimSpace(i.Email))
	i.Role = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(i.Role), " ", "_"))
	i.Token = strings.TrimSpace(i.Token)
	i.Status = strings.ToLower(strings.TrimSpace(i.Status))
	if i.Status == "" {
		i.Status = InvitationStatusPending
	}
}

func (i Invitation) Validate() error {
	if i.Name == "" {
		return errors.New("invitation name is required")
	}
	if _, err := mail.ParseAddress(i.Email); err != nil {
		return errors.New("invitation email is invalid")
	}
	if _, ok := invitationRoles[i.Role]; !ok {
		return fmt.Errorf("invitation role %q is not supported", i.Role)
	}
	if i.ExpiresAt.IsZero() {
		return errors.New("invitation expiry is required")
	}
	if i.Status != InvitationStatusPending && i.Status != InvitationStatusAccepted {
		return fmt.Errorf("invitation status %q is not supported", i.Status)
	}
	return nil
}

type Event struct {
	ID          string    `json:"id" bson:"id"`
	Name        string    `json:"name" bson:"name"`
	StartsAt    time.Time `json:"starts_at" bson:"starts_at"`
	Venue       string    `json:"venue" bson:"venue"`
	Capacity    int       `json:"capacity" bson:"capacity"`
	Status      string    `json:"status" bson:"status"`
	Description string    `json:"description,omitempty" bson:"description,omitempty"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
}

func (e *Event) Normalize() {
	e.Name = strings.TrimSpace(e.Name)
	e.Venue = strings.TrimSpace(e.Venue)
	e.Description = strings.TrimSpace(e.Description)
	e.Status = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(e.Status), " ", "_"))
	if e.Status == "" {
		e.Status = EventStatusDraft
	}
}

func (e Event) Validate() error {
	if e.Name == "" {
		return errors.New("event name is required")
	}
	if e.StartsAt.IsZero() {
		return errors.New("event start time is required")
	}
	if e.Venue == "" {
		return errors.New("event venue is required")
	}
	if e.Capacity < 1 || e.Capacity > 1_000_000 {
		return errors.New("event capacity must be between 1 and 1000000")
	}
	switch e.Status {
	case EventStatusDraft, EventStatusPublished, EventStatusOnSale, EventStatusInviteOnly, EventStatusCancelled:
		return nil
	default:
		return fmt.Errorf("event status %q is not supported", e.Status)
	}
}

type Intake struct {
	ID           string    `json:"id" bson:"id"`
	Kind         string    `json:"kind" bson:"kind"`
	Name         string    `json:"name" bson:"name"`
	Email        string    `json:"email" bson:"email"`
	Organization string    `json:"organization,omitempty" bson:"organization,omitempty"`
	Message      string    `json:"message,omitempty" bson:"message,omitempty"`
	Status       string    `json:"status" bson:"status"`
	CreatedAt    time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" bson:"updated_at"`
}

func (i *Intake) Normalize() {
	i.Kind = strings.ToLower(strings.TrimSpace(i.Kind))
	i.Name = strings.TrimSpace(i.Name)
	i.Email = strings.ToLower(strings.TrimSpace(i.Email))
	i.Organization = strings.TrimSpace(i.Organization)
	i.Message = strings.TrimSpace(i.Message)
	i.Status = strings.ToLower(strings.TrimSpace(i.Status))
	if i.Status == "" {
		i.Status = IntakeStatusNew
	}
}

func (i Intake) Validate() error {
	if _, ok := intakeKinds[i.Kind]; !ok {
		return fmt.Errorf("intake kind %q is not supported", i.Kind)
	}
	if i.Name == "" && i.Kind != "shop" && i.Kind != "ticket" {
		return errors.New("intake name is required")
	}
	if _, err := mail.ParseAddress(i.Email); err != nil {
		return errors.New("intake email is invalid")
	}
	if len(i.Message) > 5000 {
		return errors.New("intake message must not exceed 5000 characters")
	}
	if i.Status != IntakeStatusNew && i.Status != IntakeStatusReviewing {
		return fmt.Errorf("intake status %q is not supported", i.Status)
	}
	return nil
}
