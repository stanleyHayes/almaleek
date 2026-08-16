package cloudinary

import (
    "bytes"
    "context"
    "crypto/sha1"
    "encoding/hex"
    "encoding/json"
    "fmt"
    "io"
    "mime/multipart"
    "net/http"
    "net/url"
    "strconv"
    "strings"
    "time"
)

type Service struct {
    CloudName string
    APIKey    string
    APISecret string
    client    *http.Client
}

func NewService(cloudName string, credentials ...string) *Service {
    svc := &Service{
        CloudName: strings.TrimSpace(cloudName),
        client: &http.Client{Timeout: 15 * time.Second},
    }

    switch len(credentials) {
    case 2:
        svc.APIKey = strings.TrimSpace(credentials[0])
        svc.APISecret = strings.TrimSpace(credentials[1])
    case 1:
        svc.APIKey = strings.TrimSpace(credentials[0])
    }

    return svc
}

func (s *Service) Upload(ctx context.Context, filename string, payload []byte) (string, error) {
    if ctx == nil {
        ctx = context.Background()
    }

    if s == nil || s.CloudName == "" {
        return "", fmt.Errorf("cloudinary is not configured")
    }
    if s.APIKey == "" || s.APISecret == "" {
        return "", fmt.Errorf("cloudinary API key and secret are not configured")
    }
    if len(payload) == 0 {
        return "", fmt.Errorf("upload payload is empty")
    }

    publicID := strings.TrimSpace(filename)
    if publicID == "" {
        publicID = "upload"
    }

    timestamp := strconv.FormatInt(time.Now().Unix(), 10)
    signingString := fmt.Sprintf("public_id=%s&timestamp=%s%s", url.QueryEscape(publicID), timestamp, s.APISecret)
    signature := sha1Sum(signingString)

    var body bytes.Buffer
    writer := multipart.NewWriter(&body)

    filePart, err := writer.CreateFormFile("file", publicID)
    if err != nil {
        return "", fmt.Errorf("create upload part: %w", err)
    }
    if _, err = filePart.Write(payload); err != nil {
        return "", fmt.Errorf("write upload payload: %w", err)
    }

    if err = writer.WriteField("api_key", s.APIKey); err != nil {
        return "", fmt.Errorf("write api key: %w", err)
    }
    if err = writer.WriteField("timestamp", timestamp); err != nil {
        return "", fmt.Errorf("write timestamp: %w", err)
    }
    if err = writer.WriteField("public_id", publicID); err != nil {
        return "", fmt.Errorf("write public id: %w", err)
    }
    if err = writer.WriteField("signature", signature); err != nil {
        return "", fmt.Errorf("write signature: %w", err)
    }
    if err = writer.Close(); err != nil {
        return "", fmt.Errorf("close multipart body: %w", err)
    }

    req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/upload", s.CloudName), &body)
    if err != nil {
        return "", fmt.Errorf("build cloudinary upload request: %w", err)
    }
    req.Header.Set("Content-Type", writer.FormDataContentType())

    resp, err := s.client.Do(req)
    if err != nil {
        return "", fmt.Errorf("cloudinary upload request failed: %w", err)
    }
    defer resp.Body.Close()

    responseBytes, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
    if err != nil {
        return "", fmt.Errorf("read cloudinary response: %w", err)
    }

    if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
        return "", fmt.Errorf("cloudinary upload failed: %s", strings.TrimSpace(string(responseBytes)))
    }

    var result struct {
        SecureURL string `json:"secure_url"`
        URL       string `json:"url"`
        Error     struct {
            Message string `json:"message"`
        } `json:"error"`
    }
    if err := json.Unmarshal(responseBytes, &result); err != nil {
        return "", fmt.Errorf("parse cloudinary response: %w", err)
    }
    if result.Error.Message != "" {
        return "", fmt.Errorf("cloudinary upload error: %s", result.Error.Message)
    }
    if result.SecureURL != "" {
        return result.SecureURL, nil
    }
    if result.URL != "" {
        return result.URL, nil
    }
    return "", fmt.Errorf("cloudinary upload response missing URL")
}

func sha1Sum(value string) string {
    sum := sha1.Sum([]byte(value))
    return hex.EncodeToString(sum[:])
}
