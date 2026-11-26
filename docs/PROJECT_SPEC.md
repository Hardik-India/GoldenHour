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
