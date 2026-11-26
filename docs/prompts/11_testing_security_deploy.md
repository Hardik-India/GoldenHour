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
