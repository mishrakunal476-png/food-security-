# FoodLoop — TODO

## 1. Responsive FoodLoop entry, identity and role-aware navigation
- [x] Build a complete, polished, mobile-first FoodLoop application for restaurants/hostels to redistribute surplus food to nearby NGOs/food banks before expiry, with a dynamic delivery network and AI support agent; deliver a working prototype, not only a landing page or mockup.
- [x] Support four roles: Food Donor (restaurant, canteen, hostel), NGO/Food Bank, Delivery Partner and Admin. The main demo journey must be donor lists food → NGO accepts → partner is assigned → food is tracked → handoff is confirmed.
- [x] First screen clearly offers login and registration/sign-in and an explicitly labeled demo-mode/demo-account entry. Include role-specific onboarding, password recovery entry, role-based dashboard and working navigation across all product pages.
- [x] Provide connected routes/views for landing, login, registration, password reset, onboarding, role dashboard, create listing, donation browse and detail, accept/decline, partner jobs, delivery tracking/timeline, support chat and global floating support widget, notifications/expiry alerts, impact, profile/organization/settings, admin, help, food safety, privacy and terms.
- [x] Use real Manus OAuth/application authorization for real users; do not implement a fake password system or silently treat a visitor as authenticated. Demo identities, sample records and a role switcher must be clearly demo-only and isolated from real-user private data.
- [x] Responsive across phone, tablet and desktop; accessible contrast/readable text; keyboard-friendly controls; consistent typography, spacing, buttons and icons; provide loading, empty, validation and error states; respect reduced-motion preference.

## 2. Donor listing and NGO matching
- [ ] Donors can submit food name, category, quantity, estimated servings, optional photo, preparation time, pickup location and pickup window, storage conditions, allergens, donor-provided food-safety information and use-by/expiry time. (Food/photo selection has a <=2 MB local preview; photo bytes are not uploaded or stored.)
- [ ] Validate required and concerning/missing safety information and flag it for review; make allergens, storage, prep and expiry details prominent. The AI must never certify food as safe based only on a model response. (Missing notes and undeclared allergens are rejected; selected concerning phrases are flagged for human review, but this keyword list is not exhaustive and is not a safety assessment.)
- [ ] Recommend nearby NGOs using distance, food type, NGO capacity, operating hours and urgency; show key details before acceptance. NGO can accept or decline a listing. (Demo checks category/capacity/distance and ETA; operating-hours/urgency ranking remains open.)
- [x] Do not recommend a delivery whose estimated arrival is later than the stated use-by time. Show the use-by countdown and delivery ETA.
- [x] Restrict private contact and location data to users involved in the active donation/delivery.

## 3. Delivery assignment, tracking, confirmation and reassignment
- [x] Support this visible delivery status sequence: `Listed → Matched → Partner Assigned → Picked Up → Delivered`.
- [ ] Assign partner based on availability, proximity and capacity; support partner job board, delivery tracking and a visible event timeline. (Backup suggestions use demo availability/distance/capacity; account-specific real partner qualification remains open.)
- [x] Provide demo one-time-code or photo confirmation for pickup and delivery, with timestamps and delivered quantity; label these functions simulated unless a real integration is configured.
- [ ] Include a visible **Simulate delivery failure** control. A partner can decline, become unavailable or miss a milestone; notify donor, NGO and admin; suggest the next suitable backup partner; require authorized confirmation before reassignment; update the timeline while preserving the previous assignment in activity history. (Partner decline and simulated failure work; a distinct missed-milestone trigger remains open.)
- [x] Keep real tracking, maps, messaging, photo/OTP confirmation and delivery events clearly marked demo/simulated unless actually configured; do not claim an unconfirmed status change succeeded.

## 4. Role-aware AI support, notifications and safe actions
- [x] Provide an AI support chat page and a floating widget accessible from every app page. It answers questions about donation listings, acceptance, delivery tracking, late/failed delivery, account support and food-safety information (and payment/refund only if payment features are introduced).
- [x] Agent understands the current user's role and uses donation/delivery information only when the user is authorized to see it; explains suggestions and current status and offers escalation to admin/human support.
- [x] Do not claim an action succeeded until the application confirms it; ask for confirmation before consequential actions (such as cancelling an active delivery or processing a refund); never collect or display full payment-card details.
- [x] Clearly label AI responses and AI/maps/payments/messages/tracking as demo or simulated where integrations are not actually configured; keep provider integrations modular for later connection.
- [ ] Add notifications, expiry alerts and activity history; provide usable loading/error/retry feedback. (Failure alerts/history work; scheduled/automatic expiry notifications are not configured.)

## 5. Demo data, roles, admin and impact reporting
- [x] Include realistic sample donors, NGOs, listings, partner availability and delivery events. Make the main flow interactive, short and straightforward to present.
- [x] Clearly label demo accounts, sample data and demo-only role switching; keep demo behavior separate from authenticated user data.
- [ ] Admin dashboard monitors users, donations, deliveries, alerts and unresolved issues, including delivery failure and reassignment activity. (Admin workspace is sample-only; production admin provisioning/user monitoring is not configured.)
- [x] Impact dashboard reports meals rescued, food delivered, successful deliveries and estimated waste prevented; label each estimate illustrative/estimated, not verified real-world results.

## 6. Hackathon repository documentation and structure
- [x] Organize maintainable source into pages/components/services/data and server/database modules; use an appropriate modern component-based stack and avoid unnecessary risky infrastructure/dependencies.
- [x] Include `README.md` describing the problem, users, features, setup, demo flow, architecture, limitations and team contributions; include `.gitignore` and `.env.example` containing placeholder variable names only.
- [x] Include basic tests for important forms and donation/delivery flows.
- [x] Add `docs/` with an architecture diagram and important design decisions; include screenshots or clear instructions for recording a short demo.
- [x] Never commit real secrets, personal/private data or generated build folders. Do not create fake commits or claim that every teammate contributed; each teammate must use their own GitHub account and make at least one genuine, reviewable contribution to the designated repository.
- [ ] Keep commits small, focused and traceable with meaningful messages. Confirm official repository URL/visibility, deadline/time zone and submission form with organizers rather than inventing them. (Confirm official repository URL/visibility, deadline/time zone and submission format with organizers.)

## 7. Visual direction and honest demo presentation
- [x] Use a premium, warm, sustainability-focused deep green, cream and bright accent palette, with a polished non-generic product interface.
- [x] Use selective 3D-inspired depth, layered cards, subtle animations, an interactive map-style illustration/markers, smooth transitions and clear status animations without slowing or distracting from product actions.
- [x] Keep all UI readable, accessible, mobile-friendly and credible; use reduced-motion support. Avoid heavy decorative 3D that sacrifices the working end-to-end demo.
- [x] Be explicit wherever AI, maps, payments (if any), messages, tracking and confirmations are simulated; never present estimates as verified outcomes or claim real-world food-safety certification.


## 8. Follow-up from the user: selectable, multi-page, mobile 3D experience
- [x] Provide a dedicated `/explore` screen-picker with at least 10 distinct, clearly named product-page choices; each choice selects the matching sample role and opens its own working route. Keep the complete FoodLoop feature set available through clear links/buttons so the app does not feel like one long landing screen.
- [x] Fix the reported inability to select controls or progress: primary links, demo entry, role switcher, form fields, cards/actions and navigation must respond to pointer, touch and keyboard input, with no blocking invisible overlay or disabled-looking control; users must be able to advance through donor → NGO → delivery partner → tracking/handoff.
- [x] Refine the responsive mobile experience at phone widths as well as tablet/desktop; preserve readable text, usable touch targets, and the existing lightweight 3D-inspired depth and transitions without sacrificing page load or accessibility.
