# FoodLoop decisions and limitations

## Product boundary

The end-to-end hackathon demo is the priority: donor listing → NGO acceptance → delivery-partner assignment → delivery tracking → confirmed handoff. The backup route is demonstrated with an explicit simulated failure control; the old assignment remains visible in history. Sample activity is intentionally isolated in browser storage so judges can replay it without making writes to the shared managed database.

## Identity and accounts

Real identity uses Manus OAuth because no alternate provider was specified. The app uses the Preview-compatible `webdev_app_session` cookie name and an opaque, hashed server-side session for app-issued logins. Passwords are never collected by FoodLoop; the recovery screen directs people to their identity provider. Demo roles do not count as authenticated sessions.

## Data and security

Managed MySQL is used for real authenticated records through Drizzle and an additive migration. Development and production share this database, so the prototype avoids automatic demo seeding and destructive verification. Active participant access gates precise pickup location and donation activity. Support receives only the current authenticated role and a minimized list of authorized donation name/status/use-by values; the model cannot mutate workflows or certify food safety.

## Visual system

Tactile eco-dashboard with deep forest green, warm cream, citrus lime and restrained coral. Cards and map markers use shallow elevation; the route illustration is labeled as demo/simulated instead of implying live GPS. Motion respects `prefers-reduced-motion`.

## Simulated / not connected

Location, routes, ETA, partner availability, OTP/photo confirmation, external notifications and impact totals are demonstration behavior. AI support uses a real server-side Manus service call only for a signed-in user's submitted question when credentials are available; it can use project credits. Payments and refunds are not implemented. No generated sample impact number is a verified outcome.
