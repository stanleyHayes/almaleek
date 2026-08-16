# AL Maleek Go backend

This service is the initial application scaffold for the AL Maleek creator ecosystem.

## Architecture
- Domain layer for core creator and business entities
- Use case layer for application logic
- Repository and integration adapters for MongoDB, Cloudinary, and Resend
- HTTP layer for API access

## Environment variables
The service reads configuration from environment variables at runtime. Required values are defined in `backend/.env.example` and enforced by `backend/internal/config/config.go`:

```env
APP_ENV=development
DATA_STORE=mongodb
PORT=8080
BASE_URL=http://localhost:8080
MONGODB_URI=mongodb://localhost:27017/almaleek
CLOUDINARY_CLOUD_NAME=almaleek
CLOUDINARY_API_KEY=replace-me
CLOUDINARY_API_SECRET=replace-me
RESEND_API_KEY=replace-me
RESEND_FROM_EMAIL=hello@almaleek.com
ADMIN_API_KEY=replace-with-a-long-random-secret
ALLOWED_ORIGINS=http://localhost:3100,http://localhost:3101,http://localhost:3102
```

Production requirements:
- `APP_ENV` must be set to `production` and be one of `development`, `test`, `staging`, or `production`
- `BASE_URL` must match the deployed HTTPS endpoint
- `MONGODB_URI` must be a valid MongoDB connection string
- `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` are required in production
- `RESEND_API_KEY` is required in production

## Local development
```bash
export PATH=/Users/shayford/.local/go/bin:$PATH
cd backend
cp .env.example .env
go run ./cmd/server
```

## Deployment notes
- Render runs the service from the `backend/` root with `go build -o bin/server ./cmd/server`
- Health checks use `GET /health`
- Secret values must be managed through Render environment variables, not committed in repo files
- Separate credentials should exist for staging and production environments

## Endpoints
- `GET /health` — service check
- `GET /api/creators` — list creators
- `POST /api/creators` — create a creator
- `GET /api/invitations` — list invitations (admin bearer token required)
- `POST /api/invitations` — issue an invitation (admin bearer token required; defaults to a seven-day expiry)
- `GET /api/invitations/{token}` — resolve an invitation
- `POST /api/invitations/{token}/accept` — accept a pending invitation
- `GET /api/events` — list events (admin bearer token required)
- `POST /api/events` — create an event (admin bearer token required)
- `GET /api/intakes` — list community, Academy, shop, partnership, work, and ticket enquiries (admin bearer token required)
- `POST /api/intakes` — submit a public enquiry

Creator, invitation, event, and intake records use MongoDB in normal runtime. A concurrency-safe process-local repository is used only when a non-Mongo repository is explicitly injected in development or test; production refuses that fallback. Welcome email delivery is enabled only when a Resend API key is configured.

Deterministic E2E runs may explicitly set both `APP_ENV=test` and `DATA_STORE=memory`. This credential-free repository supports creators, invitations, events, and intakes for the lifetime of that one API process. `DATA_STORE=memory` is rejected in development, staging, and production so live data can never silently fall back to volatile storage. The default is always `mongodb`.

Operational endpoints require `Authorization: Bearer <ADMIN_API_KEY>`. Public clients may create intakes, resolve a token-specific invitation, and accept that invitation. Browser CORS access is limited to `ALLOWED_ORIGINS`; local development defaults to the three workspace origins.

All JSON write endpoints reject unknown fields, non-JSON content types, multiple JSON values, and bodies larger than 1 MiB. Validation failures use a JSON `{ "error": "..." }` response.

## Notes
External integrations are implemented in adapter packages behind the core ports, and credentials are supplied exclusively through environment variables. This keeps the service layer decoupled from provider-specific code while allowing Cloudinary uploads and Resend email delivery to be configured per environment.
