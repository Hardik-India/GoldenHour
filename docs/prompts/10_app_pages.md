# Stage 10 - Application pages

```
[Paste 00_MASTER_CONTEXT first]

TASK: Build the authenticated app. Shared AppShell (sticky header, role-aware nav, logout, live toasts, auth guard with optional roles) and a Leaflet map wrapper (dynamic import, ssr:false, dark CARTO tiles, divIcon markers: sos pulsing red, responder gold, ambulance white, hospital teal, me blue).

PAGES
- /login, /register (?role=responder|donor): responder certifications, donor blood group.
- /sos: giant pulsing SOS button, call 112/108 buttons, 15-second triage form (type + yes/no questions + landmark), location with refresh + demo fallback, sends POST /incidents then routes to /incident/:id.
- /incident/[id]: live map (sos, accepted responders with live positions, ambulance, hospital), status + severity, responder list with ETA, ambulance + hospital cards, timeline, quick links to Guided CPR / Bleeding, actions (accept, arrived, resolve, cancel). Join the socket room and also poll every 10 s as a backup.
- /responder: availability toggle, incoming alert cards (accept / decline), active responses, keep server location fresh, stream position via socket while on an incident.
- /blood: tabs Request / Open requests / My donor profile. Request form with blood group (incl. HH), units, urgency, phone; donors matched message; donor profile register/pause; matched requests with accept/decline.
- /hospitals: filter chips (trauma, ICU, blood bank), map + hospital cards with blood-stock chips, ambulance list with ETA.
- /first-aid and /first-aid/[slug]: guide cards; step list; CPR page shows a 110 BPM audio+visual metronome; "Read aloud" with Web Speech API; do/don't boxes.
- /impact: Recharts (line last 7 days, pie by type, bar network) + hotspot map, auto-refresh.
- /admin: verify responders, live incidents, review reports.
- /profile: edit details, apply as responder.

ACCEPTANCE: full flow works end to end with seeded data (see docs/PROJECT_SPEC.md testing checklist).
```
