// Generator jadwal double round-robin (metode lingkaran) untuk jumlah tim genap.
// Paruh kedua musim = cermin paruh pertama dengan home/away ditukar.

export interface Fixture {
  week: number;
  homeId: string;
  awayId: string;
  /** Seed deterministik: "leagueSeed:W{week}:{home}v{away}". */
  seed: string;
}

export function buildFixtures(teamIds: readonly string[], leagueSeed: string): Fixture[] {
  if (teamIds.length % 2 !== 0 || teamIds.length < 2) {
    throw new Error('buildFixtures butuh jumlah tim genap >= 2');
  }
  const ids = [...teamIds];
  const rounds: Array<Array<[string, string]>> = [];
  const rotating = ids.slice(1);

  for (let round = 0; round < ids.length - 1; round += 1) {
    const pairs: Array<[string, string]> = [];
    const left = [ids[0] as string, ...rotating.slice(0, ids.length / 2 - 1)];
    const right = [...rotating.slice(ids.length / 2 - 1)].reverse();
    for (let i = 0; i < left.length; i += 1) {
      const home = round % 2 === 0 ? (left[i] as string) : (right[i] as string);
      const away = round % 2 === 0 ? (right[i] as string) : (left[i] as string);
      pairs.push([home, away]);
    }
    rounds.push(pairs);
    rotating.unshift(rotating.pop() as string);
  }

  const fixtures: Fixture[] = [];
  const halfWeeks = rounds.length;
  rounds.forEach((pairs, r) => {
    pairs.forEach(([home, away]) => {
      fixtures.push({
        week: r + 1,
        homeId: home,
        awayId: away,
        seed: `${leagueSeed}:W${r + 1}:${home}v${away}`,
      });
    });
  });
  // Leg kedua: tukar home/away, lanjutkan nomor week.
  rounds.forEach((pairs, r) => {
    pairs.forEach(([home, away]) => {
      fixtures.push({
        week: halfWeeks + r + 1,
        homeId: away,
        awayId: home,
        seed: `${leagueSeed}:W${halfWeeks + r + 1}:${away}v${home}`,
      });
    });
  });
  return fixtures.sort((a, b) => a.week - b.week);
}
