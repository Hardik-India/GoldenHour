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
