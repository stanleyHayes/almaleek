package usecases

import (
	"context"
	"errors"
	"slices"
	"testing"
	"time"

	"almaleek/internal/adapters/out/memory"
	"almaleek/internal/core/domain"
)

func TestExpiredInvitationCannotBeAccepted(t *testing.T) {
	now := time.Date(2026, time.August, 16, 12, 0, 0, 0, time.UTC)
	service := NewEcosystemService(memory.NewRepository())
	service.now = func() time.Time { return now }
	invitation, err := service.IssueInvitation(context.Background(), domain.Invitation{
		Name:      "Adjoa Nartey",
		Email:     "adjoa@example.com",
		Role:      "collaborator",
		ExpiresAt: now.Add(time.Hour),
	})
	if err != nil {
		t.Fatalf("IssueInvitation returned error: %v", err)
	}
	service.now = func() time.Time { return now.Add(2 * time.Hour) }
	if _, err := service.AcceptInvitation(context.Background(), invitation.Token); !errors.Is(err, ErrInvitationExpired) {
		t.Fatalf("AcceptInvitation error = %v, want %v", err, ErrInvitationExpired)
	}
	stored, err := service.GetInvitation(context.Background(), invitation.Token)
	if err != nil {
		t.Fatalf("GetInvitation returned error: %v", err)
	}
	if stored.Status != domain.InvitationStatusPending || stored.AcceptedAt != nil {
		t.Fatalf("expired invitation was mutated: %#v", stored)
	}
}

func TestLegacySeedStatsAreMigrated(t *testing.T) {
	service := NewEcosystemService(memory.NewRepository())
	seeded := domain.DefaultSiteSettings()
	seeded.AboutStats = legacySeedAboutStats
	seeded.SocialProfiles = legacySeedSocialProfiles
	if _, err := service.SaveSiteSettings(context.Background(), seeded); err != nil {
		t.Fatalf("SaveSiteSettings returned error: %v", err)
	}
	loaded, err := service.GetSiteSettings(context.Background())
	if err != nil {
		t.Fatalf("GetSiteSettings returned error: %v", err)
	}
	defaults := domain.DefaultSiteSettings()
	if !slices.Equal(loaded.AboutStats, defaults.AboutStats) {
		t.Fatalf("legacy stats were not migrated: %#v", loaded.AboutStats)
	}
	if !slices.Equal(loaded.SocialProfiles, defaults.SocialProfiles) {
		t.Fatalf("legacy social profiles were not migrated: %#v", loaded.SocialProfiles)
	}

	customised := loaded
	customised.AboutStats = []domain.HomeStat{{Value: "500K+", Label: "Combined audience"}}
	if _, err := service.SaveSiteSettings(context.Background(), customised); err != nil {
		t.Fatalf("SaveSiteSettings returned error: %v", err)
	}
	reloaded, err := service.GetSiteSettings(context.Background())
	if err != nil {
		t.Fatalf("GetSiteSettings returned error: %v", err)
	}
	if !slices.Equal(reloaded.AboutStats, customised.AboutStats) {
		t.Fatalf("admin-customised stats were overwritten: %#v", reloaded.AboutStats)
	}
}

func TestOriginalSeedAndEmptyStatsAreMigrated(t *testing.T) {
	service := NewEcosystemService(memory.NewRepository())
	seeded := domain.DefaultSiteSettings()
	seeded.AboutStats = nil
	seeded.SocialProfiles = legacySeedSocialProfilesOriginal
	if _, err := service.SaveSiteSettings(context.Background(), seeded); err != nil {
		t.Fatalf("SaveSiteSettings returned error: %v", err)
	}
	loaded, err := service.GetSiteSettings(context.Background())
	if err != nil {
		t.Fatalf("GetSiteSettings returned error: %v", err)
	}
	defaults := domain.DefaultSiteSettings()
	if !slices.Equal(loaded.AboutStats, defaults.AboutStats) {
		t.Fatalf("empty stats were not back-filled: %#v", loaded.AboutStats)
	}
	if !slices.Equal(loaded.SocialProfiles, defaults.SocialProfiles) {
		t.Fatalf("original seed social profiles were not migrated: %#v", loaded.SocialProfiles)
	}
}

type recordingSender struct {
	emails []string
	urls   []string
}

func (s *recordingSender) SendWelcomeEmail(context.Context, string, string) error { return nil }

func (s *recordingSender) SendInvitationEmail(_ context.Context, invitation domain.Invitation, inviteURL string) error {
	s.emails = append(s.emails, invitation.Email)
	s.urls = append(s.urls, inviteURL)
	return nil
}

func TestIssueInvitationSendsEmail(t *testing.T) {
	service := NewEcosystemService(memory.NewRepository())
	sender := &recordingSender{}
	service.WithInvitationSender(sender, "https://circle.almaleekgh.com/")
	invitation, err := service.IssueInvitation(context.Background(), domain.Invitation{
		Name: "Kofi Mensah", Email: "kofi@example.com", Role: "creator",
	})
	if err != nil {
		t.Fatalf("IssueInvitation returned error: %v", err)
	}
	if len(sender.emails) != 1 || sender.emails[0] != "kofi@example.com" {
		t.Fatalf("invitation email not sent: %#v", sender.emails)
	}
	wantURL := "https://circle.almaleekgh.com/invite/" + invitation.Token
	if sender.urls[0] != wantURL {
		t.Fatalf("invite URL = %q, want %q", sender.urls[0], wantURL)
	}
}

func TestIssueInvitationReportsEmailFailureAfterPersistence(t *testing.T) {
	service := NewEcosystemService(memory.NewRepository()).WithInvitationSender(&failingSender{}, "https://circle.almaleekgh.com")
	invitation, err := service.IssueInvitation(context.Background(), domain.Invitation{
		Name: "Kofi Mensah", Email: "kofi@example.com", Role: "creator",
	})
	var postCommit PostCommitError
	if !errors.As(err, &postCommit) {
		t.Fatalf("error = %v, want PostCommitError", err)
	}
	if invitation.ID == "" {
		t.Fatalf("invitation was not persisted before email failure: %#v", invitation)
	}
	listed, err := service.ListInvitations(context.Background())
	if err != nil || len(listed) != 1 {
		t.Fatalf("invitation missing after email failure: %v %#v", err, listed)
	}
}
