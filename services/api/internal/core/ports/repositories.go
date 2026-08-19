package ports

import (
	"context"
	"errors"

	"almaleek/internal/core/domain"
)

var ErrNotFound = errors.New("record not found")

type CreatorRepository interface {
	Save(ctx context.Context, creator domain.Creator) error
	List(ctx context.Context) ([]domain.Creator, error)
}

type PlatformRepository interface {
	Save(ctx context.Context, platform domain.Platform) error
	List(ctx context.Context) ([]domain.Platform, error)
}

type InvitationRepository interface {
	SaveInvitation(ctx context.Context, invitation domain.Invitation) error
	GetInvitation(ctx context.Context, token string) (domain.Invitation, error)
	ListInvitations(ctx context.Context) ([]domain.Invitation, error)
}

type EventRepository interface {
	SaveEvent(ctx context.Context, event domain.Event) error
	ListEvents(ctx context.Context) ([]domain.Event, error)
}

type IntakeRepository interface {
	SaveIntake(ctx context.Context, intake domain.Intake) error
	ListIntakes(ctx context.Context) ([]domain.Intake, error)
}

type CommunityMemberRepository interface {
	SaveCommunityMember(ctx context.Context, member domain.CommunityMember) error
	GetCommunityMemberByEmail(ctx context.Context, email string) (domain.CommunityMember, error)
	ListCommunityMembers(ctx context.Context) ([]domain.CommunityMember, error)
}

type MembershipPlanRepository interface {
	SaveMembershipPlan(ctx context.Context, plan domain.MembershipPlan) error
	ListMembershipPlans(ctx context.Context) ([]domain.MembershipPlan, error)
}
type SiteSettingsRepository interface {
	SaveSiteSettings(ctx context.Context, settings domain.SiteSettings) error
	GetSiteSettings(ctx context.Context) (domain.SiteSettings, error)
}

type EmailSender interface {
	SendWelcomeEmail(ctx context.Context, email, name string) error
	SendInvitationEmail(ctx context.Context, invitation domain.Invitation, inviteURL string) error
}

type MediaStorage interface {
	Upload(ctx context.Context, filename string, payload []byte) (string, error)
}
