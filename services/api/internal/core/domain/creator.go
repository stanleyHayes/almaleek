package domain

import (
    "errors"
    "fmt"
    "net/mail"
    "strings"
    "time"
)

const (
    CreatorStatusActive  = "active"
    CreatorStatusPending = "pending"
    CreatorStatusInactive = "inactive"
    CreatorStatusArchived = "archived"
)

type Creator struct {
    ID        string    `json:"id" bson:"_id,omitempty"`
    Name      string    `json:"name" bson:"name"`
    Handle    string    `json:"handle" bson:"handle"`
    Email     string    `json:"email" bson:"email"`
    Bio       string    `json:"bio,omitempty" bson:"bio,omitempty"`
    Status    string    `json:"status" bson:"status"`
    PlatformID string   `json:"platform_id,omitempty" bson:"platform_id,omitempty"`
    CreatedAt time.Time `json:"created_at,omitempty" bson:"created_at,omitempty"`
    UpdatedAt time.Time `json:"updated_at,omitempty" bson:"updated_at,omitempty"`
}

func (c *Creator) Normalize() {
    if c == nil {
        return
    }

    c.Name = strings.TrimSpace(c.Name)
    c.Handle = strings.TrimSpace(strings.TrimPrefix(c.Handle, "@"))
    c.Email = strings.TrimSpace(strings.ToLower(c.Email))
    c.Bio = strings.TrimSpace(c.Bio)
    if c.Status == "" {
        c.Status = CreatorStatusActive
    }
    c.Status = strings.ToLower(strings.TrimSpace(c.Status))
}

func (c Creator) Validate() error {
    name := strings.TrimSpace(c.Name)
    handle := strings.TrimSpace(strings.TrimPrefix(c.Handle, "@"))
    email := strings.TrimSpace(c.Email)

    if name == "" {
        return errors.New("creator name is required")
    }
    if handle == "" {
        return errors.New("creator handle is required")
    }
    if len(handle) < 3 || len(handle) > 30 {
        return errors.New("creator handle must be between 3 and 30 characters")
    }
    if strings.ContainsAny(handle, " \t\n/\\@") {
        return errors.New("creator handle may only contain letters, numbers, underscores, and hyphens")
    }
    if email == "" {
        return errors.New("creator email is required")
    }
    if _, err := mail.ParseAddress(email); err != nil {
        return fmt.Errorf("creator email is invalid: %w", err)
    }

    status := strings.ToLower(strings.TrimSpace(c.Status))
    switch status {
    case "", CreatorStatusActive, CreatorStatusPending, CreatorStatusInactive, CreatorStatusArchived:
        return nil
    default:
        return fmt.Errorf("creator status %q is not supported", c.Status)
    }
}
