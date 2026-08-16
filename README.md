# AL Maleek Platform

This repository is the implementation workspace for the AL Maleek Creator Digital Ecosystem: a creator-first platform designed to convert attention into owned community, partnerships, commerce, events, education, and creator opportunities. The repo is organized as a monorepo with separate runtime boundaries for the public website, the admin dashboard, and the API service.

## Goal
Build a resilient, monetizable creator ecosystem that combines content, community, business inquiries, events, ticketing, education, and brand partnerships into one owned platform while keeping the public-facing experience and internal admin tools independently deployable.

## Approved delivery stack
- Backend: Golang
- Architecture: Hexagonal architecture
- Database: MongoDB
- Media storage: Cloudinary
- Email delivery: Resend
- Frontend deployment: Vercel
- Backend deployment: Render Blueprint

## Monorepo structure
- `apps/web/` — public-facing marketing and community experience deployed separately on Vercel
- `apps/admin/` — internal operations dashboard deployed separately on Vercel
- `services/api/` — Go API service with hexagonal architecture and external provider adapters
- `infra/` — deployment and infrastructure definitions, including Render Blueprint and operational config
- `docs/` — project source docs, design files, governance documents, and delivery artifacts
- `.github/workflows/` — CI and release automation for monorepo validation

## Deployment model
- Public website: separate Vercel app from `apps/web/`
- Admin dashboard: separate Vercel app from `apps/admin/`
- API: separate Render service from `services/api/`

This split gives each product surface its own release lifecycle, access model, and deployment environment while preserving a shared backend domain model.

## Root workspace commands
The root `package.json` exposes shared commands for the two frontend app roots plus the API service:

```bash
npm run dev:web
npm run build:web
npm run dev:admin
npm run build:admin
npm run dev:api
npm run test:api
npm run lint:web
npm run lint:admin
```

## API environment contract
The backend reads environment variables from the runtime environment. The canonical contract lives in `services/api/internal/config/config.go` and the example file in `services/api/.env.example`.

Required variables include:

- `APP_ENV`
- `PORT`
- `BASE_URL`
- `MONGODB_URI`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Local development
```bash
cd services/api
cp .env.example .env
export PATH=/Users/shayford/.local/go/bin:$PATH
go run ./cmd/server
```

Then open:
- http://localhost:8080/health
- POST http://localhost:8080/api/creators

## Frontend env vars
Each deployed frontend app may consume browser-safe variables with the `NEXT_PUBLIC_` prefix, such as:

- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`

These must be configured in Vercel per environment and must not include secrets.

## Operating documentation
The project documents are centralized in `docs/` and include architecture, governance, product, launch, UX, and automation guidance. The root `agent_plan.md` is the working execution plan used to coordinate multiple agents without collisions.

## Production checklist
Before shipping, ensure:
- Render has production values for `APP_ENV`, `PORT`, `BASE_URL`, and `MONGODB_URI`
- Cloudinary credentials are configured and tested
- Resend API key and sender address are set and validated
- Vercel public app env values are set for the correct public URLs
- `build` commands succeed for the apps and API
- `/health` responds successfully from the deployed backend
- Smoke testing confirms the app loads and API calls work in the target environment

## Current status
The monorepo has been structured into `apps/` and `services/`, with the public website and admin dashboard separated for independent deployment. The API foundation is in place with a hexagonal architecture, and the documentation set is centralized under `docs/`.
