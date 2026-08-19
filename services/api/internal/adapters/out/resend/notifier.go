package resend

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"net/http"
	"strings"
	"time"

	"almaleek/internal/core/domain"
)

type Service struct {
	APIKey string
	From   string
	client *http.Client
}

func NewService(apiKey, fromEmail string) *Service {
	return &Service{
		APIKey: strings.TrimSpace(apiKey),
		From:   strings.TrimSpace(fromEmail),
		client: &http.Client{Timeout: 15 * time.Second},
	}
}

func (s *Service) SendWelcomeEmail(ctx context.Context, email, name string) error {
	if email == "" || name == "" {
		return fmt.Errorf("email and name are required")
	}

	return s.send(ctx, map[string]any{
		"to":      []string{email},
		"subject": "Welcome to AL Maleek",
		"html": fmt.Sprintf(
			"<p>Hi %s,</p><p>Welcome to AL Maleek. We’re delighted to have you on board.</p>",
			html.EscapeString(name),
		),
	})
}

func (s *Service) SendInvitationEmail(ctx context.Context, invitation domain.Invitation, inviteURL string) error {
	if invitation.Email == "" || invitation.Name == "" {
		return fmt.Errorf("invitation email and name are required")
	}
	if inviteURL == "" {
		return fmt.Errorf("invitation URL is required")
	}

	role := strings.ReplaceAll(invitation.Role, "_", " ")
	return s.send(ctx, map[string]any{
		"to":      []string{invitation.Email},
		"subject": "You're invited to the AL Maleek ecosystem",
		"html": fmt.Sprintf(
			"<p>Hi %s,</p>"+
				"<p>You have been invited to join the AL Maleek ecosystem as <strong>%s</strong>.</p>"+
				`<p><a href="%s">Accept your invitation</a> — this link expires on %s.</p>`+
				"<p>If you were not expecting this invitation, you can safely ignore this email.</p>",
			html.EscapeString(invitation.Name),
			html.EscapeString(role),
			html.EscapeString(inviteURL),
			invitation.ExpiresAt.Format("2 January 2006"),
		),
	})
}

func (s *Service) send(ctx context.Context, payload map[string]any) error {
	if ctx == nil {
		ctx = context.Background()
	}

	if s == nil || s.APIKey == "" {
		return fmt.Errorf("resend API key is not configured")
	}
	if s.From == "" {
		s.From = "hello@almaleekgh.com"
	}
	payload["from"] = s.From

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal resend email payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("build resend email request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+s.APIKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("send resend email request: %w", err)
	}
	defer resp.Body.Close()

	responseBody, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if err != nil {
		return fmt.Errorf("read resend response: %w", err)
	}

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("resend request failed: %s", strings.TrimSpace(string(responseBody)))
	}

	return nil
}
