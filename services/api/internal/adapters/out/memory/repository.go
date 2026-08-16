package memory

import (
	"context"
	"sort"
	"sync"

	"almaleek/internal/core/domain"
	"almaleek/internal/core/ports"
)

// Repository is a concurrency-safe process-local store. It is deterministic,
// requires no credentials, and is intended for small operational slices and tests.
type Repository struct {
	mu          sync.RWMutex
	invitations map[string]domain.Invitation
	events      map[string]domain.Event
	intakes     map[string]domain.Intake
	creators    map[string]domain.Creator
	members     map[string]domain.CommunityMember
	plans       map[string]domain.MembershipPlan
	settings    *domain.SiteSettings
}

func (r *Repository) SaveSiteSettings(_ context.Context, settings domain.SiteSettings) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.settings = &settings
	return nil
}
func (r *Repository) GetSiteSettings(_ context.Context) (domain.SiteSettings, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if r.settings == nil {
		return domain.SiteSettings{}, ports.ErrNotFound
	}
	return *r.settings, nil
}

func NewRepository() *Repository {
	return &Repository{
		invitations: make(map[string]domain.Invitation),
		events:      make(map[string]domain.Event),
		intakes:     make(map[string]domain.Intake),
		creators:    make(map[string]domain.Creator),
		members:     make(map[string]domain.CommunityMember),
		plans:       make(map[string]domain.MembershipPlan),
	}
}

func (r *Repository) SaveMembershipPlan(_ context.Context, plan domain.MembershipPlan) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.plans[plan.Code] = plan
	return nil
}

func (r *Repository) ListMembershipPlans(_ context.Context) ([]domain.MembershipPlan, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	items := make([]domain.MembershipPlan, 0, len(r.plans))
	for _, item := range r.plans {
		items = append(items, item)
	}
	sort.Slice(items, func(a, b int) bool { return items[a].SortOrder < items[b].SortOrder })
	return items, nil
}

func (r *Repository) SaveCommunityMember(_ context.Context, member domain.CommunityMember) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.members[member.Email] = member
	return nil
}

func (r *Repository) GetCommunityMemberByEmail(_ context.Context, email string) (domain.CommunityMember, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	member, ok := r.members[email]
	if !ok {
		return domain.CommunityMember{}, ports.ErrNotFound
	}
	return member, nil
}

func (r *Repository) ListCommunityMembers(_ context.Context) ([]domain.CommunityMember, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	items := make([]domain.CommunityMember, 0, len(r.members))
	for _, item := range r.members {
		items = append(items, item)
	}
	sort.Slice(items, func(a, b int) bool { return items[a].CreatedAt.Before(items[b].CreatedAt) })
	return items, nil
}

func (r *Repository) Save(_ context.Context, creator domain.Creator) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.creators[creator.ID] = creator
	return nil
}

func (r *Repository) List(_ context.Context) ([]domain.Creator, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	items := make([]domain.Creator, 0, len(r.creators))
	for _, item := range r.creators {
		items = append(items, item)
	}
	sort.Slice(items, func(a, b int) bool { return items[a].CreatedAt.Before(items[b].CreatedAt) })
	return items, nil
}

func (r *Repository) SaveInvitation(_ context.Context, invitation domain.Invitation) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.invitations[invitation.Token] = invitation
	return nil
}

func (r *Repository) GetInvitation(_ context.Context, token string) (domain.Invitation, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	invitation, ok := r.invitations[token]
	if !ok {
		return domain.Invitation{}, ports.ErrNotFound
	}
	return invitation, nil
}

func (r *Repository) ListInvitations(_ context.Context) ([]domain.Invitation, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	items := make([]domain.Invitation, 0, len(r.invitations))
	for _, item := range r.invitations {
		items = append(items, item)
	}
	sort.Slice(items, func(a, b int) bool { return items[a].CreatedAt.Before(items[b].CreatedAt) })
	return items, nil
}

func (r *Repository) SaveEvent(_ context.Context, event domain.Event) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.events[event.ID] = event
	return nil
}

func (r *Repository) ListEvents(_ context.Context) ([]domain.Event, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	items := make([]domain.Event, 0, len(r.events))
	for _, item := range r.events {
		items = append(items, item)
	}
	sort.Slice(items, func(a, b int) bool { return items[a].StartsAt.Before(items[b].StartsAt) })
	return items, nil
}

func (r *Repository) SaveIntake(_ context.Context, intake domain.Intake) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.intakes[intake.ID] = intake
	return nil
}

func (r *Repository) ListIntakes(_ context.Context) ([]domain.Intake, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	items := make([]domain.Intake, 0, len(r.intakes))
	for _, item := range r.intakes {
		items = append(items, item)
	}
	sort.Slice(items, func(a, b int) bool { return items[a].CreatedAt.Before(items[b].CreatedAt) })
	return items, nil
}
