// Pembungkus RealTimeEngine: skuad fiksi + seed -> hasil ringkas siap simpan.
// Prinsip batas (docs/ENGINE.md): simpan skor, events ringkas, seed. Jangan
// simpan instance class / snapshot mentah (terlalu berat untuk SQLite).
//
// Async karena class engine dimuat via simLib() (dynamic import, lihat simLib.ts).

import type { RealTimeMatchEvent } from '@bleckert/football-simulator';
import type { TeamDef } from '../data/teams';
import { commentateOne } from './commentary';
import { hashSeed, mulberry32 } from './rng';
import { simLib } from './simLib';
import type { SimLib } from './simLib';
import { toSimPlayers } from './squadFactory';
import type { FiksiSquad } from './squadFactory';

export interface SimSide {
  def: TeamDef;
  /** Skuad fiksi XI + cadangan dalam urutan match order (11 pertama = starter). */
  squad: FiksiSquad;
}

export interface StoredEvent {
  minute: number;
  type: string;
  team: string | null;
  player: string | null;
  text: string;
}

export interface MatchResult {
  homeId: string;
  awayId: string;
  homeGoals: number;
  awayGoals: number;
  seed: string;
  events: StoredEvent[];
  headline: string;
}

function minuteOf(timeSeconds: number): number {
  return Math.max(1, Math.ceil(timeSeconds / 60));
}

export async function runMatch(home: SimSide, away: SimSide, seed: string, lib?: SimLib): Promise<MatchResult> {
  const sim = lib ?? (await simLib());
  const engine = new sim.RealTimeEngine(
    new sim.Team(true, home.def.name, toSimPlayers(sim, home.squad)),
    new sim.Team(false, away.def.name, toSimPlayers(sim, away.squad)),
    {
      random: mulberry32(hashSeed(seed)),
      homeTactics: home.def.tactics,
      awayTactics: away.def.tactics,
    },
  );
  engine.simulate();

  const raw: RealTimeMatchEvent[] = engine.events;
  const goals = raw.filter((e) => e.type === 'goal');
  const homeGoals = goals.filter((e) => e.teamSide === 'home').length;
  const awayGoals = goals.filter((e) => e.teamSide === 'away').length;

  // Varian redaksi stabil per seed (seed turunan, bukan RNG laga).
  // Teks dipasangkan per event saat iterasi agar tidak salah alamat.
  const flavor = mulberry32(hashSeed(`${seed}:commentary`));
  const events: StoredEvent[] = [];
  for (const e of raw) {
    const text = commentateOne(home.def.name, away.def.name, e, flavor);
    if (text === null) continue;
    events.push({
      minute: minuteOf(e.time),
      type: String(e.type),
      team: e.team?.name ?? e.teamSide ?? null,
      player: e.player?.info.name ?? null,
      text,
    });
  }

  return {
    homeId: home.def.id,
    awayId: away.def.id,
    homeGoals,
    awayGoals,
    seed,
    events,
    headline: `${home.def.name} ${homeGoals}-${awayGoals} ${away.def.name}`,
  };
}
