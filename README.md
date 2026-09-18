# Tilango-manager

Game simulasi football manager — fiksi, offline-first, open-source (GPL-3.0).
Terinspirasi Football Manager, dibangun dengan Expo + TypeScript agar bisa scan QR via Expo Go.

## Status
P0 — setup awal. Lihat `VISION.md` untuk arah, `docs/` untuk referensi engine.

## Quickstart (akan aktif setelah init Expo)
```bash
npm install
npx expo start
# scan QR dengan Expo Go (satu WiFi)
```

## Struktur rencana
```
app/(tabs)/ dashboard, squad, tactics, match, transfer, inbox
src/engine/ ratings, matchEngine, fixtures, names (fiksi)
src/data/ league.fiksi.json, teams.fiksi.json
src/db/ schema.ts, seed.ts (expo-sqlite + drizzle)
assets/badges/, assets/kits/
docs/ENGINE.md, docs/DATA.md
refs/ (clone read-only, tidak di-ship)
```

## Referensi
- Engine: https://github.com/tbleckert/football-simulator (TS)
- Fitur/UI: https://github.com/openfootmanager/openfootmanager (GPL-3.0, Rust+Tauri+React)
- Fisika/mod JSON: https://github.com/DeltaBitsSystem/FootballEngine (GPL-3.0, F#)
- Data live (desain saja, tidak di-ship): API-Football, football-data.org, TheSportsDB

## Lisensi
GPL-3.0 — lihat `LICENSE`.
Database 100% fiksi. Jangan pakai nama klub/pemain, logo, atau foto asli tanpa izin.
