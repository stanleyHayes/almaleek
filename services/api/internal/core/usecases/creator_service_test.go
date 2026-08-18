package usecases

import (
	"context"
	"errors"
	"testing"

	"almaleek/internal/core/domain"
)

type stubRepo struct {
	creators []domain.Creator
}

func (r *stubRepo) Save(_ context.Context, creator domain.Creator) error {
	r.creators = append(r.creators, creator)
	return nil
}

func (r *stubRepo) List(_ context.Context) ([]domain.Creator, error) {
	return r.creators, nil
}

type stubSender struct{}

func (s *stubSender) SendWelcomeEmail(_ context.Context, _, _ string) error {
	return nil
}

type failingSender struct{}

func (s *failingSender) SendWelcomeEmail(_ context.Context, _, _ string) error {
	return errors.New("mail unavailable")
}

func TestRegisterCreator(t *testing.T) {
	repo := &stubRepo{}
	service := NewCreatorService(repo, &stubSender{})

	creator := domain.Creator{
		Name:   "AL Maleek",
		Handle: "almaleek",
		Email:  "hello@almaleekgh.com",
		Bio:    "Creator and community builder",
	}

	saved, err := service.RegisterCreator(context.Background(), creator)
	if err != nil {
		t.Fatalf("RegisterCreator returned error: %v", err)
	}

	if saved.ID == "" {
		t.Fatalf("expected an ID to be generated")
	}
	if saved.Status == "" {
		t.Fatalf("expected an active status")
	}
	if len(repo.creators) != 1 {
		t.Fatalf("expected one saved creator, got %d", len(repo.creators))
	}
}

func TestRegisterCreatorGeneratesCollisionResistantIDs(t *testing.T) {
	repo := &stubRepo{}
	service := NewCreatorService(repo, nil)
	first, err := service.RegisterCreator(context.Background(), domain.Creator{Name: "Same Size", Handle: "first-one", Email: "first@example.com"})
	if err != nil {
		t.Fatal(err)
	}
	second, err := service.RegisterCreator(context.Background(), domain.Creator{Name: "Same Size", Handle: "second-one", Email: "second@example.com"})
	if err != nil {
		t.Fatal(err)
	}
	if first.ID == second.ID {
		t.Fatalf("generated duplicate creator ID %q", first.ID)
	}
}

func TestRegisterCreatorReportsNotificationFailureAfterPersistence(t *testing.T) {
	repo := &stubRepo{}
	service := NewCreatorService(repo, &failingSender{})
	saved, err := service.RegisterCreator(context.Background(), domain.Creator{Name: "Saved Creator", Handle: "saved-creator", Email: "saved@example.com"})
	var postCommit PostCommitError
	if !errors.As(err, &postCommit) {
		t.Fatalf("error = %v, want PostCommitError", err)
	}
	if saved.ID == "" || len(repo.creators) != 1 {
		t.Fatalf("creator was not persisted before notification failure: %#v", saved)
	}
}
