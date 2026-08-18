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
    if ctx == nil {
        ctx = context.Background()
    }

    if s == nil || s.APIKey == "" {
        return fmt.Errorf("resend API key is not configured")
    }
    if email == "" || name == "" {
        return fmt.Errorf("email and name are required")
    }
    if s.From == "" {
        s.From = "hello@almaleekgh.com"
    }

    payload := map[string]any{
        "from":    s.From,
        "to":      []string{email},
        "subject": "Welcome to AL Maleek",
        "html": fmt.Sprintf(
            "<p>Hi %s,</p><p>Welcome to AL Maleek. We’re delighted to have you on board.</p>",
            html.EscapeString(name),
        ),
    }

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
