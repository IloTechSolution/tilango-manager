# VISION — Tilango-manager

## Apa ini
Manager sim sepak bola mobile portrait, offline-first, database fiksi Indonesia-style.
Pemain berperan sebagai manajer: atur taktik, squad, transfer, training, baca inbox, simulate match.

## Bukan apa
- Bukan FC 25 / PES action 3D (di luar scope Expo Go + tim kecil).
- Bukan clone data asli. Semua klub/pemain fiksi agar aman Play Store + GPL.
- Tidak butuh internet untuk main career.

## Core loop
1. Lihat jadwal + inbox
2. Atur taktik (3 formasi MVP) + pilih XI
3. Simulate match -> komentar teks + skor + tabel update
4. Kelola stamina/morale/cedera + transfer sederhana
5. Ulangi 14 week hingga juara

## MVP (P1)
- 1 liga, 8 tim fiksi, tiap tim 18 pemain (144 total)
- Engine deterministik seeded, 90 menit -> events
- Tabel + top skor + save SQLite 1 slot
- Portrait only, 30fps di HP low-end

## Depth (P2+)
- Transfer FSM, training, scouting, berita generator
- Visual 2D dots SVG, xG sederhana, EAS Build AAB

## Prinsip engine (dari openengine)
"don't fake output" — skor konsisten dari atribut + taktik + home advantage + morale/fatigue, bukan random murni.

## Open-source
GPL-3.0. Kontribusi via PR kecil per sesi. Tiap sesi: 1 fitur + test determinisme + coba scan Expo Go.
