package httpadapter

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"io"
	"mime"
	"net/http"
	"strings"

	"almaleek/internal/core/domain"
	"almaleek/internal/core/ports"
	"almaleek/internal/core/usecases"
)

const maxRequestBody = 1 << 20

type Handler struct {
	creators       *usecases.CreatorService
	ecosystem      *usecases.EcosystemService
	adminKey       string
	allowedOrigins map[string]struct{}
}

func NewHandler(creators *usecases.CreatorService, ecosystem *usecases.EcosystemService, adminKey string, allowedOrigins []string) *Handler {
	origins := make(map[string]struct{}, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		origins[strings.TrimSuffix(strings.TrimSpace(origin), "/")] = struct{}{}
	}
	return &Handler{creators: creators, ecosystem: ecosystem, adminKey: strings.TrimSpace(adminKey), allowedOrigins: origins}
}

func (h *Handler) Route() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", h.HealthHandler)
	mux.Handle("/api/creators", h.adminOnly(http.HandlerFunc(h.CreatorsHandler)))
	mux.Handle("/api/invitations", h.adminOnly(http.HandlerFunc(h.InvitationsHandler)))
	mux.HandleFunc("/api/invitations/{token}", h.InvitationHandler)
	mux.HandleFunc("/api/invitations/{token}/accept", h.AcceptInvitationHandler)
	mux.Handle("/api/events", h.adminOnly(http.HandlerFunc(h.EventsHandler)))
	mux.HandleFunc("/api/intakes", h.IntakesHandler)
	mux.HandleFunc("/api/community/members", h.CommunityMembersHandler)
	mux.HandleFunc("/api/membership/plans", h.MembershipPlansHandler)
	mux.HandleFunc("/api/site/settings", h.SiteSettingsHandler)
	return h.withCORS(mux)
}

func (h *Handler) SiteSettingsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		settings, err := h.ecosystem.GetSiteSettings(r.Context())
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "unable to load site settings")
			return
		}
		writeJSON(w, http.StatusOK, settings)
	case http.MethodPut:
		if !h.isAdmin(r) {
			w.Header().Set("WWW-Authenticate", "Bearer")
			writeJSONError(w, http.StatusUnauthorized, "admin authorization required")
			return
		}
		var settings domain.SiteSettings
		if !decodeJSON(w, r, &settings) {
			return
		}
		saved, err := h.ecosystem.SaveSiteSettings(r.Context(), settings)
		if err != nil {
			writeServiceError(w, err, "unable to save site settings")
			return
		}
		writeJSON(w, http.StatusOK, saved)
	default:
		methodNotAllowed(w, http.MethodGet, http.MethodPut)
	}
}

func (h *Handler) MembershipPlansHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		plans, err := h.ecosystem.ListMembershipPlans(r.Context())
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "unable to list membership plans")
			return
		}
		activeOnly := strings.EqualFold(r.URL.Query().Get("active"), "true")
		if activeOnly {
			active := make([]domain.MembershipPlan, 0, len(plans))
			for _, plan := range plans {
				if plan.Active {
					active = append(active, plan)
				}
			}
			plans = active
		}
		writeJSON(w, http.StatusOK, plans)
	case http.MethodPut:
		if !h.isAdmin(r) {
			w.Header().Set("WWW-Authenticate", "Bearer")
			writeJSONError(w, http.StatusUnauthorized, "admin authorization required")
			return
		}
		var plan domain.MembershipPlan
		if !decodeJSON(w, r, &plan) {
			return
		}
		saved, err := h.ecosystem.SaveMembershipPlan(r.Context(), plan)
		if err != nil {
			writeServiceError(w, err, "unable to save membership plan")
			return
		}
		writeJSON(w, http.StatusOK, saved)
	default:
		methodNotAllowed(w, http.MethodGet, http.MethodPut)
	}
}

func (h *Handler) CommunityMembersHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		if id := strings.TrimSpace(r.URL.Query().Get("id")); id != "" {
			member, err := h.ecosystem.GetCommunityMember(r.Context(), id)
			if errors.Is(err, ports.ErrNotFound) {
				writeJSONError(w, http.StatusNotFound, "community member not found")
				return
			}
			if err != nil {
				writeJSONError(w, http.StatusInternalServerError, "unable to get community member")
				return
			}
			writeJSON(w, http.StatusOK, member)
			return
		}
		if !h.isAdmin(r) {
			w.Header().Set("WWW-Authenticate", "Bearer")
			writeJSONError(w, http.StatusUnauthorized, "admin authorization required")
			return
		}
		items, err := h.ecosystem.ListCommunityMembers(r.Context())
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "unable to list community members")
			return
		}
		if items == nil {
			items = []domain.CommunityMember{}
		}
		writeJSON(w, http.StatusOK, items)
	case http.MethodPost:
		var member domain.CommunityMember
		if !decodeJSON(w, r, &member) {
			return
		}
		created, err := h.ecosystem.JoinCommunity(r.Context(), member)
		if err != nil {
			writeServiceError(w, err, "unable to join community")
			return
		}
		writeJSON(w, http.StatusCreated, created)
	default:
		methodNotAllowed(w, http.MethodGet, http.MethodPost)
	}
}

func (h *Handler) withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := strings.TrimSuffix(strings.TrimSpace(r.Header.Get("Origin")), "/")
		if origin != "" {
			if _, allowed := h.allowedOrigins[origin]; !allowed {
				writeJSONError(w, http.StatusForbidden, "origin is not allowed")
				return
			}
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Max-Age", "86400")
		w.Header().Add("Vary", "Origin")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) adminOnly(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodOptions && !h.isAdmin(r) {
			w.Header().Set("WWW-Authenticate", "Bearer")
			writeJSONError(w, http.StatusUnauthorized, "admin authorization required")
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) isAdmin(r *http.Request) bool {
	provided := strings.TrimSpace(strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer "))
	if h.adminKey == "" || provided == "" || len(provided) != len(h.adminKey) {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(provided), []byte(h.adminKey)) == 1
}

func (h *Handler) HealthHandler(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "almaleek"})
}

func (h *Handler) CreatorsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		creators, err := h.creators.ListCreators(r.Context())
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "unable to list creators")
			return
		}
		if creators == nil {
			creators = []domain.Creator{}
		}
		writeJSON(w, http.StatusOK, creators)
	case http.MethodPost:
		var creator domain.Creator
		if !decodeJSON(w, r, &creator) {
			return
		}
		saved, err := h.creators.RegisterCreator(r.Context(), creator)
		if err != nil {
			var postCommit usecases.PostCommitError
			if errors.As(err, &postCommit) {
				w.Header().Set("Warning", `199 almaleek "creator saved; welcome notification pending"`)
				writeJSON(w, http.StatusCreated, saved)
				return
			}
			writeServiceError(w, err, "unable to create creator")
			return
		}
		writeJSON(w, http.StatusCreated, saved)
	default:
		methodNotAllowed(w, http.MethodGet, http.MethodPost)
	}
}

func (h *Handler) InvitationsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		items, err := h.ecosystem.ListInvitations(r.Context())
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "unable to list invitations")
			return
		}
		writeJSON(w, http.StatusOK, items)
	case http.MethodPost:
		var invitation domain.Invitation
		if !decodeJSON(w, r, &invitation) {
			return
		}
		created, err := h.ecosystem.IssueInvitation(r.Context(), invitation)
		if err != nil {
			var postCommit usecases.PostCommitError
			if errors.As(err, &postCommit) {
				w.Header().Set("Warning", `199 almaleek "invitation saved; invitation email pending"`)
				writeJSON(w, http.StatusCreated, created)
				return
			}
			writeServiceError(w, err, "unable to issue invitation")
			return
		}
		writeJSON(w, http.StatusCreated, created)
	default:
		methodNotAllowed(w, http.MethodGet, http.MethodPost)
	}
}

func (h *Handler) InvitationHandler(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}
	invitation, err := h.ecosystem.GetInvitation(r.Context(), r.PathValue("token"))
	if errors.Is(err, usecases.ErrInvitationNotFound) {
		writeJSONError(w, http.StatusNotFound, err.Error())
		return
	}
	if err != nil {
		writeJSONError(w, http.StatusInternalServerError, "unable to get invitation")
		return
	}
	writeJSON(w, http.StatusOK, invitation)
}

func (h *Handler) AcceptInvitationHandler(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}
	invitation, err := h.ecosystem.AcceptInvitation(r.Context(), r.PathValue("token"))
	switch {
	case errors.Is(err, usecases.ErrInvitationNotFound):
		writeJSONError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, usecases.ErrInvitationExpired), errors.Is(err, usecases.ErrInvitationAlreadyAccepted):
		writeJSONError(w, http.StatusConflict, err.Error())
	case err != nil:
		writeJSONError(w, http.StatusInternalServerError, "unable to accept invitation")
	default:
		writeJSON(w, http.StatusOK, invitation)
	}
}

func (h *Handler) EventsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		items, err := h.ecosystem.ListEvents(r.Context())
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "unable to list events")
			return
		}
		writeJSON(w, http.StatusOK, items)
	case http.MethodPost:
		var event domain.Event
		if !decodeJSON(w, r, &event) {
			return
		}
		created, err := h.ecosystem.CreateEvent(r.Context(), event)
		if err != nil {
			writeServiceError(w, err, "unable to create event")
			return
		}
		writeJSON(w, http.StatusCreated, created)
	default:
		methodNotAllowed(w, http.MethodGet, http.MethodPost)
	}
}

func (h *Handler) IntakesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		if !h.isAdmin(r) {
			w.Header().Set("WWW-Authenticate", "Bearer")
			writeJSONError(w, http.StatusUnauthorized, "admin authorization required")
			return
		}
		items, err := h.ecosystem.ListIntakes(r.Context())
		if err != nil {
			writeJSONError(w, http.StatusInternalServerError, "unable to list intakes")
			return
		}
		writeJSON(w, http.StatusOK, items)
	case http.MethodPost:
		var intake domain.Intake
		if !decodeJSON(w, r, &intake) {
			return
		}
		created, err := h.ecosystem.CreateIntake(r.Context(), intake)
		if err != nil {
			writeServiceError(w, err, "unable to create intake")
			return
		}
		writeJSON(w, http.StatusCreated, created)
	default:
		methodNotAllowed(w, http.MethodGet, http.MethodPost)
	}
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) bool {
	mediaType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || mediaType != "application/json" {
		writeJSONError(w, http.StatusUnsupportedMediaType, "Content-Type must be application/json")
		return false
	}
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, maxRequestBody))
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		writeJSONError(w, http.StatusBadRequest, "invalid request body")
		return false
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		writeJSONError(w, http.StatusBadRequest, "request body must contain a single JSON object")
		return false
	}
	return true
}

func requireMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method == method {
		return true
	}
	methodNotAllowed(w, method)
	return false
}

func methodNotAllowed(w http.ResponseWriter, methods ...string) {
	w.Header().Set("Allow", strings.Join(methods, ", "))
	writeJSONError(w, http.StatusMethodNotAllowed, "method not allowed")
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func writeJSONError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"error": message})
}

func writeServiceError(w http.ResponseWriter, err error, fallback string) {
	var validation usecases.ValidationError
	if errors.As(err, &validation) {
		writeJSONError(w, http.StatusBadRequest, validation.Error())
		return
	}
	writeJSONError(w, http.StatusInternalServerError, fallback)
}
