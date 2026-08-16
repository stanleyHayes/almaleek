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
	FounderName       string          `json:"founder_name" bson:"founder_name"`
	FounderRole       string          `json:"founder_role" bson:"founder_role"`
	Brands            []BrandProfile  `json:"brands" bson:"brands"`
	SocialProfiles    []SocialProfile `json:"social_profiles" bson:"social_profiles"`
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

func DefaultSiteSettings() SiteSettings {
	return SiteSettings{
		FooterDescription: "A Ghana-built culture platform turning stories, rooms, and creative ambition into lasting opportunity.", ContactEmail: "hello@almaleek.com", Location: "Accra, Ghana",
		AboutEyebrow: "The story behind the work", AboutHeadline: "AL Maleek builds culture into community, creativity and opportunity.", AboutIntroduction: "AL Maleek is a Ghanaian creator, host and culture builder bringing people together through comedy, storytelling, live experiences and ambitious creative ventures.", AboutStory: "What began as a voice with a point of view has grown into an ecosystem of rooms, shows, ideas and platforms. The work is grounded in Ghana, shaped by community and designed to travel—turning attention into belonging and creative energy into lasting opportunity.", AboutMission: "To create stages, stories and systems that help African talent be seen, supported and paid while giving brands a credible way to participate in culture.", FounderName: "AL Maleek", FounderRole: "Creator · Host · Culture builder",
		Brands:         []BrandProfile{{Name: "AL Maleek", Category: "Creator brand", Description: "Comedy, culture commentary, hosting and partnerships built around a distinctive Ghanaian voice.", URL: "/"}, {Name: "City Night Live", Category: "Live experiences", Description: "Live comedy and culture rooms designed to turn audiences into an active community.", URL: "/events/live"}, {Name: "AL Maleek Academy", Category: "Learning", Description: "Practical learning, mentorship and access for the next generation of creators.", URL: "/academy"}},
		SocialProfiles: []SocialProfile{{Platform: "instagram", Handle: "@almaleek", URL: "https://instagram.com/almaleek", Audience: "Stories & community"}, {Platform: "tiktok", Handle: "@almaleek", URL: "https://tiktok.com/@almaleek", Audience: "Comedy & culture"}, {Platform: "youtube", Handle: "@almaleek", URL: "https://youtube.com/@almaleek", Audience: "Shows & long-form"}, {Platform: "x", Handle: "@almaleek", URL: "https://x.com/almaleek", Audience: "Conversation"}, {Platform: "facebook", Handle: "AL Maleek", URL: "https://facebook.com/almaleek", Audience: "Community"}, {Platform: "linkedin", Handle: "AL Maleek", URL: "https://linkedin.com/company/almaleek", Audience: "Business & partnerships"}},
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
