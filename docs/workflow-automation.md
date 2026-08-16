# AL Maleek Workflow Automation & Delivery Brief

## 1) Purpose and source of truth

This brief defines the delivery workflow for AL Maleek. It is the operational companion to the project governance and technical architecture documents and is aligned to the approved implementation stack:

- Frontend hosting: Vercel
- Backend runtime: Golang
- Database: MongoDB
- Media storage: Cloudinary
- Email and notification delivery: Resend
- Deployment platform: Render Blueprint
- Architecture pattern: Hexagonal architecture

The governing sources are:
- foundation-governance.md
- architecture-system.md
- agent_plan.md
- repository-level project rules in CLAUDE.md and AGENTS.md

The project uses Jira as the structured source for requirements, task status, and traceability; GitHub as the implementation source for branch, commit, PR, and merge activity; and the project dashboard as the operational status view. All delivery activity must remain traceable from Jira story to GitHub implementation to deployment and release status.

## 2) Jira hierarchy and project structure

Required hierarchy:

- Client
- Project
- Epic
- Story
- Subtask

Each story must include:
- User Story
- Business Value
- Acceptance Criteria
- Technical Notes
- Definition of Done
- Estimates
- Dependencies

Standard workflow states:
- Lead → Discovery
- Discovery → Requirements Approved
- Backlog / Ready for Development
- In Progress
- Code Review
- QA Testing
- QA Failed
- QA Passed
- Staging
- UAT
- Beta
- Production
- Support
- Maintenance
- Closed

Project tagging and traceability:
- Every task must be mapped to the approved project, epic, story, and subtask structure.
- Business requirements, delivery tasks, risks, and defects must be linked to the relevant Jira story or epic.
- Jira must reflect the latest implementation and test state before any release gate is passed.

## 3) GitHub branch, commit, PR, and merge rules

Branching rules:
- Branch format: feature/PROJECTKEY-123-feature-name
- Example: feature/ALM-123-ticket-creation-flow
- Feature branches are created only from an approved story or task and should remain scoped to that work.

Commit rules:
- Commit format: PROJECTKEY-123 implement login validation
- Example: ALM-123 implement login validation
- Commits must remain clear, scoped, and traceable to the associated Jira story.

Pull request rules:
- PR title format: PROJECTKEY-123 Add login validation
- PRs must reference the Jira key, describe the change, note validation performed, and link to related tickets/acceptance criteria.
- PRs must be reviewed before merge and must not bypass the defined QA gate.

Merge rules:
- Merges are allowed only after validation has passed the applicable gate and the Jira record is updated.
- Merged pull requests automatically update Jira and dashboard status, provided the branch/PR metadata is aligned.
- No merge is considered complete until the implementation, tests, documentation, Jira status, and dashboard status are consistent.

Protected release flow:
- Feature branches are not considered done until: code implemented, tests pass, PR approved, PR merged, Jira updated, dashboard updated, and documentation updated when required.

## 4) AI workflow responsibilities and documentation standards

AI workflow responsibilities:
- AI must break down requirements into stories and subtasks.
- AI must propose estimates and implementation plans.
- AI must maintain Jira traceability and alignment with approved requirements.
- AI must avoid unrelated code changes and follow company coding standards.
- AI must update documentation when workflows, requirements, architecture, or operating procedures change.
- AI must not expose API tokens, client data, database credentials, GitHub secrets, or Jira credentials.

Approved AI role boundaries:
- Claude: planning, documentation, and workflow alignment
- Kimi: research and analysis support
- Codex: code generation and implementation support

Documentation standards:
- Every repository must include CLAUDE.md and AGENTS.md.
- Documentation is mandatory when workflow, architecture, operating procedure, or project-delivery behavior changes.
- Required outputs include BRD, PRD, architecture notes, API specification, wireframes, test reports, user guide, training material, release notes, and acceptance certificate.
- New team members must review the operating manual and project instruction files before onboarding assignments.

Shared artifact rules:
- Shared artifacts must have one owner and clear approval boundaries.
- No agent should rewrite another agent’s primary artifact without documented handoff and approval.
- Workflow automation is a delivery stream responsibility and must not create product or technical design scope in isolation.

## 5) SDLC gates: QA, staging, UAT, beta, and production

The required lifecycle is:

1. Discovery and requirements engineering
2. Solution design
3. Backlog grooming and sprint planning
4. Development
5. Internal QA
6. Staging deployment
7. User acceptance testing (UAT)
8. Beta release
9. Production release
10. Official sign-off
11. Hypercare and support

Quality and release gates:

### Internal QA gate
- Functional testing
- Integration testing
- Regression testing
- Test reports and defect reports recorded
- Status: QA Testing, QA Failed, QA Passed
- Exit criteria: defects resolved or formally accepted with mitigation and record

### Staging gate
- Deployment to staging
- Smoke testing
- Security scans
- Performance validation
- Approval required from QA before UAT or release

### UAT gate
- Client-side validation against approved requirements
- Feedback captured as defects or enhancement requests
- Entry to beta only after client approval

### Beta gate
- Limited rollout with monitored usage and feedback
- Adoption, errors, and user feedback tracked
- Beta exit requires measured performance and release readiness confirmation

### Production gate
- Production deployment after all prior approvals and client sign-off
- Monitoring and release notes generation
- Stakeholder notification and production readiness sign-off
- Formal project acceptance requires client approval and closure documentation

## 6) Dashboard fields and synchronization points

Required dashboard fields:
- Client
- Project
- Epic
- Story
- Jira Key
- GitHub Branch
- Pull Request URL
- Status
- Assigned Developer
- Estimated Effort
- Actual Effort
- Progress Percentage
- Last Updated

Synchronization points:
- Story creation: Jira task created and linked to project/epic
- Branch creation: GitHub branch created from approved story
- PR creation: PR URL added to dashboard and linked to Jira key
- QA pass/fail: status updated in Jira and dashboard
- Staging/UAT approval: environment status and approvals reflected in dashboard
- Merge to main: Jira and dashboard updated automatically from GitHub metadata
- Release sign-off: production readiness state reflected in dashboard
- Support transition: issue lifecycle moved into support/maintenance/closed states

The dashboard is not a parallel system; it is the live summary of the authoritative Jira/GitHub workflow. Any mismatch between Jira, GitHub, environment status, or release readiness should be treated as a workflow defect.

## 7) Release management, sign-off, and support transitions

Release management:
- All releases must be tied to a versioned scope, approval gate, and release note package.
- Production release requires deployment validation, monitoring, and stakeholder notification.
- Release outputs must include release notes and formal handoff records.

Sign-off flow:
- Discovery and solution design require internal and client approval at the defined gates.
- UAT requires client approval before beta or production release.
- Production release requires client sign-off before project acceptance and closure.
- Final presentation and acceptance meeting should produce the acceptance certificate and handover record.

Support transition:
- After official sign-off, the project moves into hypercare and support.
- Incidents and enhancements are tracked and triaged under support operations.
- Status progression: Support → Maintenance → Closed
- All support activity must be linked to the original project/business requirement or release record to preserve traceability.

## 8) Security and secret handling requirements

Security requirements:
- Secrets must be stored in environment variables and not in repository files.
- No hard-coded API keys, tokens, credentials, database strings, or client data in source code or documentation.
- Least-privilege access must be used for MongoDB, Cloudinary, Resend, and deployment services.
- Different credentials must be used per environment and per service role where possible.
- Vercel and Render must be treated as separate operational layers with environment-specific configuration.
- Browser code must not expose Cloudinary or other provider secrets.

Approved infrastructure controls:
- MongoDB: system of record for business data; connection string and database identity must stay in environment-scoped configuration.
- Cloudinary: signed upload payloads and environment-scoped keys for media operations; metadata retained in MongoDB while Cloudinary stores assets and variants.
- Resend: API key and sender configuration managed as environment variables; used for transactional and operational notifications, not as a general event bus.
- Render Blueprint: backend deployment, background jobs, and operational services; environment-aware integration and credential isolation.
- Vercel: frontend hosting and UI deployment; no direct secret exposure to the client side.

Architecture and security alignment:
- The Golang backend should remain the orchestration layer for business logic and external integrations.
- Hexagonal architecture must prevent domain logic from coupling directly to MongoDB, Cloudinary, Resend, or HTTP concerns.
- Resend, Cloudinary, and MongoDB are external capabilities behind adapter boundaries, not direct domain dependencies.
- Every integration should be reviewable, testable, and environment-scoped.

## 9) Delivery operating principles

- Use Jira for planning and traceability, GitHub for implementation execution, and the dashboard for operational visibility.
- Maintain one source of truth for the approved requirements and architecture.
- Protect the boundary between product scope, technical architecture, UX design, and operational workflow.
- Keep releases gated, documented, and approved before moving across QA, UAT, beta, and production.
- Treat deployment safety, secret hygiene, and support readiness as core delivery requirements, not as afterthoughts.

This workflow is the delivery baseline for the AL Maleek project and should be used for all project execution, environment transitions, and release decisions.
