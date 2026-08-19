package usecases

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"slices"
	"strings"
	"time"

	"almaleek/internal/core/domain"
	"almaleek/internal/core/ports"
)

var (
	ErrInvitationNotFound        = errors.New("invitation not found")
	ErrInvitationExpired         = errors.New("invitation has expired")
	ErrInvitationAlreadyAccepted = errors.New("invitation has already been accepted")
)

// Exact values the original seed wrote, kept so GetSiteSettings can recognise
// untouched installs and migrate them to the verified audience figures.
var legacySeedAboutStats = []domain.HomeStat{
	{Value: "3", Label: "2026 Ghana Comedy Awards nominations"},
	{Value: "6", Label: "Platforms, one voice"},
	{Value: "4", Label: "Live event formats"},
	{Value: "100%", Label: "Made in Ghana"},
}

var legacySeedSocialProfiles = []domain.SocialProfile{
	{Platform: "instagram", Handle: "@almaleekgh", URL: "https://instagram.com/almaleekgh", Audience: "Skits & behind the scenes"},
	{Platform: "tiktok", Handle: "@almaleekgh", URL: "https://tiktok.com/@almaleekgh", Audience: "Comedy & culture"},
	{Platform: "youtube", Handle: "@almaleekgh", URL: "https://youtube.com/@almaleekgh", Audience: "Skits & long-form"},
	{Platform: "x", Handle: "@almaleekgh", URL: "https://x.com/almaleekgh", Audience: "Conversation"},
	{Platform: "facebook", Handle: "Al Maleek", URL: "https://facebook.com/almaleekgh", Audience: "Community"},
	{Platform: "linkedin", Handle: "AL Maleek", URL: "https://linkedin.com/company/almaleekgh", Audience: "Business & partnerships"},
}

// The first production seed used an even older set of guessed handles.
var legacySeedSocialProfilesOriginal = []domain.SocialProfile{
	{Platform: "instagram", Handle: "@almaleek", URL: "https://instagram.com/almaleek", Audience: "Stories & community"},
	{Platform: "tiktok", Handle: "@almaleek", URL: "https://tiktok.com/@almaleek", Audience: "Comedy & culture"},
	{Platform: "youtube", Handle: "@almaleek", URL: "https://youtube.com/@almaleek", Audience: "Shows & long-form"},
	{Platform: "x", Handle: "@almaleek", URL: "https://x.com/almaleek", Audience: "Conversation"},
	{Platform: "facebook", Handle: "AL Maleek", URL: "https://facebook.com/almaleek", Audience: "Community"},
	{Platform: "linkedin", Handle: "AL Maleek", URL: "https://linkedin.com/company/almaleek", Audience: "Business & partnerships"},
}

type ValidationError struct{ Err error }

func (e ValidationError) Error() string { return e.Err.Error() }
func (e ValidationError) Unwrap() error { return e.Err }

type EcosystemService struct {
	invitations   ports.InvitationRepository
	events        ports.EventRepository
	intakes       ports.IntakeRepository
	members       ports.CommunityMemberRepository
	plans         ports.MembershipPlanRepository
	settings      ports.SiteSettingsRepository
	sender        ports.EmailSender
	inviteBaseURL string
	now           func() time.Time
}

func NewEcosystemService(repo interface {
	ports.InvitationRepository
	ports.EventRepository
	ports.IntakeRepository
	ports.CommunityMemberRepository
	ports.MembershipPlanRepository
	ports.SiteSettingsRepository
}) *EcosystemService {
	return &EcosystemService{invitations: repo, events: repo, intakes: repo, members: repo, plans: repo, settings: repo, now: time.Now}
}

// WithInvitationSender enables invitation emails. baseURL is the public client
// origin invitations link to, e.g. https://circle.almaleekgh.com.
func (s *EcosystemService) WithInvitationSender(sender ports.EmailSender, baseURL string) *EcosystemService {
	s.sender = sender
	s.inviteBaseURL = strings.TrimRight(strings.TrimSpace(baseURL), "/")
	return s
}

func (s *EcosystemService) GetSiteSettings(ctx context.Context) (domain.SiteSettings, error) {
	settings, err := s.settings.GetSiteSettings(ctx)
	if err == nil {
		defaults := domain.DefaultSiteSettings()
		// Seed migration: the first seeds shipped placeholder stats and guessed
		// social handles. Installations still carrying those exact seed values
		// (or no stats at all) get the verified audience numbers; admin-
		// customised values win.
		if len(settings.AboutStats) == 0 || slices.Equal(settings.AboutStats, legacySeedAboutStats) {
			settings.AboutStats = defaults.AboutStats
		}
		if slices.Equal(settings.SocialProfiles, legacySeedSocialProfiles) ||
			slices.Equal(settings.SocialProfiles, legacySeedSocialProfilesOriginal) {
			settings.SocialProfiles = defaults.SocialProfiles
		}
		if settings.Home.Hero.Headline == "" {
			settings.Home = defaults.Home
		}
		if settings.Pages.Academy.Hero.Headline == "" {
			settings.Pages.Academy = defaults.Pages.Academy
		}
		if settings.Pages.Live.Hero.Headline == "" {
			settings.Pages.Live = defaults.Pages.Live
		}
		if settings.Pages.Community.Hero.Headline == "" {
			settings.Pages.Community = defaults.Pages.Community
		}
		if settings.Pages.Media.Hero.Headline == "" {
			settings.Pages.Media = defaults.Pages.Media
		}
		if settings.Pages.Partnerships.Hero.Headline == "" {
			settings.Pages.Partnerships = defaults.Pages.Partnerships
		}
		if settings.Pages.Shop.Hero.Headline == "" {
			settings.Pages.Shop = defaults.Pages.Shop
		}
		if settings.Pages.WorkWith.Hero.Headline == "" {
			settings.Pages.WorkWith = defaults.Pages.WorkWith
		}
		return settings, nil
	}
	if !errors.Is(err, ports.ErrNotFound) {
		return domain.SiteSettings{}, err
	}
	settings = domain.DefaultSiteSettings()
	settings.UpdatedAt = s.now().UTC()
	if err := s.settings.SaveSiteSettings(ctx, settings); err != nil {
		return domain.SiteSettings{}, err
	}
	return settings, nil
}
func (s *EcosystemService) SaveSiteSettings(ctx context.Context, settings domain.SiteSettings) (domain.SiteSettings, error) {
	settings.Normalize()
	if err := settings.Validate(); err != nil {
		return domain.SiteSettings{}, ValidationError{Err: err}
	}
	settings.UpdatedAt = s.now().UTC()
	if err := s.settings.SaveSiteSettings(ctx, settings); err != nil {
		return domain.SiteSettings{}, err
	}
	return settings, nil
}

func (s *EcosystemService) ListMembershipPlans(ctx context.Context) ([]domain.MembershipPlan, error) {
	plans, err := s.plans.ListMembershipPlans(ctx)
	if err != nil {
		return nil, err
	}
	if len(plans) > 0 {
		return plans, nil
	}
	for _, plan := range domain.DefaultMembershipPlans() {
		plan.UpdatedAt = s.now().UTC()
		if err := s.plans.SaveMembershipPlan(ctx, plan); err != nil {
			return nil, err
		}
	}
	return s.plans.ListMembershipPlans(ctx)
}

func (s *EcosystemService) SaveMembershipPlan(ctx context.Context, plan domain.MembershipPlan) (domain.MembershipPlan, error) {
	plan.Normalize()
	if err := plan.Validate(); err != nil {
		return domain.MembershipPlan{}, ValidationError{Err: err}
	}
	plan.UpdatedAt = s.now().UTC()
	if err := s.plans.SaveMembershipPlan(ctx, plan); err != nil {
		return domain.MembershipPlan{}, err
	}
	return plan, nil
}

func (s *EcosystemService) JoinCommunity(ctx context.Context, member domain.CommunityMember) (domain.CommunityMember, error) {
	member.Normalize()
	if err := member.Validate(); err != nil {
		return domain.CommunityMember{}, ValidationError{Err: err}
	}
	if existing, err := s.members.GetCommunityMemberByEmail(ctx, member.Email); err == nil {
		if existing.Tier == member.Tier {
			return existing, nil
		}
		member.ID, member.CreatedAt = existing.ID, existing.CreatedAt
	} else if !errors.Is(err, ports.ErrNotFound) {
		return domain.CommunityMember{}, err
	}
	if member.ID == "" {
		id, err := randomID(8)
		if err != nil {
			return domain.CommunityMember{}, err
		}
		member.ID = "mem_" + id
	}
	now := s.now().UTC()
	if member.CreatedAt.IsZero() {
		member.CreatedAt = now
	}
	member.UpdatedAt = now
	if err := s.members.SaveCommunityMember(ctx, member); err != nil {
		return domain.CommunityMember{}, err
	}
	return member, nil
}

func (s *EcosystemService) ListCommunityMembers(ctx context.Context) ([]domain.CommunityMember, error) {
	return s.members.ListCommunityMembers(ctx)
}

func (s *EcosystemService) GetCommunityMember(ctx context.Context, id string) (domain.CommunityMember, error) {
	items, err := s.members.ListCommunityMembers(ctx)
	if err != nil {
		return domain.CommunityMember{}, err
	}
	for _, member := range items {
		if member.ID == strings.TrimSpace(id) {
			return member, nil
		}
	}
	return domain.CommunityMember{}, ports.ErrNotFound
}

func (s *EcosystemService) IssueInvitation(ctx context.Context, invitation domain.Invitation) (domain.Invitation, error) {
	invitation.Normalize()
	if invitation.ExpiresAt.IsZero() {
		invitation.ExpiresAt = s.now().UTC().Add(7 * 24 * time.Hour)
	}
	if !invitation.ExpiresAt.After(s.now().UTC()) {
		return domain.Invitation{}, ValidationError{Err: errors.New("invitation expiry must be in the future")}
	}
	if err := invitation.Validate(); err != nil {
		return domain.Invitation{}, ValidationError{Err: err}
	}
	token, err := randomID(24)
	if err != nil {
		return domain.Invitation{}, fmt.Errorf("generate invitation token: %w", err)
	}
	now := s.now().UTC()
	invitation.ID = "inv_" + token[:12]
	invitation.Token = token
	invitation.Status = domain.InvitationStatusPending
	invitation.AcceptedAt = nil
	invitation.CreatedAt = now
	invitation.UpdatedAt = now
	if err := s.invitations.SaveInvitation(ctx, invitation); err != nil {
		return domain.Invitation{}, err
	}
	if s.sender != nil && s.inviteBaseURL != "" {
		inviteURL := s.inviteBaseURL + "/invite/" + invitation.Token
		if err := s.sender.SendInvitationEmail(ctx, invitation, inviteURL); err != nil {
			return invitation, PostCommitError{Err: err}
		}
	}
	return invitation, nil
}

func (s *EcosystemService) GetInvitation(ctx context.Context, token string) (domain.Invitation, error) {
	invitation, err := s.invitations.GetInvitation(ctx, strings.TrimSpace(token))
	if errors.Is(err, ports.ErrNotFound) {
		return domain.Invitation{}, ErrInvitationNotFound
	}
	if err != nil {
		return domain.Invitation{}, err
	}
	return invitation, nil
}

func (s *EcosystemService) ListInvitations(ctx context.Context) ([]domain.Invitation, error) {
	return s.invitations.ListInvitations(ctx)
}

func (s *EcosystemService) AcceptInvitation(ctx context.Context, token string) (domain.Invitation, error) {
	invitation, err := s.GetInvitation(ctx, token)
	if err != nil {
		return domain.Invitation{}, err
	}
	if invitation.Status == domain.InvitationStatusAccepted {
		return domain.Invitation{}, ErrInvitationAlreadyAccepted
	}
	now := s.now().UTC()
	if !invitation.ExpiresAt.After(now) {
		return domain.Invitation{}, ErrInvitationExpired
	}
	invitation.Status = domain.InvitationStatusAccepted
	invitation.AcceptedAt = &now
	invitation.UpdatedAt = now
	if err := s.invitations.SaveInvitation(ctx, invitation); err != nil {
		return domain.Invitation{}, err
	}
	return invitation, nil
}

func (s *EcosystemService) CreateEvent(ctx context.Context, event domain.Event) (domain.Event, error) {
	event.Normalize()
	if err := event.Validate(); err != nil {
		return domain.Event{}, ValidationError{Err: err}
	}
	id, err := randomID(8)
	if err != nil {
		return domain.Event{}, fmt.Errorf("generate event id: %w", err)
	}
	now := s.now().UTC()
	event.ID = "evt_" + id
	event.CreatedAt = now
	event.UpdatedAt = now
	if err := s.events.SaveEvent(ctx, event); err != nil {
		return domain.Event{}, err
	}
	return event, nil
}

func (s *EcosystemService) ListEvents(ctx context.Context) ([]domain.Event, error) {
	return s.events.ListEvents(ctx)
}

func (s *EcosystemService) CreateIntake(ctx context.Context, intake domain.Intake) (domain.Intake, error) {
	intake.Normalize()
	if err := intake.Validate(); err != nil {
		return domain.Intake{}, ValidationError{Err: err}
	}
	id, err := randomID(8)
	if err != nil {
		return domain.Intake{}, fmt.Errorf("generate intake id: %w", err)
	}
	now := s.now().UTC()
	intake.ID = "inq_" + id
	intake.Status = domain.IntakeStatusNew
	intake.CreatedAt = now
	intake.UpdatedAt = now
	if err := s.intakes.SaveIntake(ctx, intake); err != nil {
		return domain.Intake{}, err
	}
	return intake, nil
}

func (s *EcosystemService) ListIntakes(ctx context.Context) ([]domain.Intake, error) {
	return s.intakes.ListIntakes(ctx)
}

func randomID(bytes int) (string, error) {
	buffer := make([]byte, bytes)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	return hex.EncodeToString(buffer), nil
}
