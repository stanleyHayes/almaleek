package usecases

import (
	"context"
	"strings"

	"almaleek/internal/core/domain"
	"almaleek/internal/core/ports"
)

type CreatorService struct {
	repo   ports.CreatorRepository
	sender ports.EmailSender
}

type PostCommitError struct{ Err error }

func (e PostCommitError) Error() string { return e.Err.Error() }
func (e PostCommitError) Unwrap() error { return e.Err }

func NewCreatorService(repo ports.CreatorRepository, sender ports.EmailSender) *CreatorService {
	return &CreatorService{repo: repo, sender: sender}
}

func (s *CreatorService) RegisterCreator(ctx context.Context, creator domain.Creator) (domain.Creator, error) {
	creator.Normalize()
	if err := creator.Validate(); err != nil {
		return domain.Creator{}, ValidationError{Err: err}
	}

	creator.ID = strings.TrimSpace(creator.ID)
	if creator.ID == "" {
		id, err := randomID(12)
		if err != nil {
			return domain.Creator{}, err
		}
		creator.ID = "creator_" + id
	}
	if creator.Status == "" {
		creator.Status = domain.CreatorStatusActive
	}

	if err := s.repo.Save(ctx, creator); err != nil {
		return domain.Creator{}, err
	}

	if s.sender != nil {
		if err := s.sender.SendWelcomeEmail(ctx, creator.Email, creator.Name); err != nil {
			return creator, PostCommitError{Err: err}
		}
	}

	return creator, nil
}

func (s *CreatorService) ListCreators(ctx context.Context) ([]domain.Creator, error) {
	return s.repo.List(ctx)
}
