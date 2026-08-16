# AL Maleek Technical Architecture Brief

## 1) System context and high-level components

This architecture supports the AL Maleek digital ecosystem described in the governance brief: a brand-owned platform that captures attention from social media and turns it into deeper relationship, commerce, participation, and business opportunity flows. The system must support content, community, events, partnerships, commerce, education, and service-enquiry operations without forcing these domains into a single tightly coupled application layer.

The approved implementation stack is:
- Frontend hosting: Vercel
- Backend runtime: Golang
- Database: MongoDB
- Media storage: Cloudinary
- Email/notification transport: Resend
- Deployment model: Render Blueprint
- Architecture pattern: Hexagonal Architecture

### High-level runtime model

1. Client-facing experience runs on Vercel as a web application, with user-facing marketing pages, member/community experiences, booking flows, ticketing pages, commerce views, and secure authenticated experiences.
2. The Golang backend is the application core. It exposes HTTP APIs for the web app and internal services, orchestrates domain logic, and enforces business rules.
3. MongoDB is the system of record for users, content, events, tickets, orders, community activity, partnership records, and operational data.
4. Cloudinary handles media ingestion, transformation, optimization, and delivery for images/videos and marketing assets.
5. Resend handles transactional email and notification delivery such as welcome emails, booking confirmations, ticket updates, and operational alerts.
6. Render Blueprint provides the deployment topology for backend services, scheduled jobs, and supporting infrastructure to keep the platform resilient and environment-aware.

### Core system context

- Primary users: fans, community members, event attendees, brands, collaborators, creators, educators, and internal operators.
- Primary business flows: discover AL Maleek, sign up, participate, book tickets, purchase merchandise, submit collaboration or business enquiries, manage community interactions, and receive lifecycle notifications.
- Supporting platform functions: identity, notification delivery, media processing, asset versioning, order/event management, and business operations dashboards.

## 2) Domain modules and use cases

The business domain should be modeled as a set of bounded modules aligned to the AL Maleek ecosystem, each with its own use cases and persistence boundaries.

### 2.1 Community and fan engagement

Purpose: deepen audience relationships beyond social media discovery.

Use cases:
- member registration and profile management
- community participation and voting
- challenge submission and approval
- fan recognition and contributions
- audience feedback and comments
- membership or access tiers

Key actors:
- fan/community member
- moderator
- platform admin

### 2.2 Content and creative asset management

Purpose: manage the brand’s storytelling and content library.

Use cases:
- publish content and media bundles
- organize campaigns and feature drops
- manage editorial timelines and event-related content
- support creator-specific publishing workflows
- attach media assets and metadata to content records

Key actors:
- content manager
- creator
- marketing operator

### 2.3 Events and live experiences

Purpose: support comedy shows, premieres, meetups, campus events, and workshops.

Use cases:
- create event listings and schedules
- manage ticket inventory and pricing
- accept reservations and purchases
- send event reminders and updates
- handle attendance and check-in workflows
- support organizer- and partner-facing event operations

Key actors:
- event organizer
- attendee
- ticketing operator
- staff admin

### 2.4 Commerce and orders

Purpose: monetize brand value through merchandise, digital products, and creator offerings.

Use cases:
- product catalog management
- cart and checkout flows
- order payment integration
- fulfillment tracking and status updates
- limited-edition and drop campaigns
- refunds, cancellations, or order adjustments

Key actors:
- customer
- operations team
- store admin

### 2.5 Business opportunities and partnerships

Purpose: provide a controlled intake flow for commercial relationships.

Use cases:
- submit partnership or sponsorship enquiry
- track booking opportunities
- classify enquiry type (event, campaign, appearance, product placement, media, collaboration)
- assign ownership and follow-up workflows
- manage response timelines and status updates

Key actors:
- brand partner
- business contact
- sales/ops lead

### 2.6 Academy and creator development

Purpose: capture educational offerings and creator-facing learning products.

Use cases:
- publish learning modules and courses
- manage cohorts or sessions
- track learner progress and enrollment
- deliver creator resources, toolkits, and mentorship opportunities

Key actors:
- learner
- educator
- program manager

### 2.7 Collaboration network

Purpose: operate a trusted network of creators, collaborators, service providers, and partners.

Use cases:
- create creator profiles and capability records
- support application or invitation workflows
- manage match and collaboration opportunities
- track partnership history and outcomes

Key actors:
- collaborator
- project lead
- operations team

## 3) Hexagonal architecture boundaries

Hexagonal architecture is the foundation for isolating business behavior from infrastructure and external systems. The domain model remains stable even as the supporting platforms evolve.

### 3.1 Core domain (inside the hexagon)

The inside of the hexagon contains the business logic and domain rules. It should include:
- domain entities and value objects
- business services and orchestration logic
- domain policies and validation
- use-case services for events, commerce, community, partnerships, ticketing, and user lifecycle
- aggregate roots for multi-entity workflows

The core is intentionally free of HTTP, MongoDB, Cloudinary, and email transport implementation details.

### 3.2 Primary adapters

Primary adapters invoke the domain from the outside:
- web/API handlers or controllers for the Vercel-backed frontend experience
- authenticated operator endpoints for admin and moderation flows
- session/authentication adapters that authorize users and map them to domain identities
- internal job triggers for scheduled or event-driven processing

Responsibilities:
- convert HTTP requests into domain commands
- validate request contracts and user context
- transform responses back to API payloads or UI-friendly DTOs

### 3.3 Secondary adapters

Secondary adapters implement infrastructure and external interactions:
- MongoDB repository adapters for persistence
- Cloudinary client adapter for upload, transformation, deletion, and signed URL generation
- Resend adapter for transactional email and notification dispatch
- notification and audit logging adapters
- secret and configuration adapters reading environment variables and deployment secrets
- optional payment or analytics adapters if introduced later

Responsibilities:
- isolate external implementation details
- fail gracefully through ports and use-case boundaries
- enable service substitution and testing without domain coupling

### 3.4 Ports and interfaces

The core should define ports such as:
- UserRepositoryPort
- ContentRepositoryPort
- EventRepositoryPort
- TicketingRepositoryPort
- OrderRepositoryPort
- MediaAssetPort
- NotificationPort
- EmailPort
- AuditLogPort
- IdentityProviderPort

Each adapter implements the port, and the domain service depends on the interface, not the concrete vendor implementation.

## 4) MongoDB data model and persistence boundaries

MongoDB is the operational data layer for user accounts, business workflows, content, events, and commerce records. The persistence model should be schema-conscious but flexible enough to support the fast-evolving AL Maleek ecosystem.

### 4.1 Recommended collections

The data model should be organized around business aggregates rather than UI screens.

- users
  - profile, auth metadata, role, status, preferences, contact info
- profiles / creators / collaborators
  - public-facing creator metadata, categories, portfolio links, availability
- content_items
  - title, body, type, status, tags, media references, publish state, created_by
- campaigns
  - marketing lifts, launches, partnership activities, and campaign metrics
- events
  - title, venue, schedule, ticket policy, organizer, categories, status
- tickets
  - event relationship, inventory, pricing, seat or access type, purchase status
- orders
  - customer, line items, totals, fulfillment state, payment references, status history
- enquiries
  - opportunity type, requester, organization, notes, stage, assigned owner, follow up date
- media_assets
  - public ID, asset type, storage source, versions, alt text, tags, owner, metadata
- notifications
  - recipient, template, channel, payload, status, attempts, created_at
- audit_events
  - actor, action, entity type, entity ID, before/after summary, timestamp

### 4.2 Persistence boundary model

Persistence boundaries should align to aggregates:
- User aggregate: auth + profile + preferences + role state
- Event aggregate: event + ticket plan + attendance + schedules
- Commerce aggregate: product + order + fulfillment + customer
- Community aggregate: participation + submissions + votes + recognition
- Business aggregate: enquiry + relationship + follow-up + assigned workflows
- Content aggregate: editable content + media mappings + publishing state

A repository adapter should own the mapping from domain entities to MongoDB documents and should hide database-level concerns from the application core.

### 4.3 Data quality and consistency rules

- use immutable audit fields (`created_at`, `updated_at`, `created_by`, `updated_by`)
- enforce domain invariants in the core, not in the MongoDB client layer
- separate operational records from public-facing content metadata
- normalize cross-collection references using stable IDs rather than embedded full documents for large or frequently changing entities
- keep read-optimized denormalization only where it materially supports high-traffic user journeys
- use background jobs to reconcile derived metrics or enrichment tasks instead of coupling them to synchronous requests

### 4.4 Persistence anti-patterns to avoid

- embedding large media arrays into core user or content documents
- mixing marketing and operational status into the same collection without a clear relationship
- letting the HTTP layer directly manipulate MongoDB documents
- storing email or notification payloads in the business core; keep them in a separate operational collection

## 5) Cloudinary media handling and upload workflows

Cloudinary is the approved storage and transformation service for media. It supports scalable asset delivery, social-content distribution, and optimized rendering across the product experience.

### 5.1 Media responsibilities

Cloudinary should handle:
- image and video upload ingestion
- optimized transformations for responsive delivery
- thumbnail generation and poster frames
- media metadata extraction and storage
- secure delivery URLs
- asset versioning and replacement flows

### 5.2 Upload workflow

Recommended workflow:
1. Client or backend requests a signed upload from the application core.
2. Application core generates a signed Cloudinary upload payload using environment-scoped credentials.
3. Media is uploaded directly to Cloudinary, avoiding unnecessary backend bandwidth loading.
4. The backend records the media asset metadata in MongoDB as a `media_assets` document.
5. The content, event, or campaign record references that asset by ID or public resource identifier.
6. The frontend uses transformed URLs for optimized thumbnail, hero, and preview rendering.

### 5.3 Domain integration pattern

- media operations live behind a `MediaAssetPort`
- the Cloudinary adapter implements upload, delete, transformation, and URL generation
- domain services treat media as a first-class asset record, not a raw file blob in the database
- attribute metadata (owner, content context, type, alt text, permissions) remains in MongoDB, while Cloudinary holds the actual source and transformed variants

### 5.4 Risk controls

- restrict upload types and size limits by domain
- verify file ownership and asset relationships before publish
- render transformed URLs from allowed folders and resource naming rules
- avoid leaking secret Cloudinary credentials in browser code
- maintain a cleanup routine for orphaned or unpublished assets

## 6) Resend email and notification flows

Resend is the approved outbound communication platform. It should be used for transactional and operational messaging, not as a general event bus.

### 6.1 Core notification domains

Use Resend for:
- welcome and account verification emails
- ticket confirmations and event reminders
- order confirmation and fulfillment updates
- partnership or booking enquiry acknowledgements
- moderation/security event notifications
- reset links, access updates, and operational alerts

### 6.2 Flow pattern

1. A domain use case emits a notification command through the application core.
2. The core validates the recipient, template context, and sender configuration.
3. The notification service translates the command to a Resend payload.
4. Resend sends the message asynchronously and returns a delivery state or provider response.
5. The backend persists a notification record in MongoDB and updates delivery status as events arrive or are retried.

### 6.3 Notification architecture guardrails

- outbound communication should be triggered by domain events, not ad hoc from the web layer
- email templates should be versioned and managed centrally
- prefer idempotent notification dispatch for retries
- never send secrets or tokens in plain text outside secure channels
- log failures and rate-limit problems in audit records

### 6.4 Template categories

- transactional: account setup, tickets, orders, reminders
- operational: internal workflow updates and triage alerts
- marketing: campaigns and launch announcements when approved and opt-in supported

## 7) Deployment topology across Vercel and Render Blueprint

The platform should treat Vercel and Render as separate operational layers with clear ownership boundaries.

### 7.1 Vercel layer

Vercel hosts the frontend application and edge-facing experience. The frontend should be designed as a stateless presentation layer, using API calls to the backend and client-side handling only for view state and local UX.

Responsibilities:
- marketing pages
- community experiences
- event and ticketing front ends
- commerce presentation and purchase flows
- partner enquiry and contact pages
- static or server-rendered pages optimized for performance and SEO

Notes:
- Vercel can also host previews for branch deployments and production environment separation.
- The frontend should never directly hold sensitive backend credentials.

### 7.2 Render Blueprint layer

Render Blueprint hosts the backend application services and supporting infrastructure. This is the operational home of the Go API, background jobs, and service connectivity.

Recommended topology:
- web service: Go API for main application endpoints
- background worker/service: scheduled tasks, notifications, media reconciliation, and operational processing
- MongoDB managed service: data persistence for application state
- optional staging environment with separate secrets and variables
- health checks and auto-redeploy rules for service continuity

### 7.3 Environment segmentation

At minimum:
- local development
- feature branch / preview
- staging / validation
- production

Environment separation should include:
- separate app domains
- unique MongoDB instances or logical databases where possible
- different Cloudinary and Resend credentials
- coded environment checks before production actions

### 7.4 API boundary and request flow

- frontend requests flow to the backend over HTTPS
- the backend owns all domain logic and persistence decisions
- the backend becomes the single authorization and validation gate for operations
- Vercel is UI-first; Render is service-first

## 8) Security, environment, and CI/CD gates

Security must be built into the architecture from the first delivery stage. The governance brief emphasizes secret handling, traceability, approvals, and a disciplined SDLC.

### 8.1 Security controls

- store all secrets in environment variables
- use least-privilege credentials for MongoDB, Cloudinary, Resend, and deployment services
- enforce HTTPS and secure cookies/session handling for authenticated flows
- validate user input at the API layer and in the domain layer
- implement role-based access control for admin, staff, organizer, and customer actions
- protect media endpoints and signed-upload flows from abuse
- maintain audit records for significant changes and operational events

### 8.2 Environment configuration

Required environment configuration should include:
- app environment identifiers
- backend service URLs
- MongoDB connection string and database name
- Cloudinary API key and secret
- Resend API key and sender configuration
- Vercel production/staging URL mapping
- feature flags for rollout control

### 8.3 CI/CD gates

The SDLC should enforce a progressive release structure:
- local validation and unit tests for domain logic
- integration tests for MongoDB, media, and email adapters
- linting and build validation for the Go backend and frontend assets
- pull request review and merge approval
- deployment to staging with smoke tests
- UAT approval before production release
- production deployment with post-deploy monitoring

Recommended release gates:
- no merge without successful CI
- no staging deployment without QA pass
- no production release without sign-off and rollback plan
- no secret material in repo history or config files

## 9) Integration strategy and platform risks

### 9.1 Integration strategy

The architecture should favor clear boundaries and stable contracts:
- Vercel frontend calls backend APIs through versioned endpoints
- backend services communicate with MongoDB via repository adapters
- Cloudinary and Resend are treated as external capabilities behind one implementation boundary each
- domain events trigger downstream communication and operational tasks without creating circular dependencies

This keeps the system modular enough to evolve without rewriting the entire platform when one vendor or workflow changes.

### 9.2 Platform risks

1. Vendor coupling risk
   - Cloudinary, Resend, and MongoDB provide specialized capabilities that are important to the application but should not leak into the domain core.

2. Data consistency risk
   - Event, ticket, and order flows can become inconsistent if inventory and fulfillment state are not protected by business invariants and transactional patterns.

3. Media lifecycle risk
   - orphaned media records or mismatched references can cause broken content or unintended asset exposure if clean-up and ownership checks are weak.

4. Notification reliability risk
   - email delivery can fail due to provider throttling, invalid addresses, or template issues; operations must include retry and status tracking.

5. Deployment environment drift
   - preview, staging, and production configuration drift can lead to service outages or broken integrations if environment variables are not strictly managed.

6. Operational complexity risk
   - the ecosystem spans media, commerce, events, CRM-like business enquiries, and community participation; without domain boundaries and service ownership, the system becomes difficult to scale safely.

### 9.3 Recommended mitigation strategy

- keep domain logic pure and testable
- isolate external platform logic behind ports
- use explicit domain events for cross-module communication
- keep environment configuration centralized and auditable
- document API contracts and operational runbooks
- maintain a rollback plan for each production release

## 10) Architecture summary

The AL Maleek system should be built as a modular digital ecosystem centered on a Go-based hexagonal application core, with Vercel handling the user experience and Render Blueprint hosting the operational backend and supporting services. MongoDB provides the business data foundation, Cloudinary handles the media lifecycle, and Resend powers critical transactional communication. This structure matches the approved stack, preserves the governance rules, and creates a scalable, testable platform that can evolve from MVP capabilities into a broader creator and brand ecosystem without entangling the business layer with infrastructure concerns.
