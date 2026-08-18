package config

import "testing"

func validProductionConfig() Config {
	return Config{
		AppEnv:          "production",
		Port:            "8080",
		BaseURL:         "https://api.almaleek.com",
		MongoDBURI:      "mongodb://database/almaleek",
		MongoDBDatabase: "almaleek_prod",
		CloudName:       "almaleek",
		CloudAPIKey:     "cloud-key",
		CloudAPISecret:  "cloud-secret",
		ResendAPIKey:    "resend-key",
		ResendFromEmail: "hello@almaleekgh.com",
		AdminAPIKey:     "a-long-random-admin-secret",
		AllowedOrigins:  []string{"https://almaleek.com", "https://admin.almaleek.com"},
		DataStore:       "mongodb",
	}
}

func TestEnvironmentDatabaseIsolation(t *testing.T) {
	config := validProductionConfig()
	config.MongoDBDatabase = "almaleek_dev"
	if err := config.Validate(); err == nil {
		t.Fatal("expected production dev database to be rejected")
	}
	config = validProductionConfig()
	config.AppEnv = "staging"
	if err := config.Validate(); err == nil {
		t.Fatal("expected staging production database to be rejected")
	}
	config.MongoDBDatabase = "almaleek_dev"
	if err := config.Validate(); err != nil {
		t.Fatalf("valid staging database rejected: %v", err)
	}
}

func TestMemoryStoreIsTestOnly(t *testing.T) {
	config := validProductionConfig()
	config.DataStore = "memory"
	if err := config.Validate(); err == nil {
		t.Fatal("expected production memory store to be rejected")
	}
	config.AppEnv = "test"
	config.CloudAPIKey = ""
	config.CloudAPISecret = ""
	config.ResendAPIKey = ""
	config.AllowedOrigins = []string{"http://localhost:3100"}
	config.AdminAPIKey = "test-admin-key"
	if err := config.Validate(); err != nil {
		t.Fatalf("test memory store rejected: %v", err)
	}
}

func TestProductionRequiresSecureAdminKeyAndOrigins(t *testing.T) {
	config := validProductionConfig()
	config.AdminAPIKey = "dev-admin-key"
	if err := config.Validate(); err == nil {
		t.Fatal("expected development admin key to be rejected")
	}
	config = validProductionConfig()
	config.AllowedOrigins = []string{"http://localhost:3100"}
	if err := config.Validate(); err == nil {
		t.Fatal("expected local production origin to be rejected")
	}
	config = validProductionConfig()
	if err := config.Validate(); err != nil {
		t.Fatalf("valid production config rejected: %v", err)
	}
}
