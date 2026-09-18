# Tilango-manager

Game simulasi football manager — fiksi, offline-first, open-source (GPL-3.0).
Terinspirasi Football Manager, dibangun dengan Expo + TypeScript agar bisa scan QR via Expo Go.

## Status
P1 — engine + data fiksi + simulasi semusim terverifikasi. Lihat `VISION.md` untuk arah, `docs/` untuk referensi engine.

## Quickstart
```bash
npm install
npx expo start
# scan QR dengan Expo Go (satu WiFi)
```

## Verifikasi engine (tanpa HP)
```bash
npm run sim:smoke
# Membangun 8 tim fiksi x 18 pemain -> 56 laga double round-robin ->
# validasi determinisme, konsistensi poin, urutan tabel, top skor.
# Lihat docs/CALIBRATION.md untuk karakter scoring engine.
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
