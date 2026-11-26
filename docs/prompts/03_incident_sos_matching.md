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
