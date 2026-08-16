# AL Maleek multi-agent project plan

## Status
This project has reached a working implementation baseline and the remaining work is focused on production deployment, environment configuration, and launch-readiness validation.

## Goal
Build and complete the AL Maleek Creator Digital Ecosystem as an audience-first, creator-led platform that converts attention into owned community, partnerships, monetization, ticketing, events, and scalable creator opportunities using the approved stack:

- Backend: Golang
- Architecture: Hexagonal architecture
- Database: MongoDB
- Media storage: Cloudinary
- Email delivery: Resend
- Frontend deployment: Vercel
- Backend deployment: Render Blueprint

## Source-of-truth documents
- `docs/foundation-governance.md`
- `docs/product-discovery.md`
- `docs/architecture-system.md`
- `docs/experience-design.md`
- `docs/workflow-automation.md`
- `docs/launch-readiness.md`

## Completed work
- Monorepo structure created with separate public website and admin application boundaries.
- Public web app and admin dashboard scaffolded under `apps/`.
- Go backend bootstrapped under `services/api/` with hexagonal architecture and provider interfaces.
- MongoDB, Cloudinary, and Resend adapter layers created.
- CI workflow added and runtime toolchains pinned to Node 26 and Go 1.23.
- Documentation centralized in `docs/` and release workflow artifacts established.
- Frontend builds validated under Next.js 16 and Node 26.
- Go API tests pass under the corrected Go 1.23 runtime.
- Code-quality review completed on 2026-08-16: restored working ESLint checks for Next.js 16, aligned supported ESLint/TypeScript versions, added a root `npm run check` gate, and aligned CI with Go 1.23 plus `go vet`.
- Admin route structure consolidated around a shared accessible shell and route-aware navigation instead of duplicating the sidebar on every page.
- API HTTP handling hardened with request-context propagation, bounded strict JSON decoding, consistent JSON errors, and explicit response content types.
- Workspace hygiene improved by removing stray Go entrypoints and ignoring generated framework, dependency, environment, cache, and binary output.

## Remaining work
1. Connect real service credentials for MongoDB, Cloudinary, and Resend in deployment environments.
2. Wire public site and admin dashboard to production Vercel domains and API URLs.
3. Finalize production hosting config and Render service settings.
4. Replace placeholder admin KPI panels with live operational workflows.
5. Expand backend business logic for events, commerce, partnerships, and community operations.
6. Run end-to-end smoke tests and sign-off for launch readiness.

## Workstream ownership
- Public experience: `apps/web/`
- Admin operations: `apps/admin/`
- API platform: `services/api/`
- Infrastructure: `infra/`, `.github/workflows/`, and deployment configs
- Governance/docs: `docs/`, `agent_plan.md`, and project planning artifacts

## Collision-avoidance rules
- One workstream owns one primary source bundle.
- Public and admin app code remain separate and independently deployable.
- Secrets remain in environment secret stores, not checked into source.
- Shared decisions must be documented before another workstream overwrites or extends them.

## Final gate
The project is complete when deployment credentials, production domains, smoke tests, and final launch sign-off are complete and validated.

## Latest verification evidence
- `npm run check` — passed (web/admin lint, web/admin production builds, Go tests).
- `go vet ./...` — passed for the API service.
- Local smoke test — web `http://localhost:3100/`, admin `http://localhost:3101/`, and API health `http://localhost:8180/health` responded successfully.

## Product-wide redesign — completed 2026-08-16
- Rebuilt the public and admin design systems around Outfit, soft off-white canvas, dark ink, mint (`#6DD5C4` / `#DFF6F0`), periwinkle (`#B8C0FF` / `#E7D8FF`), eucalyptus (`#A7C4A0` / `#F4EFE6`), and peach (`#FFD3B6` / `#DFF7FF`) accents.
- Replaced both legacy navigation shells with floating responsive product bars, stronger focus states, and route-aware admin navigation.
- Redesigned all existing public pages and all existing admin modules through shared typography, surface, spacing, responsive, form, table, metric, and card primitives.
- Added a public `/media` experience and an admin `/content` studio using the relevant media, press, video, editorial queue, and guided operator patterns observed in the Joe Kuntani product.
- Added a branded public not-found experience, accessibility skip navigation, legal footer paths, and improved product metadata presentation.
- Rebuilt the admin overview as an operating brief with ecosystem metrics, audience visualization, weekly priorities, and live activity.
- Verification: `npm run check`, `go vet ./...`, route smoke tests, desktop visual QA, and 390px admin responsive QA passed. Browser console was clean except for a Chrome-extension hydration attribute on admin.

## Shell and management completion — completed 2026-08-16
- Simplified the public navigation from eight competing destinations to five primary journeys: Home, Live, Community, Media, and Work with us; Community remains the primary action.
- Rebuilt the public footer as an icon-led content directory with Experience, Build, and Find us groups, social destinations, community CTA, and working Privacy/Terms routes.
- Replaced the compact admin top navigation with a persistent grouped sidebar modeled on the proven Joe Kuntani administration pattern: Workspace, Audience, Publish, Business, and Account.
- Added complete admin UI surfaces for `/users` (users, roles, invites, access review), `/profile` (public brand identity and contacts), and `/settings` (community, notification, domain, and privacy configuration).
- Expanded `/community` into a membership operations workspace covering join requests, tier/access modes, member invitations, exports, community health, and engagement actions.
- Added responsive sidebar-drawer behavior, skip navigation, active-route state, user account context, and reusable management workspace styling.
- Verification: all public/admin builds, ESLint, Go tests, Go vet, desktop shell visual QA, console inspection, and route smoke tests passed. The Chrome viewport override was unreliable on the last mobile interaction attempt, so responsive behavior is evidenced by implementation/build rather than a claimed final mobile browser pass.

## Operations interaction and identity pass — completed 2026-08-16
- Replaced the flat event, shop, partnership, and creator lists with responsive, animated card workspaces that expose status, progress, inventory, revenue, contacts, and next actions clearly.
- Implemented working in-page creation drawers for events, creators, commerce drops, and partnership inquiries, including validation, immediate roster updates, and confirmation feedback.
- Added a persistent desktop sidebar collapse control while retaining the existing mobile drawer behavior; active admin links remain highlighted in both expanded and compact modes.
- Added route-derived active-link styling to the public navigation, including `aria-current` semantics and a visible mint indicator.
- Added page-entry, text-reveal, staggered-card, hover, drawer, and ambient layout motion to the public and admin apps with a complete reduced-motion fallback.
- Designed and integrated a new AL Maleek AM/doorway monogram into the public header/footer, admin rail, and dedicated web/admin favicon assets.
- Browser evidence: created `Culture Forward Live`, created creator `Adjoa Nartey`, confirmed success feedback and immediate card insertion, verified sidebar collapse persistence, and confirmed the public Media link exposes the active route state.

## Authenticated client portal foundation — completed 2026-08-16
- Added `apps/client` as the third product surface: AL Maleek Circle, an invitation-led portal for creators, collaborators, brand partners and advertisers, community members and fans, and Academy members.
- Implemented branded `/invite/[token]` and `/sign-in` experiences plus a responsive role-aware shell with a multi-role access switcher, active navigation, notifications, member identity and support entry point.
- Implemented representative workspaces for collaborations, campaigns and partnership ads, opportunities, earnings and payouts, partner billing, community, learning, messages and role-specific access cards.
- Added `docs/client-portal-blueprint.md` with role jobs, invitation lifecycle, backend modules, resource-scoped authorization, audit and payment security requirements, and the current seeded-data boundary.
- Added client lint/build/dev scripts to the monorepo quality gate and reused the AL Maleek brand mark and favicon.
- Research grounding: Shopify Collabs direct invitations/programs/performance/commission flows, Stripe Connect embedded onboarding/account/payout/dispute components, and Meta partnership-ad permission/reporting concepts.
- Verification: client ESLint and production build passed; browser QA confirmed the home workspace, Creator-to-Brand-partner role switch, role-shaped navigation, and invitation acceptance route.

## Admin account and operations completion audit — completed 2026-08-16
- Converted the profile, security, preferences, notifications, users, permissions, Academy members, and payments routes from static presentations into functional client workspaces with form validation, drawers, live state changes, confirmation feedback, exports, and action-specific outcomes.
- Profile: live preview updates with the display name, form submission confirms save, and public preview opens the web surface.
- Security: password confirmation and minimum length are enforced, password updates clear the form, MFA management and active-session review open as actionable dialogs, and session/MFA changes return confirmation feedback.
- Preferences and notifications: preferences save with confirmation; notifications support individual and bulk read state with a live unread count.
- Access governance: invitations append invited users and update counts; new roles append to the role collection and confirm policy creation.
- Academy and payments: learner enrolment appends a new member and invitation state, CSV export is implemented, payment links can be created, payment CSV export is implemented, and payout review gives operator feedback.
- Completed the Joe-inspired top-right cluster with working global destination search, notifications, account destinations, onboarding replay, click-away dismissal, and a functional sign-out route with a branded `/sign-in` screen.
- Replaced the font-based sidebar arrow with an optically centred CSS chevron; browser geometry measured `centerDeltaX: 1` and `centerDeltaY: 0` and the corrected control was visually inspected.
- Browser workflow evidence: profile save, preference save, mark-all-read, user invitation, role creation, Academy enrolment, payment-link creation, password update, MFA dialog, full five-step onboarding, click-away dismissal, sign-out, expanded desktop rail, and 390×844 mobile drawer were exercised successfully.
- Route evidence: all 16 operational routes returned HTTP 200 before the sign-in addition; the final production build generated 20 admin routes including `/sign-in`.
- Final gate: root `npm run check` passed web/admin/client lint and production builds plus Go tests; `go vet ./...` also passed. Browser console contained no app-originated errors; observed warnings and the hydration attribute were injected by installed Chrome extensions.

## Cross-app client completion and E2E hardening — completed 2026-08-16
- Completed the Circle client with API-verified invitation onboarding, verified identity and role grants, account/search/notification popovers, profile/security/preferences/notification workspaces, persisted role selection, collapsible navigation, route-specific content, real unknown-route 404s, and a contrast-safe sidebar logo treatment.
- Connected public conversion forms, admin event operations, community intake review, and Circle invitations through the shared API instead of cross-origin browser storage; admin requests use server-only proxy routes.
- Added signed expiring HttpOnly admin sessions. Privileged admin proxy routes reject unauthenticated callers before attaching the server-only API credential.
- Expanded the Go platform with validated invitation, event, intake, creator, CORS, authorization, durable MongoDB, and explicit test-only memory repository behavior. Production rejects memory persistence.
- Added a production-mode Playwright harness across public `:3100`, admin `:3101`, client `:3102`, and API `:18080`. Coverage proves admin session protection, event persistence after reload, public-intake visibility in admin, real invitation issuance and client acceptance, role restriction, client 404 behavior, sidebar/dropdown interactions, and API lifecycle/auth contracts.
- Final evidence: `npm run check` passed; `go vet ./...` passed; Playwright passed `16/16` tests with zero skips or expected failures in 34.5 seconds.
- Explicit deployment boundary: admin credentials remain configurable seeded credentials rather than a third-party identity provider, and secondary content/settings views retain clearly labeled browser-demo persistence where no production domain API exists.

## Community membership and Circle layout completion — completed 2026-08-16
- Added public community self-join with Free, Insiders, and Front Row tiers, API-backed member records, tier entitlements, client handoff, paid-content gating, and admin member visibility.
- Kept creator, collaborator, partner, and Academy access approval/invitation-led while making role grants additive so one person can participate in several approved capacities without self-granting privileged roles from the switcher.
- Repaired compact sidebar geometry: the content column expands without a gap, the collapse control remains unobscured, and its directional icon is a centered SVG with browser geometry assertions.
- Restored deliberate padding to active-work cards and isolated top-bar control sizing from the account popover so menu rows remain full-width, readable, and independently spaced.
- Final evidence: client ESLint passed; client production build passed; Playwright passed `17/17` tests, including community self-join, paid entitlements, admin visibility, additive role switching, account-menu row geometry, collapse-icon centering, layout adaptation, and persistence.
- Explicit payment boundary: tier selection and entitlement behavior are complete, while production charging still requires the selected payment provider and webhook settlement integration.

## API-backed membership plan management — completed 2026-08-16
- Moved Circle, Insiders, and Front Row package names, descriptions, prices, CTAs, benefits, order, and published state into durable API-managed membership plan records.
- Added protected admin `/plans` management with live cards and an edit/publish workspace; admin writes travel through the signed-session server proxy and protected API route.
- Public community cards, the custom membership chooser, and Circle membership benefits now read the same published plan source instead of maintaining independent hardcoded package arrays.
- Added default-plan bootstrap for empty repositories, MongoDB and test-memory persistence adapters, public active-plan reads, protected updates, and handler coverage for defaults, updates, and unauthorized writes.
- Verification: web/admin/client lint and production builds passed; Go tests and Go vet passed; a signed admin proxy update round-trip was reflected by the public plan endpoint.

## CMS-backed About, brands and social presence — completed 2026-08-16
- Added a dedicated public `/about` experience presenting AL Maleek's founder story, mission, Ghanaian roots, current venture portfolio, partnership invitation, and social presence in a deliberate editorial layout.
- Replaced footer social initials with accessible platform-specific Instagram, TikTok, YouTube, X, Facebook, and LinkedIn SVG icons.
- Expanded admin `/settings` into a public-site CMS for founder narrative, headline, introduction, mission, current brands, social profile handles/URLs/audience context, footer description, contact email, and location.
- Added public-read/protected-write `/api/site/settings` contracts, signed-session admin proxying, default content bootstrap, and MongoDB plus test-memory persistence.
- Verification: public/admin ESLint and production builds passed; API tests and Go vet passed; browser QA confirmed the CMS-backed About page, active navigation, venture cards, six social destinations, and dynamic footer content.

## Pre-launch hosting and branded system states — completed 2026-08-16
- Moved both the `dev` staging service and `main` production service to Render's Free plan for the pre-launch period; production remains manually deployed and staging continues to auto-deploy from `dev`. Corrected both service roots to `services/api` and declared the MongoDB, admin-key, and CORS variables required by startup validation.
- Replaced framework-native loading and missing-page states across the public site, admin workspace, and Circle client with role-specific AL Maleek splash and 404 experiences.
- Added accessible recovery navigation, responsive typography, branded monogram treatments, contextual copy, restrained motion, and reduced-motion fallbacks.
- Preserved real HTTP 404 semantics in Circle by placing its splash inside authenticated session hydration instead of a streaming root loading boundary.
- Verification: Render YAML parsed with both services on `plan: free`; all three ESLint and production builds passed; public and Circle unknown routes returned HTTP 404 with branded recovery content.

## Shared async and empty-state system — completed 2026-08-16
- Added reusable, brand-matched `EmptyState`, `PageSkeleton`, and `LoadingDots` primitives to the public, admin, and Circle applications.
- Empty results now use a responsive gradient-border composition with an animated custom icon, clear title and supporting copy, optional action content, compact variants, and reduced-motion behavior.
- Replaced page and data hydration blanks with layout-shaped skeletons across route loading, CMS content, plan management, invitations, Circle startup, and community data surfaces.
- Replaced button loading labels with accessible animated dots across conversion, sign-in, onboarding, invitations, event creation, settings, plan updates, and membership changes while preserving stable button geometry.
- Applied real empty states to search results, community queues, plan collections, and Circle/admin result surfaces instead of showing ambiguous blank space.
- Verification: all three ESLint suites passed; Playwright rebuilt every application in production mode and passed `17/17` browser tests across public, admin, Circle, and API flows.

## Production admin access and environment-safe seed data — completed 2026-08-16
- Removed the prefilled administrator email and all demo-access language from sign-in; added email/password placeholders, leading field icons, password visibility, accessible errors, and secure-session messaging.
- Renamed the server-only login configuration to `ADMIN_EMAIL` and `ADMIN_PASSWORD`, retaining signed HttpOnly sessions without presenting the deployment as a demo.
- Added explicit Mongo database selection with `MONGODB_DATABASE`; staging is locked to `almaleek_dev` and production is locked to `almaleek_prod` during startup validation.
- Added an idempotent development seeder with a hard refusal guard for every target other than `almaleek_dev`; seeded representative creators, events, tiered members, intakes, invitations, plans, and CMS settings.
- Verification: Go tests and vet passed; all application lint and production builds passed; Playwright passed `17/17` cross-app tests; the live development seed completed against `almaleek_dev`.
