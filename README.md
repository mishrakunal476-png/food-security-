# FoodLoop — Rescue more. Waste less.

FoodLoop is a college-hackathon product prototype for moving surplus meals from restaurants, canteens and hostels to nearby NGOs and food banks before the stated use-by time. Donors list food, an NGO reviews and accepts, a delivery partner takes the route, and the people involved can follow a timestamped handoff. The application is deliberately honest about what is a sample estimate and what is a simulated integration.

## Roles and demo

The app supports four role experiences: Food Donor, NGO / Food Bank, Delivery Partner and Admin. The first screen offers sign-in/register and **Explore demo mode**. Real accounts use Manus OAuth; FoodLoop does not ask for or store passwords. Demo mode uses local sample organizations, donations, partner identities, notifications and activity; role switching is explicitly demo-only and does not authenticate a real account. Admin monitoring in this prototype is sample-only; real admin provisioning and user monitoring are not configured.

Recommended judge walkthrough: (1) enter demo mode as Food Donor and create a listing with servings, preparation, pickup, storage, allergens and use-by; (2) switch to NGO / Food Bank, review details and accept; (3) switch to Delivery Partner and accept a route; (4) open a delivery timeline and confirm pickup/delivery; (5) on the overview, switch to donor, NGO or admin, press **Simulate delivery failure**, then confirm a backup partner and inspect the retained assignment history. The seeded sample listing `FL-2418` is already partner-assigned to make the failure scenario immediately available.

## Product areas

- Landing and identity: sign-in, registration entry, provider-managed password-recovery guidance, onboarding, role-aware navigation and explicit demo/sample labeling.
- Donations: donor listing form; search/filter browse board; detail with quantity, servings, storage, allergens, preparation, pickup and expiry; nearby NGO matching by category/capacity/distance; accept/decline.
- Deliveries: partner job board; `Listed → Matched → Partner Assigned → Picked Up → Delivered` timeline; ETA and use-by countdown; simulated handoff code; failure simulation, backup suggestion, confirmation and preserved assignment history.
- Support: role-aware floating assistant and support page. Demo answers run against sample guidance. For authenticated users, the server proxy can call the configured Manus LLM service after authorizing and reducing record context. It can explain, not mutate, delivery actions or certify food safety.
- Operations: notifications, participant privacy notes, profile/settings, admin activity/exceptions, estimated impact, help, food-safety, privacy and terms pages.

## Run locally / in the managed Preview

Requirements: Node.js 22+ and pnpm 11. The project pins pnpm in `package.json` and allows the required esbuild installation script in `pnpm-workspace.yaml`.

```bash
pnpm install
pnpm dev
```

The Express + Vite development server listens on `0.0.0.0:3000` (or `PORT`) and serves the SPA plus API routes. In the managed WebDev sandbox, Server and MySQL Database capabilities are enabled. Set no secrets in browser code. Copy `.env.example` only when configuring a separate local environment; the file deliberately contains blank placeholder names only.

To apply the additive MySQL schema to a configured database:

```bash
pnpm db:migrate
```

This creates `users`, `app_sessions`, `donations`, `activity_events`, `notifications` and a migration-history table. The migration is idempotent and non-destructive. Development and publication share the managed database; inspect your target before any manual data changes. Demo-mode sample records stay in browser local storage and are not seeded into that shared database.

Create an optimized client build and run focused workflow tests:

```bash
pnpm build
pnpm test
```

## Architecture

React/TypeScript/Vite renders the responsive client and route manifest (`public/manus-routes.json`). Express owns the API, OAuth callback, hashed opaque sessions, role checks and the server-side AI proxy. Drizzle maps app records to the managed MySQL schema; SQL migrations are committed under `drizzle/`. Demo workflow is a separate local-storage adapter backed by pure matching/state-transition rules so judges can reset and replay it without making production-like database writes.

See [the architecture diagram](docs/architecture.mmd) and [design decisions](docs/decisions.md).

## Safety, privacy and limitations

Allergens, storage, preparation and expiry are displayed as donor-provided information. Missing donor notes and allergen declarations are rejected; a small phrase list can flag possible concerns for human review but is not exhaustive and is not a food-safety assessment. FoodLoop AI does not certify food safety. The API limits nonparticipant pickup location details and support context. Donation photos are optional, selected from the device, and shown only in a local preview; image bytes are not uploaded or attached to saved records. Delivery ETA, map markers/route, partner availability, demo OTP/photo confirmation, notifications and impact figures are simulated. Meal totals use estimated delivered servings; waste prevented is a rough estimate at 0.45 kg per serving, not verified weight or audited outcomes. Payments, refunds and external messaging are not implemented. The server-side AI endpoint uses project-provided Manus service credentials when available; each completion can consume project credits. If the service is unavailable, the app shows a retry/escalation message rather than claiming an answer.

For a live deployment, configure production OAuth redirect policy, validate identity/role access, establish data retention and safety procedures, add actual mapping/notification/delivery integrations, and review the managed database before rollout. No real integration or compliance certification is implied by this demo.

## Tests

`pnpm test` exercises form requirements, use-by versus estimated arrival, NGO capacity/category/distance fit, partner backup suitability, allowed delivery status transitions and illustrative impact calculations. Keep additional user interface and API tests focused on core acceptance and authorization behavior.

## Team contributions and submission

This starter deliberately makes no claim that teammates contributed or that any contribution was committed. Each teammate should use their own account and submit at least one genuine, reviewable contribution to the designated repository. Do not create fake commits or commit secrets/build output. Use small, focused commit messages, such as `feat: add donation acceptance flow` or `test: cover delivery reassignment`.

Before submitting, confirm the official repository URL and visibility, deadline/time zone, and submission form or format with the organizers. This prototype is not automatically connected to a public GitHub submission repository.
