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
