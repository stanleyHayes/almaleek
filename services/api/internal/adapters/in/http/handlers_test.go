package httpadapter

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"almaleek/internal/adapters/out/memory"
	"almaleek/internal/core/domain"
	"almaleek/internal/core/usecases"
)

type creatorRepository struct {
	items []domain.Creator
}

type failingCreatorRepository struct{}

func (r *failingCreatorRepository) Save(context.Context, domain.Creator) error {
	return errors.New("database unavailable")
}
func (r *failingCreatorRepository) List(context.Context) ([]domain.Creator, error) {
	return nil, errors.New("database unavailable")
}

type failingEmailSender struct{}

func (s *failingEmailSender) SendWelcomeEmail(context.Context, string, string) error {
	return errors.New("email unavailable")
}

func (s *failingEmailSender) SendInvitationEmail(context.Context, domain.Invitation, string) error {
	return errors.New("email unavailable")
}

func (r *creatorRepository) Save(_ context.Context, creator domain.Creator) error {
	r.items = append(r.items, creator)
	return nil
}

func (r *creatorRepository) List(_ context.Context) ([]domain.Creator, error) {
	return append([]domain.Creator(nil), r.items...), nil
}

func newTestServer(t *testing.T) *httptest.Server {
	t.Helper()
	creatorService := usecases.NewCreatorService(&creatorRepository{}, nil)
	ecosystemService := usecases.NewEcosystemService(memory.NewRepository())
	server := httptest.NewServer(NewHandler(creatorService, ecosystemService, "test-admin-key", []string{"http://localhost:3100"}).Route())
	t.Cleanup(server.Close)
	return server
}

func request(t *testing.T, client *http.Client, method, url, body, contentType string) *http.Response {
	t.Helper()
	req, err := http.NewRequest(method, url, strings.NewReader(body))
	if err != nil {
		t.Fatal(err)
	}
	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}
	req.Header.Set("Origin", "http://localhost:3100")
	req.Header.Set("Authorization", "Bearer test-admin-key")
	resp, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	return resp
}

func decodeResponse[T any](t *testing.T, response *http.Response) T {
	t.Helper()
	defer response.Body.Close()
	var value T
	if err := json.NewDecoder(response.Body).Decode(&value); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	return value
}

func TestHealthCORSAndMethods(t *testing.T) {
	server := newTestServer(t)

	response := request(t, server.Client(), http.MethodGet, server.URL+"/health", "", "")
	if response.StatusCode != http.StatusOK {
		t.Fatalf("GET /health status = %d", response.StatusCode)
	}
	if response.Header.Get("Access-Control-Allow-Origin") != "http://localhost:3100" {
		t.Fatalf("missing CORS header")
	}
	health := decodeResponse[map[string]string](t, response)
	if health["status"] != "ok" || health["service"] != "almaleek" {
		t.Fatalf("unexpected health response: %#v", health)
	}

	response = request(t, server.Client(), http.MethodOptions, server.URL+"/api/events", "", "")
	if response.StatusCode != http.StatusNoContent {
		t.Fatalf("OPTIONS status = %d", response.StatusCode)
	}
	response.Body.Close()

	response = request(t, server.Client(), http.MethodDelete, server.URL+"/api/events", "", "")
	if response.StatusCode != http.StatusMethodNotAllowed || response.Header.Get("Allow") != "GET, POST" {
		t.Fatalf("DELETE status/allow = %d/%q", response.StatusCode, response.Header.Get("Allow"))
	}
	response.Body.Close()
}

func TestPublicSiteSettingsReadAndProtectedUpdate(t *testing.T) {
	server := newTestServer(t)

	publicRequest, err := http.NewRequest(http.MethodGet, server.URL+"/api/site/settings", nil)
	if err != nil {
		t.Fatal(err)
	}
	publicRequest.Header.Set("Origin", "http://localhost:3100")
	response, err := server.Client().Do(publicRequest)
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusOK {
		t.Fatalf("public settings status = %d", response.StatusCode)
	}
	settings := decodeResponse[domain.SiteSettings](t, response)
	if settings.FounderName == "" || len(settings.Brands) == 0 || len(settings.SocialProfiles) == 0 {
		t.Fatalf("default site settings are incomplete: %#v", settings)
	}
	if settings.Home.Hero.Headline == "" {
		t.Fatalf("default home hero headline is empty: %#v", settings.Home.Hero)
	}
	if len(settings.Home.Journey) != 7 {
		t.Fatalf("default home journey entries = %d, want 7", len(settings.Home.Journey))
	}
	if settings.Pages.Academy.Hero.Headline == "" {
		t.Fatalf("default academy hero headline is empty: %#v", settings.Pages.Academy.Hero)
	}
	if len(settings.Pages.Live.Events) != 3 {
		t.Fatalf("default live events = %d, want 3", len(settings.Pages.Live.Events))
	}
	if len(settings.Pages.Media.Stories) != 3 {
		t.Fatalf("default media stories = %d, want 3", len(settings.Pages.Media.Stories))
	}

	settings.AboutHeadline = "A CMS-managed headline"
	settings.Home.Hero.Headline = "A CMS-managed home headline"
	payload, err := json.Marshal(settings)
	if err != nil {
		t.Fatal(err)
	}
	response = request(t, server.Client(), http.MethodPut, server.URL+"/api/site/settings", string(payload), "application/json")
	if response.StatusCode != http.StatusOK {
		t.Fatalf("admin settings update status = %d", response.StatusCode)
	}
	updated := decodeResponse[domain.SiteSettings](t, response)
	if updated.AboutHeadline != "A CMS-managed headline" {
		t.Fatalf("updated headline = %q", updated.AboutHeadline)
	}
	if updated.Home.Hero.Headline != "A CMS-managed home headline" {
		t.Fatalf("updated home headline = %q", updated.Home.Hero.Headline)
	}

	unauthorizedRequest, err := http.NewRequest(http.MethodPut, server.URL+"/api/site/settings", bytes.NewReader(payload))
	if err != nil {
		t.Fatal(err)
	}
	unauthorizedRequest.Header.Set("Content-Type", "application/json")
	unauthorizedRequest.Header.Set("Origin", "http://localhost:3100")
	response, err = server.Client().Do(unauthorizedRequest)
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusUnauthorized {
		t.Fatalf("unauthorized settings update status = %d", response.StatusCode)
	}
	response.Body.Close()
}

func TestAdminAuthorizationAndOriginRestriction(t *testing.T) {
	server := newTestServer(t)
	req, err := http.NewRequest(http.MethodGet, server.URL+"/api/invitations", nil)
	if err != nil {
		t.Fatal(err)
	}
	response, err := server.Client().Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusUnauthorized || response.Header.Get("WWW-Authenticate") != "Bearer" {
		t.Fatalf("unauthorized status/challenge = %d/%q", response.StatusCode, response.Header.Get("WWW-Authenticate"))
	}
	response.Body.Close()

	req, _ = http.NewRequest(http.MethodPost, server.URL+"/api/intakes", strings.NewReader(`{"kind":"ticket","email":"fan@example.com"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Origin", "https://evil.example")
	response, err = server.Client().Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusForbidden || response.Header.Get("Access-Control-Allow-Origin") != "" {
		t.Fatalf("disallowed origin status/header = %d/%q", response.StatusCode, response.Header.Get("Access-Control-Allow-Origin"))
	}
	response.Body.Close()

	// Public intake creation remains available without an admin bearer token.
	req, _ = http.NewRequest(http.MethodPost, server.URL+"/api/intakes", strings.NewReader(`{"kind":"ticket","email":"fan@example.com"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Origin", "http://localhost:3100")
	response, err = server.Client().Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusCreated {
		t.Fatalf("public ticket intake status = %d", response.StatusCode)
	}
	response.Body.Close()
}

func TestInvitationLifecycle(t *testing.T) {
	server := newTestServer(t)
	payload := `{"name":" Adjoa Nartey ","email":"ADJOA@example.com","role":"Creative collaborator"}`
	// Unsupported roles are rejected before any record is persisted.
	response := request(t, server.Client(), http.MethodPost, server.URL+"/api/invitations", payload, "application/json")
	if response.StatusCode != http.StatusBadRequest {
		t.Fatalf("unsupported role status = %d", response.StatusCode)
	}
	response.Body.Close()

	payload = `{"name":" Adjoa Nartey ","email":"ADJOA@example.com","role":"collaborator"}`
	response = request(t, server.Client(), http.MethodPost, server.URL+"/api/invitations", payload, "application/json; charset=utf-8")
	if response.StatusCode != http.StatusCreated {
		t.Fatalf("issue invitation status = %d", response.StatusCode)
	}
	created := decodeResponse[domain.Invitation](t, response)
	if created.Token == "" || created.ID == "" || created.Email != "adjoa@example.com" || created.Status != domain.InvitationStatusPending {
		t.Fatalf("unexpected invitation: %#v", created)
	}

	response = request(t, server.Client(), http.MethodGet, server.URL+"/api/invitations/"+created.Token, "", "")
	if response.StatusCode != http.StatusOK {
		t.Fatalf("get invitation status = %d", response.StatusCode)
	}
	got := decodeResponse[domain.Invitation](t, response)
	if got.ID != created.ID {
		t.Fatalf("got invitation %q, want %q", got.ID, created.ID)
	}

	response = request(t, server.Client(), http.MethodPost, server.URL+"/api/invitations/"+created.Token+"/accept", "", "")
	if response.StatusCode != http.StatusOK {
		t.Fatalf("accept invitation status = %d", response.StatusCode)
	}
	accepted := decodeResponse[domain.Invitation](t, response)
	if accepted.Status != domain.InvitationStatusAccepted || accepted.AcceptedAt == nil {
		t.Fatalf("invitation was not accepted: %#v", accepted)
	}

	response = request(t, server.Client(), http.MethodPost, server.URL+"/api/invitations/"+created.Token+"/accept", "", "")
	if response.StatusCode != http.StatusConflict {
		t.Fatalf("second accept status = %d", response.StatusCode)
	}
	response.Body.Close()

	response = request(t, server.Client(), http.MethodGet, server.URL+"/api/invitations/missing", "", "")
	if response.StatusCode != http.StatusNotFound {
		t.Fatalf("missing invitation status = %d", response.StatusCode)
	}
	response.Body.Close()

	response = request(t, server.Client(), http.MethodGet, server.URL+"/api/invitations", "", "")
	items := decodeResponse[[]domain.Invitation](t, response)
	if len(items) != 1 {
		t.Fatalf("invitation count = %d", len(items))
	}
}

func TestPastInvitationExpiryIsRejected(t *testing.T) {
	server := newTestServer(t)
	payload := `{"name":"Adjoa Nartey","email":"adjoa@example.com","role":"collaborator","expires_at":"2020-01-01T00:00:00Z"}`
	response := request(t, server.Client(), http.MethodPost, server.URL+"/api/invitations", payload, "application/json")
	if response.StatusCode != http.StatusBadRequest {
		t.Fatalf("past expiry status = %d", response.StatusCode)
	}
	response.Body.Close()
}

func TestCreateAndListEvents(t *testing.T) {
	server := newTestServer(t)
	starts := time.Now().UTC().Add(48 * time.Hour).Format(time.RFC3339)
	payload := `{"name":"City Night Live","starts_at":"` + starts + `","venue":"National Theatre","capacity":500,"status":"on sale"}`
	response := request(t, server.Client(), http.MethodPost, server.URL+"/api/events", payload, "application/json")
	if response.StatusCode != http.StatusCreated {
		t.Fatalf("create event status = %d", response.StatusCode)
	}
	created := decodeResponse[domain.Event](t, response)
	if created.ID == "" || created.Status != domain.EventStatusOnSale {
		t.Fatalf("unexpected event: %#v", created)
	}

	response = request(t, server.Client(), http.MethodGet, server.URL+"/api/events", "", "")
	items := decodeResponse[[]domain.Event](t, response)
	if len(items) != 1 || items[0].ID != created.ID {
		t.Fatalf("unexpected event list: %#v", items)
	}

	response = request(t, server.Client(), http.MethodPost, server.URL+"/api/events", `{"name":"No venue"}`, "application/json")
	if response.StatusCode != http.StatusBadRequest {
		t.Fatalf("invalid event status = %d", response.StatusCode)
	}
	response.Body.Close()
}

func TestMembershipPlansArePublicAndAdminManaged(t *testing.T) {
	server := newTestServer(t)
	response := request(t, server.Client(), http.MethodGet, server.URL+"/api/membership/plans?active=true", "", "")
	plans := decodeResponse[[]domain.MembershipPlan](t, response)
	if len(plans) != 3 || plans[1].Code != domain.MembershipTierInsider {
		t.Fatalf("unexpected default plans: %#v", plans)
	}

	plans[1].PriceCents = 2500
	payload, err := json.Marshal(plans[1])
	if err != nil {
		t.Fatal(err)
	}
	response = request(t, server.Client(), http.MethodPut, server.URL+"/api/membership/plans", string(payload), "application/json")
	if response.StatusCode != http.StatusOK {
		t.Fatalf("update plan status = %d", response.StatusCode)
	}
	updated := decodeResponse[domain.MembershipPlan](t, response)
	if updated.PriceCents != 2500 {
		t.Fatalf("updated price = %d", updated.PriceCents)
	}

	req, _ := http.NewRequest(http.MethodPut, server.URL+"/api/membership/plans", bytes.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")
	response, err = server.Client().Do(req)
	if err != nil {
		t.Fatal(err)
	}
	if response.StatusCode != http.StatusUnauthorized {
		t.Fatalf("unauthorized update status = %d", response.StatusCode)
	}
	response.Body.Close()
}

func TestCreateAndListPublicIntakes(t *testing.T) {
	server := newTestServer(t)
	payload := `{"kind":"partnership","name":"Absa Ghana","email":"team@absa.test","organization":"Absa","message":"Campaign enquiry"}`
	response := request(t, server.Client(), http.MethodPost, server.URL+"/api/intakes", payload, "application/json")
	if response.StatusCode != http.StatusCreated {
		t.Fatalf("create intake status = %d", response.StatusCode)
	}
	created := decodeResponse[domain.Intake](t, response)
	if created.ID == "" || created.Status != domain.IntakeStatusNew {
		t.Fatalf("unexpected intake: %#v", created)
	}

	response = request(t, server.Client(), http.MethodGet, server.URL+"/api/intakes", "", "")
	items := decodeResponse[[]domain.Intake](t, response)
	if len(items) != 1 || items[0].ID != created.ID {
		t.Fatalf("unexpected intake list: %#v", items)
	}
}

func TestStrictJSONAndCreatorCompatibility(t *testing.T) {
	server := newTestServer(t)

	response := request(t, server.Client(), http.MethodPost, server.URL+"/api/intakes", `{}`, "text/plain")
	if response.StatusCode != http.StatusUnsupportedMediaType {
		t.Fatalf("content type status = %d", response.StatusCode)
	}
	response.Body.Close()

	response = request(t, server.Client(), http.MethodPost, server.URL+"/api/intakes", `{"kind":"community","name":"A","email":"a@example.com","unknown":true}`, "application/json")
	if response.StatusCode != http.StatusBadRequest {
		t.Fatalf("unknown field status = %d", response.StatusCode)
	}
	response.Body.Close()

	payload := []byte(`{"name":"AL Maleek","handle":"almaleek","email":"hello@almaleekgh.com"}`)
	response = request(t, server.Client(), http.MethodPost, server.URL+"/api/creators", string(payload), "application/json")
	if response.StatusCode != http.StatusCreated {
		var body bytes.Buffer
		_, _ = body.ReadFrom(response.Body)
		t.Fatalf("creator compatibility status = %d body=%s", response.StatusCode, body.String())
	}
	response.Body.Close()
	response = request(t, server.Client(), http.MethodGet, server.URL+"/api/creators", "", "")
	items := decodeResponse[[]domain.Creator](t, response)
	if len(items) != 1 || items[0].Email != "hello@almaleekgh.com" {
		t.Fatalf("unexpected creators: %#v", items)
	}
}

func TestCreatorInternalAndPostCommitErrorsAreClassified(t *testing.T) {
	ecosystem := usecases.NewEcosystemService(memory.NewRepository())
	server := httptest.NewServer(NewHandler(usecases.NewCreatorService(&failingCreatorRepository{}, nil), ecosystem, "test-admin-key", []string{"http://localhost:3100"}).Route())
	defer server.Close()
	payload := `{"name":"AL Maleek","handle":"almaleek","email":"hello@almaleekgh.com"}`
	response := request(t, server.Client(), http.MethodPost, server.URL+"/api/creators", payload, "application/json")
	if response.StatusCode != http.StatusInternalServerError {
		t.Fatalf("repository error status = %d", response.StatusCode)
	}
	response.Body.Close()

	repo := &creatorRepository{}
	server.Close()
	server = httptest.NewServer(NewHandler(usecases.NewCreatorService(repo, &failingEmailSender{}), ecosystem, "test-admin-key", []string{"http://localhost:3100"}).Route())
	defer server.Close()
	response = request(t, server.Client(), http.MethodPost, server.URL+"/api/creators", payload, "application/json")
	if response.StatusCode != http.StatusCreated || response.Header.Get("Warning") == "" || len(repo.items) != 1 {
		t.Fatalf("post-commit result = status %d warning %q persisted %d", response.StatusCode, response.Header.Get("Warning"), len(repo.items))
	}
	response.Body.Close()
}
