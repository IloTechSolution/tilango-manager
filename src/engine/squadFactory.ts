// Pabrik skuad fiksi: 18 pemain per tim (XI sesuai formasi + 7 cadangan).
// Atribut skala 1-20 (mengikuti engine), band per tier + penekanan per peran.
// Urutan players dipertahankan: 11 pertama = starter (kontrak engine),
// 7 berikutnya = cadangan. Jangan ubah urutan ini.

import type { PlayerAttributes, Position } from '@bleckert/football-simulator';
import type { TeamDef, Tier } from '../data/teams';
import { int } from './rng';
import type { Rng } from './rng';
import type { SimLib } from './simLib';

export interface FiksiPlayer {
  id: string;
  name: string;
  number: number;
  age: number;
  position: Position;
  height: number;
  weight: number;
  attributes: PlayerAttributes;
  /** Rata-rata atribut kunci peran (display 1-20). */
  overall: number;
}

export interface FiksiSquad {
  teamId: string;
  players: FiksiPlayer[];
}

// Band atribut [min, max] per tier.
const TIER_BAND: Record<Tier, [number, number]> = {
  1: [12, 17],
  2: [9, 15],
  3: [6, 12],
};

// Template XI per formasi sebagai NAMA posisi (dipetakan ke enum engine via lib
// saat runtime — lihat pos()). Cadangan generik 7 pemain.
// Template XI per formasi yang dipakai liga.
const XI_TEMPLATES: Record<string, string[]> = {
  '4-4-2': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LM', 'LCM', 'RCM', 'RM', 'LF', 'RF'],
  '4-3-3': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LCM', 'CM', 'RCM', 'LF', 'ST', 'RF'],
  '4-2-3-1': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LDM', 'RDM', 'LM', 'COM', 'RM', 'ST'],
  '3-5-2': ['GK', 'LCB', 'CB', 'RCB', 'LM', 'LCM', 'CM', 'RCM', 'RM', 'LF', 'RF'],
  '5-3-2': ['GK', 'LWB', 'LCB', 'CB', 'RCB', 'RWB', 'LCM', 'CM', 'RCM', 'LF', 'RF'],
  '4-5-1': ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LM', 'LCM', 'CM', 'RCM', 'RM', 'ST'],
};

const SUB_POSITIONS: string[] = ['GK', 'CB', 'RB', 'CM', 'RM', 'CF', 'RW'];

/** Petakan nama posisi -> enum engine, dengan validasi. */
function toPosition(lib: SimLib, name: string): Position {
  const value = (lib.Position as unknown as Record<string, Position>)[name];
  if (value === undefined) throw new Error(`Posisi tak dikenal: ${name}`);
  return value;
}

const MENTAL_KEYS = [
  'aggression', 'anticipation', 'bravery', 'composure', 'concentration',
  'decisions', 'determination', 'flair', 'leadership', 'offTheBall',
  'positioning', 'teamwork', 'vision', 'workRate',
] as const;

const PHYSICAL_KEYS = [
  'acceleration', 'agility', 'balance', 'jumpingReach',
  'naturalFitness', 'pace', 'stamina', 'strength',
] as const;

const TECHNICAL_KEYS = [
  'corners', 'crossing', 'dribbling', 'finishing', 'firstTouch',
  'freeKickTaking', 'heading', 'longShots', 'longThrows', 'marking',
  'passing', 'penaltyTaking', 'tackling', 'technique',
] as const;

const GK_KEYS = [
  'aerialReach', 'commandOfArea', 'communication', 'eccentricity',
  'handling', 'oneOnOnes', 'reflexes', 'rushingOut',
  'tendencyToPunch', 'throwing',
] as const;

type AttrKey = keyof PlayerAttributes;

const DEFENDER_NAMES = new Set(['LB', 'LCB', 'CB', 'RCB', 'RB', 'LWB', 'RWB', 'LDM', 'DM', 'RDM']);
const MIDFIELDER_NAMES = new Set(['LM', 'LCM', 'CM', 'RCM', 'RM', 'LCOM', 'COM', 'RCOM']);

function isDefender(pos: Position, lib: SimLib): boolean {
  return DEFENDER_NAMES.has(positionName(lib, pos));
}

function isMidfielder(pos: Position, lib: SimLib): boolean {
  return MIDFIELDER_NAMES.has(positionName(lib, pos));
}

/** Nama enum dari nilai Position (reverse mapping). */
function positionName(lib: SimLib, pos: Position): string {
  const entries = Object.entries(lib.Position as unknown as Record<string, Position>);
  const found = entries.find(([, v]) => v === pos);
  if (!found) throw new Error(`Nilai posisi tak dikenal: ${pos}`);
  return found[0];
}

/** Atribut kunci per peran untuk overall + diferensiasi. */
function keyAttributes(pos: Position, lib: SimLib): AttrKey[] {
  const GK = toPosition(lib, 'GK');
  if (pos === GK) return [...GK_KEYS, 'positioning', 'concentration'];
  if (isDefender(pos, lib)) {
    return ['tackling', 'marking', 'heading', 'strength', 'positioning', 'teamwork', 'workRate', 'stamina', 'pace', 'aggression', 'concentration', 'jumpingReach'];
  }
  if (isMidfielder(pos, lib)) {
    return ['passing', 'firstTouch', 'technique', 'vision', 'teamwork', 'stamina', 'workRate', 'decisions', 'offTheBall', 'stamina', 'composure'];
  }
  return ['finishing', 'pace', 'offTheBall', 'composure', 'dribbling', 'acceleration', 'technique', 'longShots', 'heading', 'firstTouch'];
}

const clamp20 = (v: number): number => Math.max(1, Math.min(20, v));

function rollAttributes(lib: SimLib, pos: Position, tier: Tier, rng: Rng): PlayerAttributes {
  const [lo, hi] = TIER_BAND[tier];
  const attrs = {} as Record<AttrKey, number>;
  const allKeys: AttrKey[] = [...MENTAL_KEYS, ...PHYSICAL_KEYS, ...TECHNICAL_KEYS, ...GK_KEYS];

  if (pos === toPosition(lib, 'GK')) {
    for (const k of allKeys) attrs[k] = int(rng, lo, hi);
  } else {
    // Outfield: atribut kiper direndahkan (mirip generator upstream).
    for (const k of MENTAL_KEYS) attrs[k] = int(rng, lo, hi);
    for (const k of PHYSICAL_KEYS) attrs[k] = int(rng, lo, hi);
    for (const k of TECHNICAL_KEYS) attrs[k] = int(rng, lo, hi);
    for (const k of GK_KEYS) attrs[k] = int(rng, 1, 6);
  }
  // Penekanan peran: kunci +2 agar bek jago bertahan, striker jago finishing, dst.
  // Kalibrasi vs engine (docs/CALIBRATION.md): kiper engine sangat kuat
  // (saveChance jenuh di 0.82), jadi kunci menyerang dapat +4 agar konversi
  // peluang sehat. Bek/kiper tetap +2.
  const ATTACK_BOOST = new Set<AttrKey>([
    'finishing', 'composure', 'technique', 'pace', 'offTheBall',
    'acceleration', 'longShots', 'dribbling',
  ]);
  const isAttacker = pos !== toPosition(lib, 'GK') && !isDefender(pos, lib);
  for (const k of keyAttributes(pos, lib)) {
    attrs[k] = clamp20(attrs[k] + (isAttacker && ATTACK_BOOST.has(k) ? 4 : 2));
  }
  return attrs as PlayerAttributes;
}

function overallOf(lib: SimLib, pos: Position, attrs: PlayerAttributes): number {
  const keys = keyAttributes(pos, lib);
  const sum = keys.reduce((acc, k) => acc + (attrs[k] as number), 0);
  return Math.round((sum / keys.length) * 10) / 10;
}

/**
 * Bangun skuad 18 pemain. `takeName` wajib mengembalikan nama unik per liga.
 * `teamSeed` hanya dipakai untuk id pemain (nama/angka dari rng yang sama).
 */
export function buildSquad(lib: SimLib, def: TeamDef, rng: Rng, takeName: () => string): FiksiSquad {
  const template = (XI_TEMPLATES[def.formation] ?? XI_TEMPLATES['4-4-2'] as string[]).map((n) => toPosition(lib, n));
  const lineup = [...template, ...SUB_POSITIONS.map((n) => toPosition(lib, n))];
  const usedNumbers = new Set<number>([1]);
  const players: FiksiPlayer[] = lineup.map((position, i) => {
    const attributes = rollAttributes(lib, position, def.tier, rng);
    let number: number;
    if (position === toPosition(lib, 'GK') && i === 0) {
      number = 1;
    } else {
      do {
        number = int(rng, 2, 99);
      } while (usedNumbers.has(number));
      usedNumbers.add(number);
    }
    const height = int(rng, 165, 195);
    return {
      id: `${def.id}-p${String(i + 1).padStart(2, '0')}`,
      name: takeName(),
      number,
      age: int(rng, 17, 35),
      position,
      height,
      weight: height - 100 + int(rng, -8, 8),
      attributes,
      overall: overallOf(lib, position, attributes),
    };
  });
  return { teamId: def.id, players };
}

/** Konversi skuad fiksi -> instance simulator (dipanggil saat matchday saja). */
export function toSimPlayers(lib: SimLib, squad: FiksiSquad): InstanceType<SimLib['Player']>[] {
  return squad.players.map(
    (p) =>
      new lib.Player(
        { name: p.name, number: p.number },
        { height: p.height, weight: p.weight },
        p.attributes,
        p.position,
      ),
  );
}

/** Rata-rata overall XI (11 pertama) untuk cek keseimbangan tier. */
export function squadOverall(squad: FiksiSquad): number {
  const xi = squad.players.slice(0, 11);
  const sum = xi.reduce((acc, p) => acc + p.overall, 0);
  return Math.round((sum / xi.length) * 10) / 10;
}
