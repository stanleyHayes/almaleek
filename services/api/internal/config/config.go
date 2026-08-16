package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	AppEnv          string
	Port            string
	BaseURL         string
	MongoDBURI      string
	CloudName       string
	CloudAPIKey     string
	CloudAPISecret  string
	ResendAPIKey    string
	ResendFromEmail string
	AdminAPIKey     string
	AllowedOrigins  []string
	DataStore       string
}

func Load() Config {
	appEnv := strings.TrimSpace(getEnv("APP_ENV", "development"))
	localOrigins := ""
	if strings.EqualFold(appEnv, "development") || strings.EqualFold(appEnv, "test") {
		localOrigins = "http://localhost:3100,http://localhost:3101,http://localhost:3102"
	}
	cfg := Config{
		AppEnv:          appEnv,
		Port:            strings.TrimSpace(getEnv("PORT", "8080")),
		BaseURL:         strings.TrimSpace(getEnv("BASE_URL", "http://localhost:8080")),
		MongoDBURI:      strings.TrimSpace(getEnv("MONGODB_URI", "mongodb://localhost:27017/almaleek")),
		CloudName:       strings.TrimSpace(getEnv("CLOUDINARY_CLOUD_NAME", "almaleek")),
		CloudAPIKey:     strings.TrimSpace(getEnv("CLOUDINARY_API_KEY", "")),
		CloudAPISecret:  strings.TrimSpace(getEnv("CLOUDINARY_API_SECRET", "")),
		ResendAPIKey:    strings.TrimSpace(getEnv("RESEND_API_KEY", "")),
		ResendFromEmail: strings.TrimSpace(getEnv("RESEND_FROM_EMAIL", "hello@almaleek.com")),
		AdminAPIKey:     strings.TrimSpace(getEnv("ADMIN_API_KEY", "dev-admin-key")),
		AllowedOrigins:  splitCSV(getEnv("ALLOWED_ORIGINS", localOrigins)),
		DataStore:       strings.ToLower(strings.TrimSpace(getEnv("DATA_STORE", "mongodb"))),
	}

	if cfg.Port == "" {
		cfg.Port = "8080"
	}
	if err := cfg.Validate(); err != nil {
		log.Printf("config validation warning: %v", err)
	}
	if cfg.AppEnv == "production" {
		log.Println("production config loaded")
	}

	return cfg
}

func LoadValidated() (Config, error) {
	cfg := Load()
	if err := cfg.Validate(); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

func (c Config) Validate() error {
	if c.AppEnv == "" {
		return fmt.Errorf("APP_ENV is required")
	}
	switch strings.ToLower(c.AppEnv) {
	case "development", "test", "staging", "production":
	default:
		return fmt.Errorf("APP_ENV %q is not supported", c.AppEnv)
	}

	if c.Port == "" {
		return fmt.Errorf("PORT is required")
	}
	if _, err := strconv.Atoi(c.Port); err != nil {
		return fmt.Errorf("PORT must be a valid integer: %w", err)
	}

	if c.BaseURL == "" {
		return fmt.Errorf("BASE_URL is required")
	}
	if c.DataStore != "mongodb" && c.DataStore != "memory" {
		return fmt.Errorf("DATA_STORE must be mongodb or memory")
	}
	if c.DataStore == "memory" && !strings.EqualFold(c.AppEnv, "test") {
		return fmt.Errorf("DATA_STORE=memory is permitted only when APP_ENV=test")
	}
	if c.MongoDBURI == "" {
		return fmt.Errorf("MONGODB_URI is required")
	}
	if !strings.Contains(c.MongoDBURI, "mongodb://") && !strings.Contains(c.MongoDBURI, "mongodb+srv://") {
		return fmt.Errorf("MONGODB_URI must be a valid MongoDB connection string")
	}

	if strings.EqualFold(c.AppEnv, "staging") || strings.EqualFold(c.AppEnv, "production") {
		if c.AdminAPIKey == "" || c.AdminAPIKey == "dev-admin-key" {
			return fmt.Errorf("ADMIN_API_KEY must be configured securely outside local development")
		}
		if len(c.AllowedOrigins) == 0 {
			return fmt.Errorf("ALLOWED_ORIGINS is required outside local development")
		}
	}
	if strings.EqualFold(c.AppEnv, "production") {
		for _, origin := range c.AllowedOrigins {
			if strings.Contains(origin, "localhost") || strings.Contains(origin, "127.0.0.1") {
				return fmt.Errorf("ALLOWED_ORIGINS must not contain local development origins in production")
			}
		}
		if strings.TrimSpace(c.CloudName) == "" {
			return fmt.Errorf("CLOUDINARY_CLOUD_NAME is required in production")
		}
		if strings.TrimSpace(c.CloudAPIKey) == "" || strings.TrimSpace(c.CloudAPISecret) == "" {
			return fmt.Errorf("CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required in production")
		}
		if strings.TrimSpace(c.ResendAPIKey) == "" {
			return fmt.Errorf("RESEND_API_KEY is required in production")
		}
	}

	return nil
}

func splitCSV(value string) []string {
	var values []string
	for _, item := range strings.Split(value, ",") {
		if item = strings.TrimSpace(item); item != "" {
			values = append(values, strings.TrimSuffix(item, "/"))
		}
	}
	return values
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok && value != "" {
		return value
	}
	return fallback
}
