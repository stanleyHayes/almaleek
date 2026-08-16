# AL Maleek Launch Readiness Brief

## Purpose
This brief formalizes the launch-readiness requirements for AL Maleek based on the approved project governance, technical architecture, and delivery workflow. It aligns to the approved stack and architecture decisions already captured in the project plan:

- Frontend hosting: Vercel
- Backend runtime: Golang
- Database: MongoDB
- Media storage: Cloudinary
- Email and notification delivery: Resend
- Deployment model: Render Blueprint
- Architecture pattern: Hexagonal Architecture

This document is a launch-stream artifact only. It supports the project’s existing governance, architecture, and roadmap documents without redefining their scope.

---

## 1) Go-live readiness checklist

### A. Product and business readiness
- [ ] Core launch scope is approved and mapped to release stories, acceptance criteria, and Jira status.
- [ ] Launch features are limited to approved MVP/launch scope and not blocked by pending redesign or roadmap changes.
- [ ] Legal/customer-facing statements, pricing, terms, privacy, and consent language are reviewed and approved.
- [ ] Owner for each critical journey (signup, event ticketing, enquiries, commerce, community participation) is assigned.
- [ ] Launch comms and customer support scripts are approved before release.

### B. Technical readiness
- [ ] Vercel production environment is configured for frontend delivery and preview environments.
- [ ] Render Blueprint production environment is configured for the Golang backend, scheduled jobs, and supporting services.
- [ ] MongoDB production database is provisioned, secured, and validated for data integrity and backup/recovery.
- [ ] Cloudinary production credentials and media policies are provisioned with least-privilege access.
- [ ] Resend production API keys, sender identities, and email templates are verified and tested.
- [ ] Environment variable separation is enforced across local, staging, and production.
- [ ] Secrets are not stored in repository files or client-side code.
- [ ] Hexagonal architecture boundaries are enforced: domain logic is separated from MongoDB, Cloudinary, Resend, and HTTP adapters.

### C. Quality and release readiness
- [ ] Functional testing is complete for launch-critical user journeys.
- [ ] Integration tests cover MongoDB persistence, Cloudinary uploads/transformations, and Resend transactional email flows.
- [ ] Regression testing is complete for priority workflows and release-sensitive components.
- [ ] Smoke tests are defined and executed against staging before production.
- [ ] Error, performance, and uptime thresholds are agreed, measured, and documented.
- [ ] Release notes and rollback instructions are prepared.
- [ ] Production support contacts and escalation chain are confirmed.

### D. Operational readiness
- [ ] Monitoring dashboards and alert thresholds are live before go-live.
- [ ] Weekly and launch-day incident coverage is assigned.
- [ ] Hypercare support model is confirmed with response and resolution SLAs.
- [ ] Support runbooks are published and accessible to operations and support teams.
- [ ] Post-launch triage, bug ownership, and enhancement tracking process is clear.

### E. Launch gate decision
Go-live is approved only when all required sign-off owners confirm the checklist is complete, defects are below agreed thresholds, and production monitoring is active.

---

## 2) UAT and sign-off gates

### Gate 1: Internal QA completion
Entry criteria:
- All critical user stories are complete.
- Internal QA is executed against the approved launch scope.
- Defects are triaged, corrected, or formally accepted with mitigation.
- Test evidence is recorded and linked to Jira.

Exit criteria:
- QA status is set to QA Passed.
- No critical or high-severity defects remain open for launch.
- Release candidate is promoted to staging.

### Gate 2: Staging validation
Entry criteria:
- Production-like build and environment variables are deployed to staging.
- Security scans and smoke tests are executed.
- End-to-end flows are validated using staging data or safe test fixtures.

Exit criteria:
- Staging approval is obtained from QA and technical owner.
- No unresolved blockers affecting go-live.

### Gate 3: UAT sign-off
Entry criteria:
- Client-side testing is complete against approved requirements.
- Feedback is captured and classified as defect or enhancement.
- Launch-critical defects are resolved or explicitly accepted by the product owner.

Exit criteria:
- Client approves the release candidate for production.
- UAT feedback is recorded in Jira and the project dashboard.

### Gate 4: Production readiness sign-off
Entry criteria:
- Production environment is verified with a final smoke test.
- Monitoring, alerting, and escalation are active.
- Rollback plan is reviewed and approved.
- Support and ops owners confirm their coverage.

Exit criteria:
- Formal sign-off by product owner, engineering lead, and client representative.
- Production release notes are approved.

### Gate 5: Launch acceptance and handoff
Entry criteria:
- Production deployment is complete.
- Launch KPI baseline is captured.
- Support and hypercare teams are in place.
- Launch-day communications are scheduled.

Exit criteria:
- Launch is live.
- Ticketing and support workflow is active.
- Hypercare starts and ownership is transferred to support and operations.

---

## 3) Production deployment and rollback plan

### Deployment architecture
- Vercel hosts the frontend and public-facing experience, with production deployment tied to the verified release commit.
- Render Blueprint hosts the Golang backend, API services, background jobs, and operational automation.
- MongoDB remains the system of record for domain data; production and staging should use separate logical or physical environments.
- Cloudinary holds media assets and transformations; MongoDB stores asset metadata and ownership records.
- Resend powers transactional communications; provider-specific sender metadata and templates remain environment-specific.
- All integrations remain behind hexagonal architecture ports/adapters so the domain core is not coupled to infrastructure implementations.

### Release steps
1. Final staging validation is completed and signed off.
2. Release branch or approved commit is tagged with the planned version.
3. Production deployment is executed using the approved Render Blueprint release pipeline and Vercel production deployment workflow.
4. Database migration/finalization checks run before fully enabling traffic.
5. Post-deploy smoke tests verify:
   - homepage loads
   - signup/lead capture works
   - critical event, commerce, or enquiry flows work
   - email delivery is functioning
   - assets load from Cloudinary
   - API health endpoints are green
6. Monitoring is reviewed in the first 30–60 minutes for errors, latency, and business KPI drift.
7. Stakeholders are notified that the product is live and support coverage is active.

### Rollback plan
Rollback is triggered by any of the following:
- critical error rate exceeds agreed threshold
- database inconsistency or corruption risk
- payment, ticketing, or order-processing failures that block launch-critical transactions
- severe Cloudinary or Resend integration failure affecting core funnel or user experience
- inability to restore service without significant user impact

Rollback procedure:
1. Freeze new deployments and move to incident triage.
2. Switch Vercel production to the prior known-good frontend version if the issue is UI/API-connected and safe to revert.
3. Redeploy the prior stable backend version in Render Blueprint if the root cause is in the API or job layer.
4. If data integrity risk exists, suspend writes to affected workflows and validate data consistency before continuing.
5. Restore affected configuration or provider credentials if misconfiguration is the root cause.
6. Notify stakeholders, update Jira, and document the incident and root cause.
7. Re-run smoke tests and re-enable release traffic only after the rollback is verified stable.

### Change freeze
A launch freeze begins 24 hours before production release, unless the issue is a security or critical customer-impacting defect. Changes outside approved release scope are rejected during this window.

---

## 4) Monitoring and incident handling workflow

### Monitoring scope
Production monitoring must cover:
- frontend availability and latency on Vercel
- backend health and response times on Render Blueprint
- MongoDB health, throughput, and query performance
- Cloudinary media delivery errors and signed upload issues
- Resend delivery failures and bounce/complaint monitoring
- user funnel conversion and business transaction completion
- error rates, failed webhooks, failed jobs, and queue/backlog health

### Alerting and severity model
- Sev 1: production outage or critical business flow failure affecting conversion, payments, signups, or event transactions.
- Sev 2: significant degradation affecting major user journeys but with a workaround.
- Sev 3: limited or non-critical issue affecting a single workflow or a small cohort.
- Sev 4: low-impact issue, informational alert, or enhancement request.

### Incident workflow
1. Alert is raised through the monitoring system or direct user report.
2. On-call owner acknowledges the incident and confirms severity.
3. Incident lead opens a tracking record and assigns owners for technical and customer-impact analysis.
4. Immediate mitigation is applied to reduce user impact.
5. Root cause analysis is conducted and documented.
6. Fix is validated in a safe environment or hotfix release as appropriate.
7. Recovery is confirmed, support is briefed, and user-facing updates are sent if required.
8. Incident outcome is added to a post-incident report and the launch support log.

### Required operational practices
- Every production issue must be linked to a release or support record.
- Production owners must review incident trends during hypercare, not only after service failure.
- No change is considered complete without validation and documentation.
- Secrets, environment variables, and provider credentials must remain segregated by environment.

---

## 5) Support model and hypercare plan

### Support model
The launch phase should use a structured support model with clear ownership and triage rules:

- Product owner: business priorities, issue prioritization, launch acceptance decisions
- Engineering owner: technical triage, production fixes, release decisions
- Support lead: customer-facing issue intake, triage, and escalation coordination
- Operations owner: infra, deployments, monitoring, and environment health
- QA owner: regression validation and release verification

### Hypercare plan
Recommended hypercare structure for the first 30 days after launch:
- Daily launch stand-up during the first 2 weeks
- Twice-weekly business and technical review for the remainder of the initial hypercare window
- Daily monitoring review for the first 7 days
- Dedicated on-call rotation for critical incidents
- Fixed escalation path for merchant, event, or customer-impacting issues
- Weekly service summary covering uptime, incidents, defects, conversion health, and actions

### Service expectations
- Critical incidents: acknowledge within 15 minutes during active support coverage
- High-priority issues: respond within 1 hour
- Non-critical issues: respond within 1 business day
- Severity classification and fix ownership must be tracked in Jira or the support workflow system

### Knowledge transfer
Before moving from hypercare to maintenance/support, the support and operations teams must receive:
- user journey ownership map
- environment architecture overview
- deployment and rollback instructions
- monitoring dashboard access and alert guidance
- known defects and planned remediation list
- escalation matrix and contact tree

---

## 6) Launch KPIs and communication plan

### Launch KPIs
The launch KPI set should be reviewed daily during the first 30 days and weekly thereafter:

- Frontend availability: 99.9% target for production uptime
- API health: error rate below agreed threshold
- Conversion rate: landing page to signup, contact, or purchase completion
- Ticketing and commerce conversion: completion rate for each critical transaction
- Email delivery success: welcome, confirmation, and reminder messages delivered successfully
- Media performance: successful Cloudinary fetches and asset load failures
- Bug volume: number of new critical/high defects discovered post-launch
- Time to resolve: average time to acknowledge and close Sev 1–Sev 3 incidents
- Support SLA compliance: percentage of issues resolved within the agreed SLA window

### Launch communication plan
#### Pre-launch communications
- confirm release date, owner list, and support scheduling
- notify stakeholders of release scope, known limitations, and rollback triggers
- communicate go-live checklist completion and final approval status

#### Launch-day communications
- post a launch announcement through approved channels
- share support contact points and expected business-hours coverage
- keep a central status log for user-impacting incidents and fixes
- use a single, approved source of truth for status messaging

#### Post-launch communications
- send daily or weekly service summary to stakeholders
- clarify outstanding issues, mitigations, or feature work
- publish release notes and known issue logs
- close the hypercare review with a clear support/maintenance handoff

### Communication governance
- All launch communications must remain aligned with approved customer-facing messaging.
- Customer or stakeholder updates must be factual, traceable, and approved before broad distribution.
- Support and operations should coordinate launch-day updates through a single owner to avoid conflicting instructions.

---

## 7) Ownership handoff checklist for support and operations

Support and operations must not assume ownership until the following are complete:

- [ ] Production environment configuration is signed off and documented.
- [ ] Deployment and rollback procedures are reviewed with the operations owner.
- [ ] Monitoring dashboards, alerts, and alert routing are live and tested.
- [ ] Support team has access to Jira, deployment logs, environment dashboards, and incident channels.
- [ ] User journeys and customer-impacting workflows are assigned to owners.
- [ ] Escalation matrix is published and validated.
- [ ] Incident severity definitions and response SLAs are agreed and documented.
- [ ] Known issues and mitigations are logged and shared.
- [ ] Handover meeting is completed with product, engineering, support, and operations.
- [ ] Sign-off certificate is recorded for official support transition.
- [ ] Hypercare review cadence and support operating hours are communicated.
- [ ] Final ownership record confirms the state: support / maintenance / closed.

### Required handoff evidence
- launch checklist signed by product, engineering, and support owners
- final UAT sign-off and production readiness sign-off
- release notes approved for publication
- incident and support workflow runbook available to the support team
- production KPI baseline captured for comparison

---

## 8) Final launch decision statement
AL Maleek is ready to go live only when the release has passed internal QA, staging validation, UAT sign-off, production readiness review, and final support handoff. The approved stack—Vercel, Golang backend, MongoDB, Cloudinary, Resend, Render Blueprint, and hexagonal architecture—must remain the operating baseline throughout launch, hypercare, and the transition to ongoing support.
