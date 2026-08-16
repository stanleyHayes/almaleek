package domain

import (
    "errors"
    "fmt"
    "regexp"
    "strings"
    "time"
)

const (
    PlatformStatusActive   = "active"
    PlatformStatusDraft    = "draft"
    PlatformStatusArchived = "archived"
)

type Platform struct {
    ID          string    `json:"id" bson:"_id,omitempty"`
    Name        string    `json:"name" bson:"name"`
    Slug        string    `json:"slug" bson:"slug"`
    Description string    `json:"description,omitempty" bson:"description,omitempty"`
    Status      string    `json:"status" bson:"status"`
    OwnerID     string    `json:"owner_id,omitempty" bson:"owner_id,omitempty"`
    CreatedAt   time.Time `json:"created_at,omitempty" bson:"created_at,omitempty"`
    UpdatedAt   time.Time `json:"updated_at,omitempty" bson:"updated_at,omitempty"`
}

var slugPattern = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

func (p *Platform) Normalize() {
    if p == nil {
        return
    }

    p.Name = strings.TrimSpace(p.Name)
    p.Slug = strings.TrimSpace(strings.ToLower(strings.ReplaceAll(p.Slug, " ", "-")))
    p.Description = strings.TrimSpace(p.Description)
    if p.Status == "" {
        p.Status = PlatformStatusDraft
    }
    p.Status = strings.ToLower(strings.TrimSpace(p.Status))
}

func (p Platform) Validate() error {
    if strings.TrimSpace(p.Name) == "" {
        return errors.New("platform name is required")
    }
    if strings.TrimSpace(p.Slug) == "" {
        return errors.New("platform slug is required")
    }
    if !slugPattern.MatchString(strings.TrimSpace(p.Slug)) {
        return fmt.Errorf("platform slug %q is invalid: use lowercase letters, numbers, and hyphen separators", p.Slug)
    }

    status := strings.ToLower(strings.TrimSpace(p.Status))
    switch status {
    case "", PlatformStatusDraft, PlatformStatusActive, PlatformStatusArchived:
        return nil
    default:
        return fmt.Errorf("platform status %q is not supported", p.Status)
    }
}
