package usecases

import (
    "context"
    "fmt"
    "strings"

    "almaleek/internal/core/domain"
    "almaleek/internal/core/ports"
)

type PlatformService struct {
    repo ports.PlatformRepository
}

func NewPlatformService(repo ports.PlatformRepository) *PlatformService {
    return &PlatformService{repo: repo}
}

func (s *PlatformService) RegisterPlatform(ctx context.Context, platform domain.Platform) (domain.Platform, error) {
    if s.repo == nil {
        return domain.Platform{}, fmt.Errorf("platform repository is not configured")
    }

    platform.Normalize()
    if err := platform.Validate(); err != nil {
        return domain.Platform{}, err
    }

    platform.ID = strings.TrimSpace(platform.ID)
    if platform.ID == "" {
        platform.ID = fmt.Sprintf("platform-%s", platform.Slug)
    }
    if platform.Status == "" {
        platform.Status = domain.PlatformStatusDraft
    }

    if err := s.repo.Save(ctx, platform); err != nil {
        return domain.Platform{}, err
    }

    return platform, nil
}

func (s *PlatformService) ListPlatforms(ctx context.Context) ([]domain.Platform, error) {
    if s.repo == nil {
        return nil, fmt.Errorf("platform repository is not configured")
    }
    return s.repo.List(ctx)
}
