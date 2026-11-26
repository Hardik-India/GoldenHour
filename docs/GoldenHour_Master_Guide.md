# GoldenHour - Complete Master Guide

> Combined document: project specification + every stage prompt + image prompts. Generated from the files in the zip.

---
# GoldenHour - Master Project Specification

> **Tagline:** *When every minute counts, someone nearby can save a life.*
> **Project type:** Social-impact web platform (Google Developer Group vibe-coding challenge)
> **Stack:** Next.js 14 + React + Tailwind (frontend) - Node.js + TypeScript + Express (backend) - MongoDB - Socket.IO
> **Font:** Poppins - **Theme:** cinematic dark, emergency red + golden amber + teal

---

## 1. Overview

GoldenHour is a community emergency-response network that combines **three life-saving systems in one real-time platform**:

1. **Golden Hour Responder** - a one-tap SOS that alerts verified first-aiders nearby, auto-suggests the right hospital, dispatches an ambulance for serious cases and guides the caller through CPR / bleeding control.
2. **Blood Link** - real-time blood request and donor matching by blood group compatibility, distance and donation eligibility, including a rare-group (Bombay / HH) channel.
3. **Ambulance and hospital support** - live ambulance availability and ETA, hospital capability match (trauma, ICU, blood bank, blood stock).

It does **not** replace 112 / 108. It fills the gap *between* the accident and the arrival of professional help.

## 2. The problem (why India needs this)

| Fact | Source |
|---|---|
| 4,87,707 road accidents and **1,77,175 deaths** in 2024 (about **485 deaths a day**, roughly 20 an hour) | MoRTH, *Road Accidents in India 2024* |
| Crash severity rose to **36.3 deaths per 100 accidents** (21.6 in 2005) | MoRTH 2024 report |
| National Highways: 1,50,958 accidents, **64,772 deaths** in 2024 | MoRTH 2024 report |
| **Every fifth road death is a pedestrian**; pedestrians are the second-largest victim group after two-wheeler riders | OpenCity analysis of MoRTH data |
| India has about **11% of global road deaths with about 1% of vehicles** | MoRTH 2024 coverage |
| Government reports a requirement and collection of about **14.6 million units** of blood a year, yet one study found states with **about 46% of the population are effectively "blood deserts"** (0.68 units per 1,000 people within 60 minutes) | MoHFW reply in Parliament; IndiaSpend-reported study |
| About **30% of blood supply still comes from replacement donors** (family and friends found after the need arises) | Blood-supply literature |
| Postpartum haemorrhage is about **30% of maternal deaths** | Outlook India / health literature |
| India's rare donor registry lists **4,000+ screened donors** for rare groups | ORF analysis |

> Note: MoRTH and NCRB publish different 2024 death counts. Quote MoRTH and name it.
> Re-verify every number on the day you present. Numbers change.

**The gap:** victims often wait for help while bystanders do not know what to do, who to call or where blood can be found. GoldenHour turns bystanders into a coordinated first response.

## 3. Users and roles

| Role | Who | Can do |
|---|---|---|
| **Citizen** | Anyone | Raise SOS, follow live help, request blood, read first-aid guides, register as donor |
| **Responder** | Trained first-aider (admin-verified) | Receive nearby alerts, accept / decline, stream live location, mark arrival |
| **Donor** | Any registered citizen | Receive matched blood requests, accept / decline, pause alerts |
| **Hospital** | Hospital desk staff | Update blood stock, manage own ambulances |
| **Admin** | Platform team | Verify responders, review reports, watch live incidents, create hospitals |

## 4. Features

### 4.1 Core (must build)
1. **One-tap SOS** with automatic location, 15-second triage and incident creation.
2. **Responder matching** with MongoDB `2dsphere` geo queries (verified + available + within radius).
3. **Live tracking map** (Leaflet dark tiles): SOS, responders, ambulance, hospital.
4. **Real-time alerts** via Socket.IO (`incident:new`, `incident:update`, `responder:location`, `ambulance:location`, `blood:new`).
5. **Guided first aid** (CPR with 110 BPM metronome, severe bleeding, choking, snakebite, burns, drowning, road accident).
6. **Blood requests** with compatibility-aware donor matching and donation cool-down.
7. **Hospital finder** filtered by trauma level, ICU, blood bank; blood stock chips.
8. **Ambulance dispatch** (auto for high / critical severity, manual by hospital / admin).
9. **Auth + roles** (JWT) and **admin verification** of responders.
10. **Impact dashboard** with charts and anonymised hotspot map.

### 4.2 Differentiators (build for the wow factor)
- **Smart triage** (rule-based severity: conscious? breathing? bleeding? mobility?) that decides auto-dispatch.
- **Hospital capability match**, not just nearest door.
- **Rare blood channel** that widens the search radius 3x for rare groups.
- **Live demo simulator** on the landing page (no login needed).
- **Voice read-aloud** first-aid steps (Web Speech API).
- **Trust and safety:** verification, privacy-first location, rate limits, false-alarm reporting.
- **Low-bandwidth friendly:** text-first screens, small payloads.

### 4.3 Future scope slide
SMS / missed-call fallback, Hindi / Bengali / Tamil locales, AED registry map, official 108 / 112 API integration, crash detection from phone sensors, WhatsApp bot, responder training academy.

## 5. Design system

### 5.1 Colours
| Token | Hex | Use |
|---|---|---|
| `night` | `#0B0F1A` | Page background |
| `night-700` | `#121829` | Cards / panels |
| `alert` | `#FF3B4E` | SOS, urgency, danger |
| `gold` | `#FFB938` | Brand accent, "golden hour", key words |
| `teal` | `#2DD4BF` | Success, safe, hospitals |
| white 60-70% | - | Body text |

Gradients: gold text `#FFD27A -> #FFB938 -> #FF9F1C`; red button `#FF5A6A -> #FF3B4E -> #D41F33`.

### 5.2 Typography
**Poppins** (300 / 400 / 500 / 600 / 700) loaded with `next/font/google`, exposed as `--font-poppins` and Tailwind `font-sans`.
Headlines 600-700, tight leading. Body 400. Labels uppercase 500 with wide tracking.

### 5.3 Components and motion
- Glassmorphism cards: `border-white/10`, `bg-white/4%`, `backdrop-blur-xl`.
- Pulse rings on SOS, ECG heartbeat line, twinkling dotted India, rain overlay, floating phone.
- Scroll reveal (Framer Motion), count-up stats, hover glow per tone.
- Respect `prefers-reduced-motion`.
- Rule: every animation must communicate something (urgency, connection, progress).

## 6. Landing page specification

The landing page is built on the approved hero reference (`docs/reference/landing-hero-reference.png`): a rainy night scene, a golden thread of light connecting a person in need to responders running toward them, India with a red pulse, and a phone with a **live** radar map. The artwork is stored text-free as `frontend/public/images/hero-bg.jpg`; the headline, buttons, phone screen, heartbeat line, ambulance lights and rain are live HTML/SVG layered on it. There are **no stat cards under the hero**.

| # | Section | Content | Wow element |
|---|---|---|---|
| 1 | Navbar | Logo, Home / Features / Impact / FAQs, "Become a Responder" | Floating glass pill, shrinks on scroll |
| 2 | Hero | Headline + 2 CTAs only (no subtitle, no ticks) over the reference artwork | Live radar warped onto the phone screen (ripples, travelling responders, ticking timer), animated heartbeat pulse into India, pulsing city node, flashing ambulance lights, light rain |
| 3 | How it works | SOS -> alert -> help arrives | Connected gradient line, staggered reveal |
| 4 | **Live demo** | Simulated accident | Press a button: responders accept and move, ambulance dispatched, timeline fills |
| 5 | Features bento | 8 tiles | Hover glow, mini animations (CPR beat, ripples) |
| 6 | Blood Link | Request flow, blood groups | Blood drop with orbiting donors, "3 donors found within 2 km" |
| 7 | Impact | Live counters from API | Falls back to labelled sample data |
| 8 | Trust and safety | 4 cards | - |
| 9 | Join CTA | Responder / donor | Glow blobs |
| 10 | FAQ | 6 questions | Smooth accordion |
| 11 | Footer | Emergency numbers, disclaimer | Giant faded "Every minute counts" |

**Copy rules:** minimal text, emotional, never overpromise medically. Always show: *"GoldenHour supports emergency services. It does not replace them."*

## 7. App pages

| Route | Page | Roles |
|---|---|---|
| `/` | Landing | public |
| `/login`, `/register` | Auth | public |
| `/sos` | SOS + triage | citizen+ |
| `/incident/[id]` | Live incident | reporter, assigned responders, admin |
| `/responder` | Responder dashboard | responder, admin |
| `/blood` | Blood Link (request / open / donor) | citizen+ |
| `/hospitals` | Hospitals + ambulances | public |
| `/first-aid`, `/first-aid/[slug]` | Guides | public |
| `/impact` | Stats dashboard | public |
| `/admin` | Verify responders, reports, live incidents | admin |
| `/profile` | Profile, apply as responder | citizen+ |

## 8. Architecture

```
Browser (Next.js, React, Tailwind, Leaflet, Socket.IO client)
   |  REST (axios, Bearer JWT)            |  WebSocket (socket.io)
   v                                      v
Express API (TypeScript) ---------- Socket.IO server
   |  routes -> middleware -> controllers -> services -> models
   v
MongoDB (2dsphere geo indexes)
```

**Request flow for an SOS:** `POST /api/incidents` -> zod validation -> triage util -> `$near` responder query -> hospital + ambulance match -> save incident -> notify each responder (DB notification + socket push) -> return incident to reporter, who joins `incident:<id>` room for live updates.

## 9. Folder structure

```
GoldenHour/
  docs/                      (this documentation + prompts + reference images)
  backend/
    .env  .env.example  package.json  tsconfig.json
    src/
      config/       env.ts, db.ts
      models/       User, Incident, BloodRequest, Hospital, Ambulance, FirstAidGuide, Notification, Report
      controllers/  auth, incident, blood, hospital, ambulance, triage, firstAid, notification, report, stats, admin
      routes/       auth, incident, blood, hospital, ambulance, admin, misc (first-aid, triage, stats, notifications, reports)
      services/     matching.service.ts, notification.service.ts
      middleware/   auth.ts, error.ts, validate.ts, rateLimit.ts
      validators/   schemas.ts (zod)
      sockets/      index.ts
      utils/        geo, jwt, triage, bloodCompat, ApiError, asyncHandler, logger, pagination
      scripts/      seed.ts, guides.data.ts
      app.ts  server.ts
  frontend/
    .env.local  .env.example  package.json  tailwind.config.ts  next.config.mjs
    src/
      app/          layout.tsx, globals.css, page.tsx + route folders
      components/   landing/, ui/, map/, app/
      hooks/        useGeolocation, useSocketEvent, useCountUp
      lib/          api.ts, socket.ts, types.ts, utils.ts, indiaDots.ts
      store/        auth.ts (zustand)
    public/images/  (optional hero-bg.jpg)
```

## 10. Database design (MongoDB / Mongoose)

All geo fields are GeoJSON `Point` as `[lng, lat]` with a `2dsphere` index.

| Collection | Key fields | Indexes |
|---|---|---|
| **users** | name, email (unique), phone, password (bcrypt, select:false), role, language, `location`, `responderProfile{isResponder, verified, available, certifications, incidentsHandled}`, `donorProfile{isDonor, bloodGroup, available, lastDonationAt, donationsCount}`, hospital ref | `2dsphere(location)`, responder flags, donor flags |
| **incidents** | reporter, type, severity, status, `location`, triage{...}, `responders[]{user,status,distanceKm,etaMinutes,...}`, ambulance, hospital, `timeline[]`, firstResponseSec, resolvedAt | `2dsphere`, status+createdAt, reporter, responders.user |
| **bloodrequests** | requester, hospital, patientName, bloodGroup, unitsNeeded, unitsFulfilled, urgency, contactPhone, `location`, status, `matches[]{donor,status,distanceKm}`, expiresAt | `2dsphere`, status+bloodGroup, expiresAt |
| **hospitals** | name, address, phone, `location`, traumaLevel, hasICU, hasBloodBank, open24x7, beds, `bloodStock` (map group -> units) | `2dsphere` |
| **ambulances** | vehicleNumber (unique), type (BLS / ALS / neonatal), operator, status, `location`, hospital, currentIncident | `2dsphere`, status |
| **firstaidguides** | slug, locale, title, category, summary, steps[], warnings[], dontDo[], reviewedBy | unique(slug, locale) |
| **notifications** | user, type, title, body, data, readAt | user+createdAt |
| **reports** | reporter, targetUser, incident, bloodRequest, reason, details, status | - |

**Blood compatibility** (patient -> acceptable donor groups): O- : O- - O+ : O-, O+ - A- : A-, O- - A+ : A-, A+, O-, O+ - B- : B-, O- - B+ : B-, B+, O-, O+ - AB- : AB-, A-, B-, O- - AB+ : all - HH (Bombay) : HH only.

## 11. REST API (prefix `/api`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | - | Health check |
| POST | `/auth/register`, `/auth/login` | - | Create account / sign in |
| GET / PATCH | `/auth/me` | user | Profile, location, availability |
| POST | `/auth/become-donor`, `/auth/become-responder` | user | Upgrade profile |
| POST | `/incidents` | user | **SOS**: create incident and alert responders |
| GET | `/incidents/mine`, `/incidents/:id` | user | History / detail |
| GET | `/incidents/nearby`, `/incidents/active` | responder | Nearby open / my active |
| POST | `/incidents/:id/accept|decline|arrive` | responder | Responder actions |
| POST | `/incidents/:id/resolve|cancel` | reporter / responder / admin | Close |
| POST | `/blood-requests` | user | Create + match donors |
| GET | `/blood-requests/open|mine|alerts` | user | Lists |
| POST | `/blood-requests/:id/respond|donated|cancel` | user | Donor response / confirm donation / cancel |
| GET | `/hospitals/nearby` | - | Hospitals with filters |
| PATCH | `/hospitals/:id/blood-stock` | hospital, admin | Update stock |
| POST | `/hospitals` | admin | Create |
| GET | `/ambulances/nearby` | - | Nearby units |
| PATCH | `/ambulances/:id` | hospital, admin | Status / live position |
| POST | `/ambulances/dispatch/:incidentId` | hospital, admin | Manual dispatch |
| POST | `/triage` | - | Rule-based triage |
| GET | `/first-aid`, `/first-aid/:slug` | - | Guides |
| GET | `/stats/impact`, `/stats/hotspots` | - | Dashboard data |
| GET / POST | `/notifications`, `/notifications/read-all` | user | Notifications |
| POST | `/reports` | user | Report abuse / false alarm |
| GET / PATCH | `/admin/...` | admin | Responders, reports, live incidents |

## 12. Real-time events (Socket.IO)

| Event | Direction | Payload |
|---|---|---|
| `incident:new` | server -> responder | incidentId, type, severity, distanceKm, etaMinutes, lat, lng |
| `incident:update` | server -> incident room + reporter | incidentId, status |
| `responder:location` | client -> server -> incident room | incidentId, lat, lng |
| `ambulance:location` | server -> incident room | ambulanceId, lat, lng |
| `blood:new` | server -> donor | requestId, bloodGroup, units, urgency, distanceKm |
| `notification` | server -> user | id, title, body, data |
| `incident:join` / `incident:leave` | client -> server | incidentId |

Rooms: `user:<id>`, `incident:<id>`, `public:stats`.

## 13. Environment variables

### backend/.env
| Key | Meaning |
|---|---|
| `PORT` (8000), `NODE_ENV`, `CLIENT_URL` (http://localhost:3000) | Server port + CORS origin |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Auth |
| `RESPONDER_RADIUS_KM`, `DONOR_RADIUS_KM`, `AMBULANCE_RADIUS_KM`, `HOSPITAL_RADIUS_KM` | Matching radii |
| `MAX_RESPONDERS_NOTIFIED`, `DONOR_COOLDOWN_DAYS`, `AVG_URBAN_SPEED_KMPH` | Rules / ETA |
| `DEMO_CENTER_LAT`, `DEMO_CENTER_LNG` | Where seed data is generated (set to your city) |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Seed admin |
| `EMERGENCY_NUMBER`, `AMBULANCE_NUMBER` | 112 / 108 |

### frontend/.env.local
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXT_PUBLIC_DEFAULT_LAT`, `NEXT_PUBLIC_DEFAULT_LNG`, `NEXT_PUBLIC_EMERGENCY_NUMBER`, `NEXT_PUBLIC_AMBULANCE_NUMBER`.

> Change `JWT_SECRET` before deploying. Never commit real `.env` files.

## 14. Security, privacy and safety

- Passwords hashed with bcrypt (cost 12); JWT in `Authorization: Bearer`.
- Zod validation on every write; Helmet; CORS locked to `CLIENT_URL`; rate limits (global, auth, SOS).
- Location is shared **only during an active alert** and only with people helping.
- Responders are **admin-verified** before they can receive alerts or toggle availability.
- Blood donors are filtered by compatibility, availability and cool-down. Final eligibility is decided by the blood bank.
- Abuse controls: false-alarm reports, admin review, account disable flag.
- First-aid content must be **reviewed by a medical professional** (field `reviewedBy` is seeded as `PENDING MEDICAL REVIEW`).
- Dispatch is **simulated** in this prototype; production needs an official 108 / 112 integration.
- Show the disclaimer everywhere: *supports emergency services, does not replace them*.

## 15. Testing checklist

1. Register citizen, responder (pending), donor; admin verifies responder.
2. Responder goes available; citizen raises SOS; responder gets live alert; accepts; citizen sees responder on map.
3. Serious triage auto-dispatches an ambulance and suggests a trauma hospital.
4. Resolve incident: ambulance freed, responder count incremented, stats updated.
5. Blood request for `AB+`, `O-` and `HH`: matching donors alerted, rare radius widened, cool-down respected.
6. Donor accepts -> requester notified -> mark donated -> request fulfilled.
7. Hospital user updates blood stock; admin creates hospital.
8. Landing page: demo simulator, count-ups, FAQ, mobile layout, reduced-motion.

## 16. Demo script for judges (3 minutes)

1. **Hook (20 s):** "485 people die on Indian roads every day. Many wait for help while bystanders don't know what to do."
2. **Landing (20 s):** scroll the hero, point at the live radar.
3. **Live demo simulator (40 s):** press *Simulate accident*; narrate alert, accept, ambulance, arrival.
4. **Real flow (60 s):** two browser windows: citizen presses SOS, responder accepts, citizen sees live map; open guided CPR with metronome.
5. **Blood Link (30 s):** request `O-`, donors alerted, accept.
6. **Close (10 s):** impact dashboard + "it supports 112 / 108, it does not replace them."

## 17. Why this can win

- **Real, quantified problem** with cited statistics.
- **Rare angle:** coordinated bystander response + blood in one engine.
- **Looks like a real product:** cinematic design system, live maps, real-time.
- **Real engineering:** geo queries, sockets, roles, validation, seed data, docs.
- **Responsible:** privacy, verification, abuse controls, honest limits.
- **Scalable story:** district pilot -> hospital partnerships -> 108 integration.

## 18. Roadmap

1. MVP (this repo): SOS, matching, live map, blood, hospitals, guides, dashboard.
2. Pilot: one district, partner hospitals and blood banks, responder training days.
3. Integrations: 108 / 112 dispatch API, e-RaktKosh stock, AED registry.
4. Access: SMS / USSD fallback, regional languages, offline PWA.
5. Intelligence: hotspot-based responder pre-positioning, crash detection.


---

# PART 2 - BUILD PROMPTS (one per stage)


---

# 00 - Master Context (paste this FIRST in any AI tool, before every stage prompt)

```
You are a senior full-stack engineer helping me build "GoldenHour", a community emergency-response and blood-donor platform for India. Read the full spec in PROJECT_SPEC.md if I attach it.

PRODUCT
- Tagline: "When every minute counts, someone nearby can save a life."
- Three systems in one: (1) Golden Hour Responder: one-tap SOS that alerts verified first-aiders nearby, suggests a hospital, dispatches an ambulance for serious cases, guides CPR/bleeding control. (2) Blood Link: compatibility-aware blood donor matching with a rare-group (Bombay HH) channel. (3) Ambulance + hospital support.
- It supports 112/108 and never replaces them. Show that disclaimer wherever emergencies are handled.

TECH STACK (fixed)
- Frontend: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Leaflet (react-leaflet, dark CARTO tiles), Recharts, socket.io-client, axios, zustand, lucide-react.
- Backend: Node.js + TypeScript + Express, Mongoose/MongoDB (2dsphere geo indexes), Socket.IO, zod, JWT, bcryptjs, helmet, cors, express-rate-limit.
- Separate folders: /frontend and /backend. Backend folders: config, models, controllers, routes, services, middleware, validators, sockets, utils, scripts.
- Env: backend/.env and frontend/.env.local (+ .env.example).

DESIGN SYSTEM
- Font: Poppins (next/font/google) as --font-poppins.
- Colours: night #0B0F1A, panel #121829, alert red #FF3B4E, gold #FFB938, teal #2DD4BF.
- Style: cinematic dark, glassmorphism cards, glow, pulse rings, ECG heartbeat motifs, minimal text, emotional and trustworthy.
- Reference image for landing page: docs/reference/landing-hero-reference.png (rainy night, golden thread of light between a person in need and running responders, dotted India with red pulses, phone with LIVE radar map).

RULES
- TypeScript strict. No `any` unless unavoidable. Validate all input with zod. Async handlers wrapped for error middleware.
- Never expose password hashes. Never store location of users who are not in an active alert beyond their last known position.
- Accessible (contrast, keyboard, aria labels), responsive, respects prefers-reduced-motion.
- Medical content must be conservative, standard first-aid guidance and flagged for professional review.
- After each stage: list files created/changed, how to run, and how I can verify it works.
```


---

# Stage 1 - Backend foundation

**Goal:** a running Express + TypeScript + MongoDB server with clean structure.

```
[Paste 00_MASTER_CONTEXT first]

TASK: Create the backend foundation in /backend.

1. package.json scripts: dev (ts-node-dev), build (tsc), start, seed, typecheck. Dependencies: express, mongoose, dotenv, cors, helmet, morgan, cookie-parser, express-rate-limit, jsonwebtoken, bcryptjs, zod, socket.io. Dev deps: typescript, ts-node, ts-node-dev and all @types.
2. tsconfig.json: strict, commonjs, outDir dist, rootDir src.
3. .env and .env.example with: NODE_ENV, PORT=8000, CLIENT_URL, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, RESPONDER_RADIUS_KM, DONOR_RADIUS_KM, AMBULANCE_RADIUS_KM, HOSPITAL_RADIUS_KM, MAX_RESPONDERS_NOTIFIED, DONOR_COOLDOWN_DAYS, AVG_URBAN_SPEED_KMPH, DEMO_CENTER_LAT/LNG, SEED_ADMIN_EMAIL/PASSWORD, EMERGENCY_NUMBER, AMBULANCE_NUMBER.
4. src/config/env.ts: load dotenv, fail fast on missing MONGODB_URI/JWT_SECRET, export typed `env`.
5. src/config/db.ts: connectDB().
6. src/utils: ApiError (static helpers), asyncHandler, logger, jwt (sign/verify), geo (toPoint, haversineKm, etaMinutes, nearQuery), pagination.
7. src/middleware: error.ts (notFound + errorHandler handling ZodError, ApiError, duplicate key 11000, CastError), validate.ts (validateBody), rateLimit.ts (api, auth, sos limiters).
8. src/app.ts (helmet, cors to CLIENT_URL, json, morgan in dev, /api router, error handlers) and src/server.ts (http server, connectDB, graceful shutdown).
9. GET /api/health.

ACCEPTANCE: `npm run dev` starts, /api/health returns success JSON, unknown route returns a JSON 404.
```


---

# Stage 2 - Models, auth, roles, admin verification

```
[Paste 00_MASTER_CONTEXT first]

TASK: Implement users, authentication and role-based access.

MODELS (Mongoose, timestamps, GeoJSON Point sub-schema with _id:false):
- User: name, email (unique, lowercase), phone, password (bcrypt cost 12, select:false), role enum citizen|responder|hospital|admin, language, optional location (Point) + locationUpdatedAt, responderProfile {isResponder, verified, available, certifications[], appliedAt, verifiedAt, incidentsHandled}, donorProfile {isDonor, bloodGroup enum A+ A- B+ B- AB+ AB- O+ O- HH, available, lastDonationAt, donationsCount}, hospital ref, isActive. Indexes: 2dsphere(location), responder flags, donor flags.
IMPORTANT: make `location` an OPTIONAL sub-document so users without a location do not break the 2dsphere index.

ENDPOINTS:
- POST /api/auth/register (optionally asResponder -> verified:false, asDonor + bloodGroup), POST /api/auth/login, GET /api/auth/me, PATCH /api/auth/me (name, phone, language, lat/lng, responderAvailable, donorAvailable), POST /api/auth/become-donor, POST /api/auth/become-responder.
- Responders cannot become available until verified.
- Admin: GET /api/admin/responders?status=pending|verified, PATCH /api/admin/responders/:id/verify, PATCH /api/admin/responders/:id/revoke.

MIDDLEWARE: protect (Bearer JWT -> req.user), authorize(...roles), requireVerifiedResponder.
VALIDATION: zod schemas in validators/schemas.ts.

ACCEPTANCE: register -> login -> /me works; unverified responder cannot toggle availability; admin verification unlocks it; wrong role gets 403.
```


---

# Stage 3 - SOS incident engine and geo matching

```
[Paste 00_MASTER_CONTEXT first]

TASK: Build the core SOS engine.

MODELS: Incident (reporter, type enum road_accident|cardiac|bleeding|drowning|snakebite|burn|other, severity low|medium|high|critical, description, address, location Point 2dsphere, triage{conscious,breathing,severeBleeding,chestPain,canMove,trapped}, status open|responder_assigned|on_scene|resolved|cancelled, responders[{user,status notified|accepted|declined|arrived,distanceKm,etaMinutes,notifiedAt,respondedAt,arrivedAt}], ambulance ref, hospital ref, timeline[{at,event}], firstResponseSec, resolvedAt). Notification model.

UTILS: triage.ts (rule-based: not breathing/unconscious => critical + cpr guide; severe bleeding => high; chest pain => high; trapped/cannot move => high; can move => medium; always advise calling 112/108).

SERVICES: matching.service.ts: findNearbyResponders (verified + available + within RESPONDER_RADIUS_KM using $near, exclude reporter, limit MAX_RESPONDERS_NOTIFIED, sorted with distanceKm), findNearestAmbulance, findNearbyHospitals (filters: trauma, icu, bloodBank). notification.service.ts: store + push live via socket.

ENDPOINTS (all protected, SOS rate-limited):
- POST /api/incidents: validate, run triage, find responders, pick nearest suitable hospital, auto-dispatch nearest available ambulance for severity >= high, write timeline, save, notify responders (event "incident:new"), return incident + triage + emergency numbers + disclaimer.
- GET /api/incidents/mine, /nearby (responder), /active (responder), /:id (reporter, assigned responders or admin only).
- POST /api/incidents/:id/accept | decline | arrive (verified responders who were alerted), set firstResponseSec on first accept, notify reporter.
- POST /api/incidents/:id/resolve (reporter, responder on incident, admin): free ambulance, increment incidentsHandled for responders who arrived.
- POST /api/incidents/:id/cancel (reporter only).

ACCEPTANCE: with seeded responders near the demo centre, POST /incidents returns notifiedResponders > 0; accept updates status; resolve frees the ambulance.
```


---

# Stage 4 - Blood Link (requests, donor matching, rare groups)

```
[Paste 00_MASTER_CONTEXT first]

TASK: Implement blood requests and donor matching.

UTIL bloodCompat.ts: BLOOD_GROUPS incl. HH (Bombay); compatibleDonorGroups(patientGroup) with standard red-cell compatibility (O-:[O-], O+:[O-,O+], A-:[A-,O-], A+:[A-,A+,O-,O+], B-:[B-,O-], B+:[B-,B+,O-,O+], AB-:[AB-,A-,B-,O-], AB+:all, HH:[HH]); isRareGroup.

MODEL BloodRequest: requester, hospital?, patientName, bloodGroup, unitsNeeded (1-20), unitsFulfilled, urgency critical|urgent|planned, contactPhone, note, location Point 2dsphere, status open|partially_fulfilled|fulfilled|cancelled|expired, matches[{donor,status notified|accepted|declined|donated,distanceKm,...}], expiresAt.

SERVICE findEligibleDonors: donors available, group compatible, past DONOR_COOLDOWN_DAYS since last donation, within radius ($near). Rare groups search 3x radius.

ENDPOINTS: POST /api/blood-requests (create, match, notify via "blood:new"), GET /open?lat&lng, /mine, /alerts (requests matched to me), POST /:id/respond {accepted|declined} (notify requester on accept), POST /:id/donated {donorId, units} (requester/hospital/admin: update fulfilled units, set lastDonationAt, increment donationsCount), POST /:id/cancel.
Also: a background job in server.ts that marks expired requests every 10 minutes.
Hospital blood stock: PATCH /api/hospitals/:id/blood-stock (hospital staff for own hospital, or admin).

ACCEPTANCE: request for AB+ alerts O-/O+/A/B/AB donors; request for HH alerts only HH donors in a wider radius; donors inside cool-down are skipped; marking donated fulfils the request.
```


---

# Stage 5 - Hospitals and ambulances

```
[Paste 00_MASTER_CONTEXT first]

TASK: Hospitals and ambulance support.

MODELS: Hospital (name, address, city, phone, location 2dsphere, traumaLevel none|basic|advanced, hasICU, hasBloodBank, open24x7, beds{icu,general}, bloodStock Map<string,number>, bloodStockUpdatedAt). Ambulance (vehicleNumber unique, type BLS|ALS|neonatal, operator, phone, status available|dispatched|busy|offline, location 2dsphere, hospital ref, currentIncident ref).

ENDPOINTS: GET /api/hospitals/nearby?lat&lng&trauma=1&icu=1&bloodBank=1 (sorted by distance, returns bloodStock as plain object), GET /api/hospitals/:id, POST /api/hospitals (admin). GET /api/ambulances/nearby?lat&lng (available + dispatched, with distance and ETA), PATCH /api/ambulances/:id (hospital staff for own units/admin: status and live position; stream "ambulance:location" to the incident room), POST /api/ambulances/dispatch/:incidentId (manual dispatch of nearest available unit).

NOTE: dispatch is SIMULATED. Document that production must integrate the official 108/112 dispatch APIs.

ACCEPTANCE: filters work; dispatching marks the ambulance dispatched and adds a timeline event; resolving the incident frees it.
```


---

# Stage 6 - First-aid content, triage endpoint, stats, seed data

```
[Paste 00_MASTER_CONTEXT first]

TASK:
1. FirstAidGuide model (slug, locale, title, category, summary, steps[{order,title,text}], warnings[], dontDo[], reviewedBy). Unique (slug, locale). Endpoints GET /api/first-aid?locale and GET /api/first-aid/:slug (fallback to English).
2. Seed guides (conservative, standard guidance; mark reviewedBy "PENDING MEDICAL REVIEW"): cpr-adult (hands-only, 5 cm, 100-120/min, AED), severe-bleeding, road-accident-first-aid, choking-adult, snakebite (immobilise, no cutting/sucking/tourniquet, go to hospital with anti-snake venom), burns (cool 20 min), drowning.
3. POST /api/triage (public) using the rule-based triage util.
4. Stats: GET /api/stats/impact (incident totals, resolved, average first-response seconds, blood units fulfilled, network counts, incidents by type, last 7 days) and GET /api/stats/hotspots (anonymised ~1 km grid via $round of coordinates).
5. Reports: POST /api/reports; admin list/update.
6. scripts/seed.ts: wipe and create guides, 5 hospitals (varying trauma/ICU/blood), 6 ambulances, admin, hospital user, citizen, 8 verified+available responders within 2.5 km of DEMO_CENTER, 1 pending responder, 16 donors across groups, 1 rare HH donor. Print demo logins.

ACCEPTANCE: `npm run seed` completes; /api/first-aid lists guides; /api/stats/impact responds with zeros-safe values.
```


---

# Stage 7 - Real-time layer (Socket.IO)

```
[Paste 00_MASTER_CONTEXT first]

TASK: Add Socket.IO to the Express HTTP server.

- Auth: read JWT from socket.handshake.auth.token; anonymous sockets allowed but only join public rooms.
- Rooms: user:<id>, incident:<id>, public:stats.
- Client events: incident:join, incident:leave, responder:location {incidentId, lat, lng} (persist to user.location and broadcast to the incident room as responder:location with userId and timestamp).
- Server emits helpers: emitToUser, emitToIncident, emitPublic. Events: incident:new, incident:update, ambulance:location, blood:new, notification, stats:ping.
- Controllers call helpers after state changes; never block the HTTP response on socket failures.

FRONTEND: lib/socket.ts singleton with token auth and resetSocket() on login/logout; hooks/useSocketEvent.ts; AppShell shows toast notifications for incident:new, blood:new, notification.

ACCEPTANCE: two browsers (citizen + responder): SOS shows a toast on the responder instantly; accepting updates the citizen map without refresh.
```


---

# Stage 8 - Frontend foundation and design system

```
[Paste 00_MASTER_CONTEXT first]

TASK: Create the Next.js 14 app in /frontend (App Router, TypeScript, Tailwind).

1. Load Poppins with next/font/google (weights 300-700) as CSS variable --font-poppins; Tailwind fontFamily.sans uses it.
2. tailwind.config.ts: colours night/alert/gold/teal (+ soft/deep), glow box shadows, gradients (gold-text, red-btn, night-glow), keyframes + animations: ripple, float, rain, ecg, twinkle, orbit, shimmer.
3. globals.css: dark body, custom scrollbar, utility classes .glass, .glass-strong, .text-gold-gradient, .container-x, .input, .label, rain layer, ecg path, reduced-motion media query, dark Leaflet polish, gh-beat keyframe.
4. UI primitives: Button (primary/glass/gold/ghost/teal, optional href), GlassCard, Reveal (Framer Motion scroll reveal), SectionHeading, Logo (heartbeat + clock mark), Notice, EmergencyBanner (112/108 disclaimer).
5. lib: api.ts (axios + bearer interceptor + apiError helper), socket.ts, types.ts, utils.ts. store/auth.ts (zustand with init/setSession/refresh/logout). hooks: useGeolocation (fallback to demo centre), useCountUp.
6. .env.local with NEXT_PUBLIC_API_URL, NEXT_PUBLIC_SOCKET_URL, default lat/lng, emergency numbers.

ACCEPTANCE: `npm run dev` renders with Poppins, dark theme and working glass/glow utilities.
```


---

# Stage 9 - Landing page (the wow moment)

Reference: `docs/reference/landing-hero-reference.png`

```
[Paste 00_MASTER_CONTEXT first]

TASK: Build the landing page at src/app/page.tsx so a viewer says "wow" in 3 seconds. Minimal text, emotional, cinematic. Recreate the reference image in CODE with LIVE elements.

HERO (components/landing/Hero.tsx) - built on the reference artwork
- Use frontend/public/images/hero-bg.jpg: the approved reference image with its baked-in nav, headline and buttons removed (text-free). Never put text inside the image.
- Desktop: a fixed 1672x941 design canvas scaled to the viewport width (ResizeObserver + CSS transform) so overlays stay glued to the artwork. Mobile: the artwork as a dimmed cover background with stacked content and a floating phone.
- Headline exactly: "When every minute counts, someone nearby can save a life." with "every minute" in a glowing gold gradient. Two buttons ONLY: red "Try the Live Demo" and glass "Become a Responder". No subtitle, no trust ticks, no stat cards under the hero.
- LIVE phone screen: a SVG radar (components/landing/LiveRadar.tsx) perspective-warped onto the phone in the artwork with a CSS matrix3d computed from the phone screen's four corner points. Radar: street grid, expanding SOS ripples, 4 gold responders travelling along routes (SVG animateMotion), ticking timer chip, ECG, status card.
- Extra live layers on the artwork: red heartbeat line with a travelling white pulse running into India, pulsing red city node, flashing red/blue ambulance lights, glow on the phone spark, a soft top fade under the navbar, and a light animated rain layer.
- Navbar: wide floating glass pill (max 1620px) with Home active in gold with underline.

OTHER SECTIONS (in order)
2. HowItWorks: SOS -> neighbours alerted -> help arrives live; connected gradient line.
3. DemoSimulator (id="demo"): SVG city map; button "Simulate accident"; timeline fills as responders accept and move to the SOS, ambulance dispatches and arrives; timer; replay.
4. FeatureBento: 8 hover-glow tiles (SOS tracking, Guided CPR with beating circle at 110 BPM, Smart triage, Hospital match, Blood Link, Ambulance dispatch, Low bandwidth, Many languages).
5. BloodSpotlight: glowing blood drop with orbiting donor badges and "3 donors found within 2 km" chip; all blood groups incl. Bombay (HH).
6. ImpactPreview: fetch /api/stats/impact, fall back to clearly labelled sample numbers.
7. TrustSafety (4 cards), JoinCTA (glow blobs), Faq (accordion), Footer (112/108, disclaimer, giant faded "Every minute counts").
Navbar: floating glass pill that shrinks on scroll, mobile menu.

QUALITY: 60fps, no layout shift, respects reduced motion, mobile-first, Lighthouse accessibility >= 90, always show the disclaimer "GoldenHour supports emergency services. It does not replace them."

ACCEPTANCE: side by side with the reference image, mood and layout match; the phone map visibly animates; the demo simulator runs end to end without login.
```


---

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


---

# Stage 11 - Testing, security hardening and deployment

```
[Paste 00_MASTER_CONTEXT first]

TASK:
1. Add API tests (Vitest/Jest + supertest + mongodb-memory-server) for: auth, role guards, SOS matching radius, triage severity rules, blood compatibility matrix, donor cool-down, resolve frees ambulance.
2. Unit tests for utils: haversineKm, etaMinutes, compatibleDonorGroups, runTriage.
3. Security review: JWT secret from env, helmet, CORS allow-list, rate limits, zod on all bodies, no password in responses, mongo-sanitize for query operators, request size limit, admin-only routes.
4. Frontend: eslint clean, `next build` passes, Lighthouse (performance, accessibility, SEO), keyboard navigation, aria labels on icon buttons.
5. Deployment: backend on Render/Railway (build: npm run build, start: npm start) with MongoDB Atlas (create 2dsphere indexes by running the app once); frontend on Vercel with NEXT_PUBLIC_API_URL and NEXT_PUBLIC_SOCKET_URL pointing at the backend; set CLIENT_URL on the backend to the Vercel domain; run the seed once on a demo database.
6. README with screenshots, architecture diagram, demo logins and the 3-minute demo script.

ACCEPTANCE: CI passes; production URLs work; two-device live demo succeeds on mobile data.
```


---

# Stage 12 - Pitch, slides and demo polish

```
[Paste 00_MASTER_CONTEXT first]

TASK: Help me prepare the competition submission.
1. A 7-slide deck outline: Problem (cited stats), Insight (bystanders are the missing link), Solution (3 systems, 1 engine), Live demo, Architecture, Impact + safety + ethics, Roadmap and ask.
2. A 3-minute demo script with exact click path and what to say (see PROJECT_SPEC.md section 16).
3. 10 likely judge questions with strong answers (privacy, misuse, verification, liability, how it integrates with 108, scalability, offline, monetisation = none / public good, data protection, why not just a call).
4. A one-line problem statement, one-line solution, and a 30-second elevator pitch.
5. A checklist for the final 24 hours: seed fresh data, test on mobile, backup screen recording, prepared second browser profile for the responder.
```


---

# Stage 13 - Image generation prompts (hero + marketing)

## A. The winning hero (what you generated)
```
Award-winning cinematic website hero design for "GoldenHour", an emergency response and blood donor network in India. Desktop 16:9 UI mockup, Awwwards and Dribbble top-shot quality, ultra-clean, lots of breathing space, very minimal text.
EMOTIONAL CONCEPT: a single glowing golden thread of light connects strangers across the night. A silhouetted everyday person kneels in the rain beside an injured person on a dark city road, lit by distant emergency lights. From his phone, a golden light thread stretches across the scene, connecting to glowing human silhouettes running toward him through the rain.
HEADLINE (left, large, bold geometric sans): "When every minute counts, someone nearby can save a life." with "every minute" in glowing gold. Two buttons: red "Try the Live Demo", glass "Become a Responder".
LIVE PHONE: tilted dark smartphone showing a LIVE radar map mid-animation: red SOS beacon with expanding ripples, golden responder dots travelling along curved routes with comet trails, countdown chip "01:48", heartbeat line on top.
BACKGROUND: dark navy-black (#0B0F1A) fading to deep red; red ECG line becoming the golden thread; dotted India made of glowing lights with pulses; aerial night city with golden pulses travelling along streets toward a red beacon.
Palette: emergency red #FF3B4E, warm gold #FFB938, touches of teal #2DD4BF. Glassmorphism, rim lighting, cinematic depth, 8K.
```

## B. TEXT-FREE background (use this one as /public/images/hero-bg.jpg)
The website draws the headline, buttons, phone and India map in code, so the artwork must be empty on the left and have no phone.
```
Cinematic wide 16:9 night scene for a website hero background, NO text, NO UI, NO phone, NO logos. Rainy Indian city street at night, wet reflective road, distant ambulance with soft red and blue lights on the left edge, a riverside bridge and glowing skyline in the background. In the lower middle, a silhouetted person kneeling by a person lying on the road, a thin glowing golden thread of light rising from their hand and curving across the frame toward three silhouetted people running through the rain. The left 45% of the image is dark and calm with generous empty space for headline text. The right side stays moody and uncluttered. Volumetric haze, rain streaks, bokeh, shallow depth of field, film grain. Palette: deep navy-black, emergency red glow, warm golden light. Respectful, hopeful, not graphic, no visible injuries.
```

## C. Social card / thumbnail
```
Square 1:1 dark poster: giant glowing golden hourglass whose falling sand turns into a heartbeat line and a dotted map of India, red SOS pulse in the centre, text "Every minute counts" in bold geometric sans, small subtitle "GoldenHour". Navy-black background, red and gold glow, premium minimal.
```

## D. App store style phone screens
```
Three smartphone mockups on a dark gradient: (1) SOS screen with a huge pulsing red button, (2) live map with responders converging and an ETA card, (3) blood request with blood group tiles A+, B-, O+, AB+, HH. Dark mode, red, gold and teal accents, glassmorphism, premium and clean.
```

**Negative prompt:** too much text, paragraphs, stat cards, cluttered layout, stock-photo faces, cartoon style, garbled text, bright white background, rainbow colours, gore, blood on people, watermark.


---

# PART 3 - SETUP

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
