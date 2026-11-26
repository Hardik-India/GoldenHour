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
