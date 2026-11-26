# GoldenHour

> **When every minute counts, someone nearby can save a life.**

A community emergency-response and blood-donor platform for India: one-tap SOS, verified first-aiders alerted nearby,
live tracking map, ambulance and hospital support, guided CPR, and compatibility-aware blood donor matching.

## What is in this zip

```
GoldenHour/
  README.md                      <- you are here
  docs/
    PROJECT_SPEC.md              <- master document: problem, stats, features, theme, pages, DB, API, env, demo script
    prompts/                     <- a ready-to-paste AI prompt for EVERY build stage (00 to 13)
    reference/                   <- the approved landing page images
  backend/                       <- Node.js + TypeScript + Express + MongoDB + Socket.IO
  frontend/                      <- Next.js 14 + React + Tailwind + Poppins
```

## Quick start (about 5 minutes)

**Prerequisites:** Node.js 18+ and MongoDB (local `mongod` or a free MongoDB Atlas URI).

```bash
# 1) Backend
cd backend
npm install
# edit .env if needed (MONGODB_URI, DEMO_CENTER_LAT/LNG = your city so seeded responders are near you)
npm run seed        # demo hospitals, ambulances, responders, donors, first-aid guides
npm run dev         # http://localhost:8000/api/health

# 2) Frontend (new terminal)
cd frontend
npm install
# edit .env.local to match the same DEMO center
npm run dev         # http://localhost:3000
```

### Demo logins (created by `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@goldenhour.app | Admin@12345 |
| Citizen | citizen@goldenhour.app | Citizen@12345 |
| Responder (verified) | responder1@goldenhour.app | Responder@12345 |
| Responder (pending) | pending@goldenhour.app | Responder@12345 |
| Donor | donor1@goldenhour.app | Donor@12345 |
| Hospital desk | hospital@goldenhour.app | Hospital@12345 |

### Two-browser live demo
1. Window A: log in as `responder1`, open **/responder**, click **Go available** (allow location, or it uses the demo centre).
2. Window B: log in as `citizen`, open **/sos**, press **SOS**, answer triage, send.
3. Window A shows a live alert toast; accept it. Window B's live map shows the responder moving in.

## Honest notes
- This build was written and syntax-checked in an environment **without network access**, so `npm install` and
  `npm run build` were **not** executed. Run `npm run typecheck` in each folder after installing; fix any small type
  nits the compiler reports (they are usually one-liners).
- Ambulance dispatch is **simulated**. Production needs an official 108 / 112 integration.
- First-aid content is standard lay guidance but is seeded as `PENDING MEDICAL REVIEW`. Get it reviewed before public use.
- Re-verify every statistic in `docs/PROJECT_SPEC.md` on the day you present.
- Change `JWT_SECRET` before deploying. Do not commit real `.env` files.

## Landing page
The hero uses your approved reference artwork (`frontend/public/images/hero-bg.jpg`, text-free) with **live** layers on
top: the headline and buttons, a live radar warped onto the phone screen, an animated heartbeat line into India, pulsing
city node, flashing ambulance lights and light rain. The reference itself is in `docs/reference/`.

## Build it again with AI, stage by stage
Open `docs/prompts/` and paste `00_MASTER_CONTEXT.md` followed by each stage prompt in order.
