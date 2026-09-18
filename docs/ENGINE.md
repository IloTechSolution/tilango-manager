# ENGINE — catatan integrasi `@bleckert/football-simulator` v2.0.0

Sumber: `docs/web-manager-integration.md` + `docs/api-reference.md` di referensi lokal
(`C:\Users\ibrah\AppData\Local\Temp\opencode\football-sim`).

## Prinsip batas (penting)
Game (kita) yang memiliki data permanen: klub, pemain, kontrak, jadwal, save, morale,
form, finansial. Simulator hanya **match service**: terima proyeksi data saat matchday,
kembalikan events + laporan. Jangan jadikan class simulator sebagai model database.

## Alur match yang disarankan
1. Load fixture dari SQLite.
2. Pilih XI + cadangan kedua tim (urutan: 11 starter dulu, maks 15 cadangan).
3. Konversi atribut kita (skala 1–20) -> instance `Player` simulator.
4. Konversi taktik -> objek `Tactics` (parsial boleh, sisanya diisi preset style).
5. `new RealTimeEngine(home, away, { random: seededRandom(seed), homeTactics, awayTactics })`
6. `engine.simulate()` -> ambil event log + snapshot terakhir (21.600+ snapshot per
   laga penuh hanya untuk replay; untuk teks cukup events + snapshot final).
7. Proyeksikan events ke plain object ringan (`toStoredEvent`) lalu simpan.
8. Terapkan efek pasca-laga di sistem kita: tabel, caps/gol/kartu/cedera, fatigue,
   morale, finansial.

## Contoh minimal
```ts
import { RealTimeEngine, RealTimeReporter, Team } from '@bleckert/football-simulator';

const engine = new RealTimeEngine(homeTeam, awayTeam, {
  random: seededRandom(982451653), // WAJIB seeded -> deterministik, bisa replay
  homeTactics: { formation: '4-4-2', style: 'high_press', mentality: 'attacking' },
  awayTactics: { formation: '4-3-3', style: 'possession', mentality: 'balanced' },
});
const snapshots = engine.simulate();
const report = new RealTimeReporter(engine).getReport();
```

## Style taktik tersedia
`balanced, possession, direct, counter, low_block, high_press`.
Nilai numerik (press, width, tempo, defensiveLine, compactness) di-clamp 0–100.

## Komentator teks (Indonesia, kita yang buat)
Engine mengembalikan structured events — gaya bahasa bebas. Mapping:
`goal, shot, save, miss, blocked_shot, penalty, offside, red_card, yellow_card,
injury, substitution, tactical_change, half_time, full_time`.
Jangan tampilkan tiap pass; filter hanya high-signal di atas. Lihat contoh
`eventToText()` di `web-manager-integration.md` baris 158–200.

## Live match (ganti taktik saat laga jalan)
Jangan `simulate()` sampai tuntas dulu. Pakai `engine.start()` + `tick()` per slice,
lalu `applyTacticalChange(side, taktik, reason)` / `applyRoleChange(playerId, pos, reason)`.

## Replay 2D (Fase 2)
Snapshot berisi koordinat meter lapangan 105x68 (x: gawang ke gawang, y: touchline).
Konversi ke persen untuk SVG: `x/105*100`, `y/68*100`. Untuk hemat storage, simpan
hanya jendela replay sekitar gol (`replayWindow` atau ±12 dtk / +4 dtk).

## Yang disimpan per laga
Skor akhir, event ringkas, headline + section laporan, stat pilihan, **match seed**,
opsional snapshot sampled. Simpan seed -> laga bisa direproduksi persis.

## Aturan main
- Official sim untuk career: jalan di device (offline-first, tidak ada server).
  Catatan upstream menyarankan server-side anti-tamper; untuk kita offline,
  determinisme seeded + validasi hash cukup untuk P1.
- Jangan simpan instance class mentah (`RealTimeMatchEvent` membawa referensi
  `Team`/`Player` — terlalu berat untuk baris SQLite).
