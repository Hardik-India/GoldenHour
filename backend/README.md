# GoldenHour Backend (Node.js + TypeScript + Express + MongoDB)

## Run
```bash
npm install
# make sure MongoDB is running (local) or put an Atlas URI in .env
npm run seed     # demo data + demo logins
npm run dev      # http://localhost:8000/api/health
npm run build && npm start
```

## Structure
```
src/
  config/       env + database connection
  models/       Mongoose models (User, Incident, BloodRequest, Hospital, Ambulance, FirstAidGuide, Notification, Report)
  controllers/  request handlers (business logic entry points)
  routes/       express routers, one file per domain
  services/     matching (geo queries) + notifications
  middleware/   auth, roles, validation, rate limits, errors
  validators/   zod schemas
  sockets/      socket.io realtime layer
  utils/        geo, jwt, triage, blood compatibility, errors
  scripts/      seed + first-aid data
```

Edit `.env` to change matching radii, demo city coordinates and secrets.
