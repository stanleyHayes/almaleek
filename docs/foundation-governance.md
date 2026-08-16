# AL Maleek Foundation Governance and Requirements Brief

## 1) Business objective

The AL Maleek project is not a conventional social-media-only brand site. The source documents define it as a digital business infrastructure that turns existing attention, audience, and creative influence into an owned, structured, and scalable ecosystem.

Core business flow:
- Content → Audience → Community → Opportunities → Experiences → Commerce → Data → Long-term Brand Value

The stated purpose is to make the AL Maleek platform the digital home of the brand, where fans, businesses, event organizers, aspiring creators, collaborators, and partners can interact with AL Maleek beyond simply watching content. Social platforms remain the discovery and distribution engine; the owned platform becomes the destination for deeper relationship, transaction, participation, and ongoing community value.

## 2) Project scope and target ecosystem

The AL Maleek ecosystem is intended to unify several existing business areas under one brand-owned infrastructure:
- content creation
- comedy and entertainment
- filmmaking
- events
- advertising
- brand partnerships
- audience engagement
- social media influence

Target participants and stakeholders include:
- fans and community members
- businesses and brand partners
- event organizers and ticket buyers
- aspiring creators and collaborators
- actors, comedians, musicians, directors, videographers, editors, photographers, influencers, and event organizers
- learners and creators seeking education and mentorship

### Core functions and platform components
- AL Maleek Central: digital home of the brand, presenting projects, announcements, partnerships, press, community activity, and business contact information.
- Work With AL Maleek: structured booking and commercial enquiry process for events, campaigns, sponsorships, appearances, product placement, and partnerships.
- AL Maleek Live: event and ticketing experience for comedy shows, premieres, campus events, meetups, workshops, and collaborations.
- Community and fan participation: challenges, voting, alternative endings, audience submissions, character/story/merchandise choices, and recognition for meaningful participation.
- AL Maleek Shop: merchandise, limited editions, film/event merchandise, digital products, and creator resources.
- AL Maleek Academy: educational IP covering content creation, comedy, acting, filmmaking, smartphone filmmaking, social media growth, scriptwriting, video production, and creator business.
- Creator Collaboration Network: trusted network for future productions, partnerships, and collaborations.
- Brand Partnership Portal: audience reach, engagement statistics, campaign examples, media kit, partnership formats, and business contact information.
- Business and opportunity management: bookings, brand enquiries, events, ticket sales, customers, community members, memberships, merchandise, orders, casting applications, content, partnerships, campaigns, payments, notifications, and analytics.

## 3) Mandatory SDLC and lifecycle stages

The company’s operations manual defines the end-to-end SDLC and project flow. The required lifecycle is:

1. Lead and Client Onboarding
   - Discovery call
   - NDA and agreements
   - Stakeholder identification
   - Budget and timeline discussions
   - Outputs: Client Profile, Project Record, Discovery Notes
   - Dashboard status: Lead → Discovery

2. Discovery and Requirements Engineering
   - Stakeholder interviews
   - User journey mapping
   - Business process mapping
   - Competitor analysis
   - Feature identification
   - AI automation: Meeting Notes → Requirements → Personas → User Stories → Risk Register
   - Deliverables: BRD, functional requirements, non-functional requirements, user personas, user journeys
   - Approval gate: Client approval required

3. Solution Design
   - Architecture design
   - Database design
   - API design
   - Security design
   - UI/UX wireframes
   - Deliverables: PRD, Architecture Document, ERD, API Specification, Wireframes
   - Approval gate: Engineering Lead approval

4. Backlog Grooming and Sprint Planning
   - Feature prioritization
   - Story decomposition
   - Story estimation
   - Dependency mapping
   - AI automation: Technical Specifications → Epics → Stories → Subtasks → Estimates
   - Jira structure: Project → Epic → Story → Subtask
   - Approval gate: PM approval

5. Development
   - Branch creation
   - Feature implementation
   - Unit testing
   - Pull request creation
   - Standards: Branch format feature/PROJECTKEY-123-feature-name; commit format PROJECTKEY-123 implement feature; PR format PROJECTKEY-123 Feature Name
   - AI roles: Claude = planning and documentation; Kimi = research and analysis; Codex = code generation

6. Internal QA
   - Functional testing
   - Integration testing
   - Regression testing
   - Outputs: test reports and defect reports
   - Jira status: QA Testing, QA Failed, QA Passed

7. Staging Deployment
   - Deploy to staging
   - Smoke testing
   - Security scans
   - Performance validation
   - Approval gate: QA approval

8. User Acceptance Testing (UAT)
   - Client testing
   - Feedback collection
   - Enhancement requests
   - Defect reporting
   - Outputs: UAT sign-off, UAT defects, UAT enhancements
   - Approval gate: Client approval

9. Beta Release
   - Limited user rollout
   - Feedback monitoring
   - Analytics tracking
   - Metrics: adoption, errors, user feedback

10. Production Release
   - Production deployment
   - Monitoring
   - Release notes generation
   - Stakeholder notification
   - Automation: GitHub → CI/CD → Production → Jira → Dashboard

11. Official Sign-Off
   - Final demo
   - Acceptance meeting
   - Handover meeting
   - Deliverables: User Guide, Training Material, Release Notes, Acceptance Certificate
   - Approval gate: Client signs project acceptance

12. Hypercare and Support
   - Post-launch support
   - Incident management
   - Bug fixing
   - Enhancement tracking
   - Dashboard status: Support → Maintenance → Closed

## 4) Governance rules and project rules

### Source of truth
The project’s official workflow and governance are defined by the company’s training and operations manuals, with repository-level project rules captured in CLAUDE.md and AGENTS.md. As the project moves through delivery, Jira is the structured source for requirements, task status, and traceability; GitHub is the implementation source for branch, commit, PR, and merge activity; the dashboard reflects progress automatically.

### Agent boundaries
The documents make the following AI workflow rules mandatory:
- AI must break requirements into stories and subtasks.
- AI must suggest estimates and generate implementation plans.
- AI must avoid modifying unrelated code.
- AI must follow company coding standards.
- AI must create or update documentation when changes affect workflows or requirements.
- AI must maintain Jira traceability.
- AI must keep implementation aligned with requirements.
- AI must not expose API tokens, client data, database credentials, GitHub secrets, or Jira credentials.
- All secrets must be stored in environment variables.
- Every repository must contain CLAUDE.md and AGENTS.md.

### Jira and GitHub workflow
Required project structure and workflow:
- Structure: Client → Project → Epic → Story → Subtask
- Each story must include:
  - User Story
  - Business Value
  - Acceptance Criteria
  - Technical Notes
  - Definition of Done
  - Estimates
  - Dependencies
- GitHub standards:
  - Branch: feature/PROJECTKEY-123-feature-name
  - Commit: PROJECTKEY-123 implement login validation
  - Pull Request: PROJECTKEY-123 Add login validation
- Merged pull requests automatically update Jira and the dashboard status.
- Dashboard must display the required fields: Client, Project, Epic, Story, Jira Key, GitHub Branch, Pull Request URL, Status, Assigned Developer, Estimated Effort, Actual Effort, Progress Percentage, Last Updated.

### QA, UAT, and release gates
Mandatory quality gates defined in the source docs:
- No feature is complete until code is implemented, tests pass, PR is approved, PR is merged, Jira is updated, dashboard is updated, and documentation is updated if required.
- Internal QA gate before staging: functional, integration, and regression testing results must be recorded.
- Staging gate: QA approval required before UAT or release.
- UAT gate: client approval required before beta or production release.
- Production release gate: client sign-off is required before formal project acceptance and closure.
- All meetings must generate action items; discovery, weekly project, UAT, release, and project closure meetings each create defined task types or blockers.

### Documentation expectations
Documentation is mandatory and part of the required delivery and governance process:
- Every repository must include CLAUDE.md and AGENTS.md.
- Documentation must be updated when changes affect workflows, architecture, operating procedures, or project delivery behavior.
- Deliverables include the BRD, PRD, architecture notes, API specification, wireframes, test reports, user guide, training material, release notes, and acceptance certificate.
- New employees must read the operating manual and project instruction files before onboarding assignments.

## 5) Alignment with downstream delivery
This brief is the baseline for project execution. It defines the business opportunity, intended target ecosystem, required functional scope, SDLC stages, and governing controls for AI-assisted software delivery. Any downstream work should remain traceable to Jira, aligned to the approved requirements, and consistent with the documented QA, documentation, and release gates.
