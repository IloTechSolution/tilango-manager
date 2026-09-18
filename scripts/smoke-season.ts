// Smoke test P1: bangun liga fiksi -> simulasi 1 musim penuh -> validasi.
// Jalankan: npm run sim:smoke
// Keluar non-zero (throw) bila ada invariansi yang rusak.

import { LEAGUE_NAME, LEAGUE_SEED, TEAMS } from '../src/data/teams';
import { buildLeague, sideOf } from '../src/engine/league';
import { runMatch } from '../src/engine/simulateMatch';
import type { MatchResult } from '../src/engine/simulateMatch';
import { squadOverall } from '../src/engine/squadFactory';
import { buildStandings, topScorers } from '../src/engine/standings';

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`SMOKE GAGAL: ${msg}`);
  console.log(`  ok - ${msg}`);
}

async function main(): Promise<void> {
  const teamById = new Map(TEAMS.map((t) => [t.id, t]));

  // 1. Liga ------------------------------------------------------------------
  console.log(`\n== ${LEAGUE_NAME} (seed "${LEAGUE_SEED}") ==`);
  const league = await buildLeague();
  const { fixtures } = league;

  console.log('\n-- Overall XI per tim (cek tier) --');
  for (const s of league.squads) {
    const def = teamById.get(s.teamId);
    console.log(`  ${def?.short} tier-${def?.tier} ${def?.name}: ${squadOverall(s)}`);
  }
  const overallByTier = (tier: number): number[] =>
    league.squads.filter((s) => teamById.get(s.teamId)?.tier === tier).map(squadOverall);
  const avg = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length;
  assert(avg(overallByTier(1)) > avg(overallByTier(2)), 'tier-1 lebih kuat dari tier-2');
  assert(avg(overallByTier(2)) > avg(overallByTier(3)), 'tier-2 lebih kuat dari tier-3');

  // 2. Jadwal ------------------------------------------------------------------
  assert(fixtures.length === 56, `56 laga terjadwal (dapat ${fixtures.length})`);
  assert(new Set(fixtures.map((f) => f.week)).size === 14, '14 pekan');
  for (const t of TEAMS) {
    const n = fixtures.filter((f) => f.homeId === t.id || f.awayId === t.id).length;
    assert(n === 14, `${t.short} main 14x (dapat ${n})`);
  }

  // 3. Determinisme ------------------------------------------------------------
  const first = fixtures[0];
  if (!first) throw new Error('Tidak ada fixture');
  const runA = await runMatch(sideOf(league, first.homeId), sideOf(league, first.awayId), first.seed, league.lib);
  const runB = await runMatch(sideOf(league, first.homeId), sideOf(league, first.awayId), first.seed, league.lib);
  assert(
    JSON.stringify(runA) === JSON.stringify(runB),
    'seed sama -> hasil identik (skor + events)',
  );
  console.log(`  contoh: ${runA.headline} [seed ${runA.seed}]`);

  // 4. Musim penuh ---------------------------------------------------------------
  console.log('\n-- Simulasi musim --');
  const results: MatchResult[] = [];
  for (let week = 1; week <= 14; week += 1) {
    const weekFix = fixtures.filter((f) => f.week === week);
    for (const f of weekFix) {
      results.push(await runMatch(sideOf(league, f.homeId), sideOf(league, f.awayId), f.seed, league.lib));
    }
    if (week % 7 === 0 || week === 14) console.log(`  pekan ${week} selesai (${results.length} laga)`);
  }
  assert(results.length === 56, '56 hasil terkumpul');

  // 5. Validasi statistik ----------------------------------------------------------
  const totalGoals = results.reduce((a, r) => a + r.homeGoals + r.awayGoals, 0);
  const gpm = totalGoals / results.length;
  console.log(`\n  total gol: ${totalGoals} (${gpm.toFixed(2)}/laga)`);
  assert(gpm >= 0.8 && gpm <= 2.0, `gol/laga sesuai karakter engine 0.8-2.0 (dapat ${gpm.toFixed(2)}) — lihat docs/CALIBRATION.md`);

  const table = buildStandings(TEAMS.map((t) => t.id), results);
  for (const row of table) {
    assert(row.played === 14, `${row.teamId} played=14`);
    assert(row.points === row.won * 3 + row.drawn, `${row.teamId} poin konsisten`);
    assert(row.gd === row.gf - row.ga, `${row.teamId} selisih gol konsisten`);
  }
  for (let i = 1; i < table.length; i += 1) {
    const prev = table[i - 1];
    const cur = table[i];
    if (!prev || !cur) throw new Error('Baris tabel hilang');
    const ordered =
      prev.points > cur.points ||
      (prev.points === cur.points && (prev.gd > cur.gd || (prev.gd === cur.gd && prev.gf >= cur.gf)));
    assert(ordered, `urutan tabel benar di peringkat ${i + 1}`);
  }

  // 6. Laporan ----------------------------------------------------------------------
  console.log('\n== Klasemen akhir ==');
  console.log('  #  TIM                 M  Mng Srh Klh  GF:GA  Poin');
  table.forEach((r, i) => {
    const def = teamById.get(r.teamId);
    const name = (def?.name ?? r.teamId).padEnd(18, ' ');
    console.log(
      `  ${String(i + 1).padStart(2, ' ')} ${name} ${String(r.played).padStart(2, ' ')}  ` +
        `${String(r.won).padStart(3, ' ')} ${String(r.drawn).padStart(3, ' ')} ${String(r.lost).padStart(3, ' ')}  ` +
        `${String(r.gf).padStart(3, ' ')}:${String(r.ga).padStart(3, ' ')}  ${String(r.points).padStart(4, ' ')}`,
    );
  });

  console.log('\n== Top skor ==');
  for (const s of topScorers(results, 5)) {
    console.log(`  ${s.goals} gol - ${s.player} (${s.team})`);
  }

  const featured = results.find((r) => r.homeId === 'gdt') ?? results[0];
  if (!featured) throw new Error('Tidak ada laga unggulan');
  console.log(`\n== Laga unggulan: ${featured.headline} ==`);
  featured.events.slice(0, 14).forEach((e) => console.log(`  ${e.text}`));
  if (featured.events.length > 14) console.log(`  ... (+${featured.events.length - 14} events)`);

  console.log('\nSMOKE LOLOS: engine + data fiksi + klasemen valid.\n');
}

main().catch((err) => {
  console.error(err);
  throw err;
});
