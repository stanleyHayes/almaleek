package app

import (
	"fmt"
	"net/http"
	"strings"

	httpadapter "almaleek/internal/adapters/in/http"
	"almaleek/internal/adapters/out/memory"
	"almaleek/internal/adapters/out/mongodb"
	"almaleek/internal/adapters/out/resend"
	"almaleek/internal/config"
	"almaleek/internal/core/ports"
	"almaleek/internal/core/usecases"
)

type App struct {
	handler http.Handler
}

func New(cfg config.Config, repo ports.CreatorRepository, sender ports.EmailSender) *App {
	if repo == nil {
		if cfg.DataStore == "memory" {
			if !strings.EqualFold(cfg.AppEnv, "test") {
				panic("memory data store is permitted only in test environment")
			}
			repo = memory.NewRepository()
		} else {
			repo = mongodb.NewRepository(cfg.MongoDBURI, cfg.MongoDBDatabase)
		}
	}
	if sender == nil && cfg.ResendAPIKey != "" {
		sender = resend.NewService(cfg.ResendAPIKey, cfg.ResendFromEmail)
	}

	ecosystemRepo, ok := repo.(interface {
		ports.InvitationRepository
		ports.EventRepository
		ports.IntakeRepository
		ports.CommunityMemberRepository
		ports.MembershipPlanRepository
		ports.SiteSettingsRepository
	})
	if !ok {
		if strings.EqualFold(cfg.AppEnv, "production") || cfg.DataStore == "mongodb" {
			panic(fmt.Sprintf("configured repository %T does not provide durable ecosystem persistence", repo))
		}
		ecosystemRepo = memory.NewRepository()
	}
	creatorService := usecases.NewCreatorService(repo, sender)
	ecosystemService := usecases.NewEcosystemService(ecosystemRepo).WithInvitationSender(sender, cfg.ClientBaseURL)
	handler := httpadapter.NewHandler(creatorService, ecosystemService, cfg.AdminAPIKey, cfg.AllowedOrigins).Route()

	return &App{handler: handler}
}

func (a *App) Handler() http.Handler {
	return a.handler
}
