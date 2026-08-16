package main

import (
	"context"
	"log"
	"os"
	"strings"
	"time"

	"almaleek/internal/adapters/out/mongodb"
	"almaleek/internal/core/domain"
)

const developmentDatabase = "almaleek_dev"

func main() {
	uri := strings.TrimSpace(os.Getenv("MONGODB_URI"))
	database := strings.TrimSpace(os.Getenv("MONGODB_DATABASE"))
	if uri == "" {
		log.Fatal("MONGODB_URI is required")
	}
	if database != developmentDatabase {
		log.Fatalf("refusing to seed %q: MONGODB_DATABASE must be exactly %q", database, developmentDatabase)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Second)
	defer cancel()
	repository := mongodb.NewRepository(uri, database)
	now := time.Now().UTC()

	for _, plan := range domain.DefaultMembershipPlans() {
		plan.UpdatedAt = now
		must(repository.SaveMembershipPlan(ctx, plan))
	}
	settings := domain.DefaultSiteSettings()
	settings.UpdatedAt = now
	must(repository.SaveSiteSettings(ctx, settings))

	creators := []domain.Creator{
		{ID: "seed_creator_ama", Name: "Ama Serwaa", Handle: "amaserwaa", Email: "ama.creator@example.test", Bio: "Culture host and community storyteller.", Status: domain.CreatorStatusActive, CreatedAt: now},
		{ID: "seed_creator_kwame", Name: "Kwame Bediako", Handle: "kwamecreates", Email: "kwame.creator@example.test", Bio: "Filmmaker and campaign collaborator.", Status: domain.CreatorStatusActive, CreatedAt: now},
		{ID: "seed_creator_esi", Name: "Esi Nyarko", Handle: "esinyarko", Email: "esi.creator@example.test", Bio: "Emerging Academy creator building her first format.", Status: domain.CreatorStatusPending, CreatedAt: now},
		{ID: "seed_creator_kojo", Name: "Kojo Mensah", Handle: "kojomedia", Email: "kojo.creator@example.test", Bio: "Comedy producer and live-event contributor.", Status: domain.CreatorStatusActive, CreatedAt: now},
	}
	for _, creator := range creators {
		must(repository.Save(ctx, creator))
	}

	events := []domain.Event{
		{ID: "seed_event_city_night", Name: "City Night Live", StartsAt: time.Date(2026, 10, 17, 19, 0, 0, 0, time.UTC), Venue: "National Theatre, Accra", Capacity: 650, Status: domain.EventStatusOnSale, Description: "Comedy, music and culture in one live room.", CreatedAt: now, UpdatedAt: now},
		{ID: "seed_event_creator_table", Name: "Creator Roundtable", StartsAt: time.Date(2026, 11, 7, 14, 0, 0, 0, time.UTC), Venue: "AL Maleek Studio", Capacity: 80, Status: domain.EventStatusInviteOnly, Description: "A private working session for creators and partners.", CreatedAt: now, UpdatedAt: now},
		{ID: "seed_event_campus", Name: "Campus Comedy Circuit", StartsAt: time.Date(2026, 11, 28, 18, 30, 0, 0, time.UTC), Venue: "University of Ghana", Capacity: 900, Status: domain.EventStatusPublished, Description: "A new-talent showcase and community night.", CreatedAt: now, UpdatedAt: now},
	}
	for _, event := range events {
		must(repository.SaveEvent(ctx, event))
	}

	members := []domain.CommunityMember{
		{ID: "seed_member_adwoa", Name: "Adwoa Boateng", Email: "adwoa.member@example.test", Tier: domain.MembershipTierFree, CreatedAt: now},
		{ID: "seed_member_nana", Name: "Nana Kumi", Email: "nana.insider@example.test", Tier: domain.MembershipTierInsider, CreatedAt: now},
		{ID: "seed_member_akosua", Name: "Akosua Owusu", Email: "akosua.frontrow@example.test", Tier: domain.MembershipTierFrontRow, CreatedAt: now},
		{ID: "seed_member_yaw", Name: "Yaw Asante", Email: "yaw.insider@example.test", Tier: domain.MembershipTierInsider, CreatedAt: now},
	}
	for _, member := range members {
		member.Normalize()
		member.UpdatedAt = now
		must(repository.SaveCommunityMember(ctx, member))
	}

	intakes := []domain.Intake{
		{ID: "seed_intake_partnership", Kind: "partnership", Name: "North Avenue Studio", Email: "partnership@example.test", Organization: "North Avenue Studio", Message: "Interested in a culture-led launch campaign.", Status: domain.IntakeStatusReviewing, CreatedAt: now, UpdatedAt: now},
		{ID: "seed_intake_academy", Kind: "academy", Name: "Mabel Addai", Email: "mabel.academy@example.test", Message: "Interested in content strategy and production.", Status: domain.IntakeStatusNew, CreatedAt: now, UpdatedAt: now},
		{ID: "seed_intake_work", Kind: "work", Name: "BrightWave Ghana", Email: "brief@brightwave.example.test", Organization: "BrightWave Ghana", Message: "Requesting AL Maleek for a brand-hosting engagement.", Status: domain.IntakeStatusNew, CreatedAt: now, UpdatedAt: now},
		{ID: "seed_intake_ticket", Kind: "ticket", Name: "Kofi Arthur", Email: "kofi.ticket@example.test", Message: "Two Front Row reservations for City Night Live.", Status: domain.IntakeStatusNew, CreatedAt: now, UpdatedAt: now},
	}
	for _, intake := range intakes {
		must(repository.SaveIntake(ctx, intake))
	}

	invitations := []domain.Invitation{
		{ID: "seed_invite_collaborator", Token: "dev-collaborator-invite", Name: "Joana Mensima", Email: "joana.collaborator@example.test", Role: "collaborator", Status: domain.InvitationStatusPending, ExpiresAt: now.Add(30 * 24 * time.Hour), CreatedAt: now, UpdatedAt: now},
		{ID: "seed_invite_partner", Token: "dev-brand-partner-invite", Name: "Kweku Abbey", Email: "kweku.partner@example.test", Role: "brand_partner", Status: domain.InvitationStatusPending, ExpiresAt: now.Add(30 * 24 * time.Hour), CreatedAt: now, UpdatedAt: now},
		{ID: "seed_invite_academy", Token: "dev-academy-invite", Name: "Abena Tetteh", Email: "abena.academy@example.test", Role: "academy_member", Status: domain.InvitationStatusPending, ExpiresAt: now.Add(30 * 24 * time.Hour), CreatedAt: now, UpdatedAt: now},
	}
	for _, invitation := range invitations {
		must(repository.SaveInvitation(ctx, invitation))
	}

	log.Printf("seeded %s: %d creators, %d events, %d members, %d intakes, %d invitations, %d plans and site settings", database, len(creators), len(events), len(members), len(intakes), len(invitations), len(domain.DefaultMembershipPlans()))
}

func must(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
