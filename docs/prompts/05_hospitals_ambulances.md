# Stage 5 - Hospitals and ambulances

```
[Paste 00_MASTER_CONTEXT first]

TASK: Hospitals and ambulance support.

MODELS: Hospital (name, address, city, phone, location 2dsphere, traumaLevel none|basic|advanced, hasICU, hasBloodBank, open24x7, beds{icu,general}, bloodStock Map<string,number>, bloodStockUpdatedAt). Ambulance (vehicleNumber unique, type BLS|ALS|neonatal, operator, phone, status available|dispatched|busy|offline, location 2dsphere, hospital ref, currentIncident ref).

ENDPOINTS: GET /api/hospitals/nearby?lat&lng&trauma=1&icu=1&bloodBank=1 (sorted by distance, returns bloodStock as plain object), GET /api/hospitals/:id, POST /api/hospitals (admin). GET /api/ambulances/nearby?lat&lng (available + dispatched, with distance and ETA), PATCH /api/ambulances/:id (hospital staff for own units/admin: status and live position; stream "ambulance:location" to the incident room), POST /api/ambulances/dispatch/:incidentId (manual dispatch of nearest available unit).

NOTE: dispatch is SIMULATED. Document that production must integrate the official 108/112 dispatch APIs.

ACCEPTANCE: filters work; dispatching marks the ambulance dispatched and adds a timeline event; resolving the incident frees it.
```
