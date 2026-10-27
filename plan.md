# FoodLoop — Implementation Plan

## Scope and implementation approach

FoodLoop will be a functional, responsive hackathon web prototype—not a static landing page. The project is currently an empty WebDev workspace at `/home/ubuntu/foodloop` with the managed Server and MySQL-compatible Database enabled and Preview configured for port `3000`. The main application will use React, TypeScript and Vite for the UI, a small Express/TypeScript API for server-owned operations, Drizzle ORM with the supplied `DATABASE_URL` for durable records, and React Router for connected pages. Keep packages focused and pin the package manager/toolchain before installation.

Implement real user sign-in with the default Manus OAuth integration and server-validated application sessions/roles; do not create an insecure local password system. The first screen will offer Login, Register/Sign in, and an explicitly marked **Explore demo mode**. Demo mode will use clearly labeled sample identities and isolated sample records; a role switcher is available only while in demo mode. Any password-recovery page will explain that credentials are managed by the identity provider rather than collecting or storing passwords in FoodLoop.

Use deterministic, realistic seed data for donors, NGOs, partner availability, sample listings and delivery events. A donor can create a validated listing; an NGO can inspect and accept/decline; an eligible nearby delivery partner can be assigned; involved roles can track status and confirm handoff. Persist real authenticated-user actions and activity history through the API/database. Preserve sample data and prior assignment history during the **Simulate delivery failure** → backup suggestion → authorized reassignment demo. Demo behavior is plainly labeled and must not expose real private data.

Implement support chat as a role-aware server endpoint using the provided Manus LLM service when available. The assistant can explain current authorized records and suggest actions, but must not mutate consequential records or claim an action succeeded; show explicit demo/simulated integration labels for AI/maps/messaging/tracking where appropriate. Do not present model output as food-safety certification. Keep transport/provider adapters separate so real maps, notifications, uploads or delivery integrations can be connected later.

## Pages and app structure

Routes: `/` (landing and auth/demo choices), `/login`, `/register`, `/reset-password`, `/onboarding`, `/dashboard`, `/donations`, `/donations/new`, `/donations/:id`, `/jobs`, `/tracking/:id`, `/support`, `/notifications`, `/impact`, `/profile`, `/admin`, `/help`, `/food-safety`, `/privacy`, and `/terms`. Use route guards for real authenticated roles; demo routes operate on explicit sample state. Role-aware side navigation and mobile navigation connect the product areas. Add `public/manus-routes.json` containing the complete route manifest before starting Preview.

Suggested source structure:

- `src/app/`: router, application shell, access/role context and global styles.
- `src/components/`: navigation, status/timeline, food/listing cards, forms, dialog, chat widget and accessible map illustration.
- `src/pages/`: the listed route screens, grouped by auth, donor/NGO, partner, admin and help areas.
- `src/data/`: typed demo fixtures, seed definitions and status constants.
- `src/services/`: API client, demo-mode adapter, role permissions, food-safety warnings and impact estimates.
- `server/`: Express entrypoint, OAuth/session middleware, role authorization, API routes, database access and LLM proxy.
- `drizzle/`: schema and additive migrations for users/organizations, listings, delivery assignments/events, notifications and activity history.
- `tests/`: focused tests for listing validation, acceptance/status transitions and failure reassignment.
- `docs/`: Mermaid architecture diagram, decisions/limitations, and demo recording guide.

## Product behavior and constraints

A donation captures food name/category/quantity/estimated servings/optional photo/preparation time/pickup location and window/storage/allergens/donor-provided safety information/use-by time. Recommendations consider distance, food type, NGO capacity/hours and urgency. Reject or clearly flag missing/concerning safety information and do not recommend an ETA later than the use-by deadline. Show an expiry countdown and ETA. Track `Listed → Matched → Partner Assigned → Picked Up → Delivered`, with simulated one-time handoff codes, timestamps, quantity confirmation and activity history. Display privacy-limited contact/location details only to active participants.

Include notifications/expiry alerts, profile/settings, onboarding, help/food-safety/privacy/terms, admin monitoring and an impact view for meals rescued, food delivered, successful deliveries and estimated waste prevented. Clearly label impact figures as illustrative estimates, not verified outcomes. Maps/tracking/OTP/photo confirmations and outbound messages are demo simulations unless configured. No payment feature is planned.

## Design direction (applies to all screens)

Three distinct possibilities: neo-organic editorial utility (0.07), tactile eco-dashboard with selective 3D depth (0.05), and high-contrast civic logistics console (0.03). **Chosen: tactile eco-dashboard with selective 3D depth.**

- **Design Movement:** Contemporary neo-organic product design with editorial warmth and restrained skeuomorphic depth.
- **Core Principles:** Make the next action obvious; communicate freshness and urgency at a glance; use depth to explain movement/status rather than decorate; keep every role calm and trustworthy.
- **Color Philosophy:** Deep forest green signals stewardship and reliability; warm cream keeps dense operational information approachable; citrus/lime and a restrained coral reserve highlight urgency, confirmation and exceptions.
- **Layout Paradigm:** A persistent narrow role-aware rail opens into a broad operational canvas; the dashboard pairs a live-feeling route/map panel with an offset activity ledger instead of a generic centered card grid.
- **Signature Elements:** Layered rounded “harvest” cards with soft lifted shadows; dotted route ribbons and pill-shaped status chips; a recognizable loop/leaf emblem used as a progress motif.
- **Interaction Philosophy:** Immediate, reversible feedback for routine actions; consequence-confirmation for acceptance, cancellation or reassignment; keyboard and screen-reader accessible controls throughout.
- **Animation:** Short, subtle rise/settle and marker movement; honor `prefers-reduced-motion`; no perpetual heavy 3D scene or motion required to understand a state.
- **Typography System:** Manrope for clear product UI paired with DM Serif Display for selective editorial headlines; compact tabular numerals for countdowns and quantities.
- **Brand Essence:** A trusted coordination layer that turns surplus into nearby meals before time runs out; practical, optimistic, accountable.
- **Brand Voice:** Warm, direct and action-led. Examples: “Good food still has time.” and “Keep this pickup moving.”
- **Wordmark & Logo:** Custom loop-shaped leaf mark made from two intersecting rounded paths, paired with a compact lowercase `foodloop` wordmark.
- **Signature Brand Color:** FoodLoop Forest, a deep evergreen.

## Serving and project conventions

Serve the Vite app and Express API from the configured project runtime on port `3000`; keep browser requests relative and do not derive public URLs from internal request hosts. Use the shared managed MySQL carefully: development and published code use the same database, so migrations/seeding must be additive and idempotent, and verification must avoid destructive writes. Keep LLM credentials server-side; never place secrets in client bundles or `.env.example`. Provide setup scripts and a lockfile; use `.env.example` for placeholder variable names only. The first screen and all views must work at mobile and desktop widths, including accessible reduced-motion behavior.

## Hackathon handoff

README will describe the problem, roles/features, setup, demo walkthrough, architecture, simulated integrations/limitations, and contribution guidance without inventing teammate work. Include `.gitignore`, `docs/architecture.mmd`, decisions and demo-recording steps. Keep all commits authentic; do not claim contributions for other people or commit build folders/secrets. Organizers must confirm repository visibility/URL, deadline/time zone and submission format.


## Follow-up refinement requested by the user
The application already has 20 distinct page routes, but users need a clearer way to discover them and proceed from mobile. Add a dedicated public `/explore` screen-picker page with 10 clearly named demo entry cards. Each card will select the matching sample role and navigate to an existing functional page; the landing and sign-in demo CTAs will lead to this chooser. Update `public/manus-routes.json`, keep the existing React Router and backend architecture, and style the page with FoodLoop's existing warm palette, tactile depth, accessible focus/touch targets, and responsive two-column mobile layout. No new service or dependency is needed.


## Follow-up fix from the user's onboarding screenshot
The role-selection page explicitly says organization details can be updated later, but the authenticated endpoint currently rejects a blank organization name. Align the UI/API contract: role selection must complete without an organization name, persist that field as `NULL` when omitted, and move the signed-in user into the workspace. Keep the form's optionality clear and provide visible saving/error feedback so an API failure is not a silent dead end. The demo path should continue using its existing sample-only behavior.