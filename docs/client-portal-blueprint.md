# AL Maleek Circle — client portal blueprint

## Product decision

AL Maleek Circle is one invitation-led account system with role-shaped workspaces. A person may hold several access roles and switch context without creating another account.

## Access roles and primary jobs

| Role | Primary jobs |
| --- | --- |
| Creator | Review offers, manage briefs and deliverables, grant campaign permissions, inspect performance, manage media kit, track earnings and payouts |
| Collaborator | See assigned projects, exchange files, complete milestones, respond to feedback, sign agreements and receive payments |
| Brand partner / advertiser | Review proposals, fund campaigns, approve creative, manage ad permissions, inspect reporting, download invoices and receipts |
| Community member / fan | Access announcements, conversations, benefits, ticket presales, member events, challenges, purchases and order history |
| Academy member | Continue learning, join live sessions, participate in a cohort, submit work and download certificates |

## Invitation and identity lifecycle

1. An administrator invites an email address with one or more scoped roles.
2. A single-use, expiring token opens the branded acceptance route.
3. The invitee verifies identity, creates credentials, completes role-specific onboarding and accepts relevant terms.
4. The account receives only the navigation and records permitted by its roles and resource assignments.
5. Additional invitations add access to the same identity rather than creating duplicate accounts.
6. Revocation removes the affected role or resource grant while preserving unrelated access and historical records.

## Required backend modules

- Identity: users, credentials or provider identities, sessions, MFA, recovery and device history.
- Invitations: hashed tokens, expiry, single use, intended email, roles, resource grants, inviter and audit trail.
- Access: roles, permissions, memberships and resource-scoped grants.
- Collaborations: briefs, participants, milestones, deliverables, files, feedback, approvals and agreements.
- Campaigns and ads: partner, creators, placements, creative versions, permissions, budget, performance and reports.
- Commerce and billing: proposals, invoices, payment intents, receipts, refunds and orders.
- Earnings and payouts: payees, balances, commission rules, holding periods, payout accounts, transfers and disputes.
- Community and academy: memberships, benefits, posts, challenges, courses, enrolments, progress, sessions and certificates.
- Notifications and messaging: conversations, participants, read state, preferences and lifecycle notifications.

## Security baseline

- Store only hashed invitation and session secrets.
- Enforce single-use invitations, expiry and intended-email checks.
- Require server-side permission checks for every resource; hidden navigation is not authorization.
- Use idempotency keys for payment, payout and invitation acceptance mutations.
- Maintain immutable audit events for role changes, approvals, agreements, billing and payouts.
- Separate platform money, partner payments and creator payouts with explicit ledger entries.

## Research grounding

- Shopify Collabs demonstrates direct creator invitations, programs, affiliate performance, commissions, holding periods and payout readiness.
- Stripe Connect demonstrates connected-account onboarding, account management, balances, payouts, notifications, documents and disputes embedded within a platform-branded portal.
- Meta partnership ads demonstrate the need for explicit creator-to-advertiser content and account permission management plus shared performance visibility.
- Patreon-style membership models reinforce member profiles, direct community participation, benefits and exclusive access as distinct from public content consumption.

## Current implementation boundary

`apps/client` provides the complete navigable experience foundation and representative role-aware workflows. It intentionally uses seeded view models until the identity, invitation, collaboration, campaign, billing and payout API modules above exist. Production must not treat client-side role switching as authorization.
