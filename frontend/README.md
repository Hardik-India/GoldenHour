# GoldenHour Frontend (Next.js 14 + React + Tailwind + Poppins)

```bash
npm install
npm run dev        # http://localhost:3000
```
Runs on **http://localhost:3000**. Requires the backend on **http://localhost:8000** (set in `.env.local`) (`NEXT_PUBLIC_API_URL`).

## Routes
| Route | Purpose |
|---|---|
| `/` | Cinematic landing page (hero, live demo simulator, features, Blood Link, impact, FAQ) |
| `/login`, `/register` | Auth (responder / donor sign-up options) |
| `/sos` | SOS button + 15 second triage |
| `/incident/[id]` | Live tracking map, timeline, responders, ambulance, hospital |
| `/responder` | Availability, incoming alerts, active responses (live location streaming) |
| `/blood` | Request blood, open requests, donor profile and alerts |
| `/hospitals` | Nearby hospitals (trauma/ICU/blood stock) + ambulances |
| `/first-aid`, `/first-aid/[slug]` | Guides with CPR metronome and read-aloud |
| `/impact` | Public stats dashboard + hotspot map |
| `/admin` | Verify responders, reports, live incidents |
| `/profile` | Edit profile, apply as responder |

## Hero artwork
The hero is built in code (live SVG radar, dotted India, rain, skyline). For extra cinematic depth, generate a
TEXT-FREE version of your hero image (see `docs/prompts/13_image_prompts.md`) and save it as
`public/images/hero-bg.jpg`. It is layered behind the live elements automatically.
