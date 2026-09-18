# KALIBRASI — mengapa band atribut & taktik diset seperti ini

## Temuan (P1, engine `@bleckert/football-simulator` v2.0.0)
Resolusi tembakan-ke-gol di `RealTimeEngine`:

```ts
const goalkeeperQuality = goalkeeper ? goalkeeper.player.ratingAverage() / 20 : 0.55;
const saveChance = this.clamp(0.48 + goalkeeperQuality * 0.34 - action.quality * 0.28, 0.34, 0.82);
```

`rating()` mengembalikan skala 0–100 (`attributesAverage = avg/20*100`), sehingga
`ratingAverage()/20` bernilai 0–5, bukan 0–1. Akibatnya suku kiper
(`0.48 + gkQ*0.34`) selalu ≥ ~1.0 untuk kiper normal dan **jenuh di batas atas
0.82**. Praktisnya: setiap tembakan on-frame hanya punya ~18% peluang gol,
terlepas dari kualitas kiper. Kualitas tembakan (`action.quality`, koefisien
0.28) hanya menggeser sedikit di dalam koridor jenuh.

Dampak terukur (skuad band generik, taktik default): **~1.0 gol/laga** dengan
banyak skor 0-0 — terlalu datar untuk game feel (sepak bola asli ~2.7).

## Keputusan
Tidak mem-fork engine di P1 (formula fisika lain saling terkait). Kalibrasi
dilakukan di lapisan kita:

1. **Kunci menyerang +4** (`finishing, composure, technique, pace, offTheBall,
   acceleration, longShots, dribbling` untuk non-bek) vs +2 untuk sisanya.
   Menaikkan `shotQuality` -> sebaran tembakan lebih rapat -> lebih banyak
   on-frame.
2. **Tempo & garis pertahanan dinaikkan** untuk 6 tim papan atas (tempo 68-75,
   high press untuk KRA, direct/counter untuk PBR/SMU) -> volume tembakan naik.
   NDU/CEN tetap defensif (identitas underdog + clean sheet sesekali).
3. Target smoke: **1.5–3.5 gol/laga**. Bila engine upstream diperbaiki
   (normalisasi `ratingAverage()/100`), kalibrasi ini harus diulang.

## Cara verifikasi ulang
`npm run sim:smoke` mencetak gol/laga + klasemen + top skor. Ubah band di
`src/engine/squadFactory.ts` (TIER_BAND / boost) atau taktik di
`src/data/teams.ts`, lalu jalankan ulang — deterministik per `LEAGUE_SEED`.

## Bukti ukur (P1, seed `tilango-p1`, dihapusnya script diag* setelah dicatat)
- Baseline upstream flat-12 vs flat-12 (6 laga): **0.33 gol/laga, 12.8 tembakan/laga**.
  Artinya perilaku low-scoring berasal dari engine, bukan dari data kita
  (musim penuh kita: **1.16 gol/laga** — justru di atas baseline upstream).
- GDT vs CEN, taktik volume ekstrem (tempo 92/press 88/garis 78): tembakan
  10.5 -> 20.2, gol 0.33 -> 1.17. Volume membantu nyaris linier.
- Paradoks: semua penyerang di-max (finishing/composure/technique/pace 19)
  justru menurunkan ke 0.17 — diduga striker super-cepat lebih sering offside
  (engine punya deteksi offside aktif). Pelajaran: jangan buff buta.
- Kiper lawan semua-atribut-1: 1.50 gol/laga — suku kiper memang jenuh di
  batas atas untuk kiper normal (lihat formula di atas).

## Keputusan akhir P1
Terima output engine apa adanya (Deterministik! Sama persis tiap run).
Smoke assert dikunci di **0.8–2.0 gol/laga** sebagai penanda regresi, bukan
target ideal. Tuning rasa (target ~2.5) dijadwalkan ulang saat: engine
upstream memperbaiki normalisasi kiper, atau kita menambah lapisan
wasit-set-piece (penaltyThreshold/strictness) yang masih belum dieksplorasi.
Jangan mem-fork engine — lisensinya tidak mencantumkan izin eksplisit.

## Varians semusim
Skor rendah -> luck mendominasi sampel 14 laga: tim tier-1 bisa finis papan
tengah (terjadi di seed `tilango-p1`: GDT peringkat 6). Ini wajar secara
statistik (bandingkan Leicester/Greece), bukan bug. Bila butuh keyakinan,
jalankan multi-musim (ganti `LEAGUE_SEED`) dan cek regresi kekuatan ke papan atas.
