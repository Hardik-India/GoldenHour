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
