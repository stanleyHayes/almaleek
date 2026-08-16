package usecases

import (
	"context"
	"errors"
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
