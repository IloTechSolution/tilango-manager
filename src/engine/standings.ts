// Klasemen + top skor dari hasil laga.
// Tiebreaker: poin -> selisih gol -> gol memasukkan -> nama (H2H menyusul P2).

import type { MatchResult } from './simulateMatch';

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
}

export interface ScorerRow {
  player: string;
  team: string;
  goals: number;
}

export function emptyTable(teamIds: readonly string[]): Map<string, StandingRow> {
  const table = new Map<string, StandingRow>();
  for (const id of teamIds) {
    table.set(id, { teamId: id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, points: 0 });
  }
  return table;
}

export function applyResult(table: Map<string, StandingRow>, r: MatchResult): void {
  const home = table.get(r.homeId);
  const away = table.get(r.awayId);
  if (!home || !away) throw new Error(`Tim tak dikenal di hasil: ${r.homeId} vs ${r.awayId}`);
  home.played += 1;
  away.played += 1;
  home.gf += r.homeGoals;
  home.ga += r.awayGoals;
  away.gf += r.awayGoals;
  away.ga += r.homeGoals;
  home.gd = home.gf - home.ga;
  away.gd = away.gf - away.ga;
  if (r.homeGoals > r.awayGoals) {
    home.won += 1;
    home.points += 3;
    away.lost += 1;
  } else if (r.homeGoals < r.awayGoals) {
    away.won += 1;
    away.points += 3;
    home.lost += 1;
  } else {
    home.drawn += 1;
    away.drawn += 1;
    home.points += 1;
    away.points += 1;
  }
}

export function sortedTable(table: Map<string, StandingRow>): StandingRow[] {
  return [...table.values()].sort(
    (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.teamId.localeCompare(b.teamId),
  );
}

export function buildStandings(teamIds: readonly string[], results: readonly MatchResult[]): StandingRow[] {
  const table = emptyTable(teamIds);
  for (const r of results) applyResult(table, r);
  return sortedTable(table);
}

/** Agregasi pencetak gol dari events bertipe goal yang tersimpan. */
export function topScorers(results: readonly MatchResult[], limit = 10): ScorerRow[] {
  const map = new Map<string, ScorerRow>();
  for (const r of results) {
    for (const e of r.events) {
      if (e.type !== 'goal' || !e.player || !e.team) continue;
      const key = `${e.team}::${e.player}`;
      const row = map.get(key) ?? { player: e.player, team: e.team, goals: 0 };
      row.goals += 1;
      map.set(key, row);
    }
  }
  return [...map.values()].sort((a, b) => b.goals - a.goals || a.player.localeCompare(b.player)).slice(0, limit);
}
