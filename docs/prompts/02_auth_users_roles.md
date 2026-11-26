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
