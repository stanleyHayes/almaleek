package app

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"almaleek/internal/config"
)

func memoryTestConfig() config.Config {
	return config.Config{
		AppEnv:         "test",
		Port:           "18080",
		BaseURL:        "http://127.0.0.1:18080",
		MongoDBURI:     "mongodb://unused/almaleek",
		AdminAPIKey:    "test-admin-key",
		AllowedOrigins: []string{"http://localhost:3100"},
		DataStore:      "memory",
	}
}

func TestMemoryStoreSupportsFullTestAPIWithoutMongo(t *testing.T) {
	application := New(memoryTestConfig(), nil, nil)
	server := httptest.NewServer(application.Handler())
	defer server.Close()

	intake, err := http.Post(server.URL+"/api/intakes", "application/json", strings.NewReader(`{"kind":"ticket","email":"fan@example.com"}`))
	if err != nil {
		t.Fatal(err)
	}
	if intake.StatusCode != http.StatusCreated {
		t.Fatalf("public intake status = %d", intake.StatusCode)
	}
	intake.Body.Close()

	creatorRequest, _ := http.NewRequest(http.MethodPost, server.URL+"/api/creators", strings.NewReader(`{"name":"Test Creator","handle":"test-creator","email":"creator@example.com"}`))
	creatorRequest.Header.Set("Content-Type", "application/json")
	creatorRequest.Header.Set("Authorization", "Bearer test-admin-key")
	creator, err := server.Client().Do(creatorRequest)
	if err != nil {
		t.Fatal(err)
	}
	if creator.StatusCode != http.StatusCreated {
		t.Fatalf("creator status = %d", creator.StatusCode)
	}
	creator.Body.Close()

	listRequest, _ := http.NewRequest(http.MethodGet, server.URL+"/api/intakes", nil)
	listRequest.Header.Set("Authorization", "Bearer test-admin-key")
	list, err := server.Client().Do(listRequest)
	if err != nil {
		t.Fatal(err)
	}
	if list.StatusCode != http.StatusOK {
		t.Fatalf("intake list status = %d", list.StatusCode)
	}
	list.Body.Close()
}

func TestAppRejectsMemoryOutsideTestEvenWithoutValidatedConfig(t *testing.T) {
	config := memoryTestConfig()
	config.AppEnv = "production"
	defer func() {
		if recover() == nil {
			t.Fatal("expected production memory store to panic")
		}
	}()
	_ = New(config, nil, nil)
}
