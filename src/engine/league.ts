// Perakitan liga: engine dimuat sekali, skuad + jadwal dibangun deterministik.
// Dipakai smoke test hari ini, layar UI + SQLite besok.

import { LEAGUE_SEED, TEAMS } from '../data/teams';
import { createNamePool } from '../data/names';
import { buildFixtures } from './fixtures';
import type { Fixture } from './fixtures';
import { hashSeed, mulberry32 } from './rng';
import { buildSquad } from './squadFactory';
import type { FiksiSquad } from './squadFactory';
import { simLib } from './simLib';
import type { SimLib } from './simLib';
import type { SimSide } from './simulateMatch';

export interface League {
  lib: SimLib;
  squads: FiksiSquad[];
  sides: Map<string, SimSide>;
  fixtures: Fixture[];
}

export async function buildLeague(leagueSeed: string = LEAGUE_SEED): Promise<League> {
  const lib = await simLib();
  const rng = mulberry32(hashSeed(leagueSeed));
  const pool = createNamePool(rng);
  const takeName = (): string => {
    const name = pool.pop();
    if (!name) throw new Error('Pool nama habis');
    return name;
  };
  const squads = TEAMS.map((def) => buildSquad(lib, def, rng, takeName));
  const sides = new Map<string, SimSide>(
    squads.map((squad) => {
      const def = TEAMS.find((t) => t.id === squad.teamId);
      if (!def) throw new Error(`Def tak dikenal: ${squad.teamId}`);
      return [squad.teamId, { def, squad }];
    }),
  );
  const fixtures = buildFixtures(TEAMS.map((t) => t.id), leagueSeed);
  return { lib, squads, sides, fixtures };
}

export function sideOf(league: League, teamId: string): SimSide {
  const side = league.sides.get(teamId);
  if (!side) throw new Error(`Side tak dikenal: ${teamId}`);
  return side;
}
