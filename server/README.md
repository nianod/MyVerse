# MyVerse API

Copy `.env.example` to `.env`, set a MongoDB connection string and a long random `JWT_SECRET`, then run `npm install` and `npm run dev`.

The API uses HTTP-only, SameSite cookies for browser sessions. Set `COOKIE_SECURE=true` behind HTTPS and `CLIENT_ORIGIN` to the hosted Expo web origin. Native clients may send a short-lived `Authorization: Bearer` token only through a platform-secure transport; no token is persisted in the Expo app.

Song creation stores a `pending` record only. `src/services/generation.js` is the explicit trusted-worker integration boundary for future audio, artwork, and lyric results; public routes cannot mark a song completed.
