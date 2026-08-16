# AL Maleek execution plan

## Current status
- Monorepo structure is in place with separate app boundaries for the public site, admin dashboard, backend service, infrastructure, and documentation.
- Public web app and admin dashboard are scaffolded, upgraded to the Next 16 toolchain, and both build successfully under Node 26.
- The admin workspace now includes dedicated operational sections for creators, community, events, shop, and partnerships to model real business workflows instead of placeholder KPI-only views.
- API foundation is in place under `services/api/` with a hexagonal architecture and provider adapters for MongoDB, Cloudinary, and Resend.
- Release automation and repo documentation are centralized in `docs/` and `.github/workflows/`.
- Runtime target is now aligned to Node 26.7.0 and Go 1.23.0 for local validation and CI compatibility.

## Runtime standard
- Required frontend runtime: Node 26 LTS
- Local toolchain path: `/Users/shayford/.local/node26/bin`
- Project file: `.nvmrc` pins the workspace to Node 26.
- Backend toolchain: Go 1.23.0 at `/Users/shayford/.local/go-1.23/bin`

## Workstream ownership
1. Public experience — owns the marketing site and community funnel in `apps/web/`
2. Admin operations — owns the internal dashboard in `apps/admin/`
3. API platform — owns backend business logic and external integrations in `services/api/`
4. Infrastructure — owns deployment, environment configuration, and uptime health in `infra/` and `.github/workflows/`
5. Governance and docs — owns the source documentation in `docs/` and the execution plan in `agent_plan.md`

## Active next steps
- Replace placeholder secrets in the new `.env` and `.env.production` files with real Render and Vercel environment values.
- Connect the admin dashboard to live operational workflows instead of placeholder KPI panels.
- Expand the backend domain model beyond creators to events, tickets, partnerships, commerce, and academy flows.
- Set production domains and deployment targets in Vercel and Render.
- Validate end-to-end smoke tests after staging and production environment wiring.

## Collision-avoidance rules
- Do not edit another workstream's primary source files without a documented handoff.
- Keep public and admin sources distinct and separately deployable.
- Keep infra secrets out of the repository and in environment-specific secret stores.
- Use the documentation set in `docs/` as the single source of truth for product and architecture direction.
