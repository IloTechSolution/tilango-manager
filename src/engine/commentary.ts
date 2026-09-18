// Komentator Bahasa Indonesia: structured engine events -> baris teks laga.
// Hanya event high-signal yang dirender (pass biasa disaring).

import type { RealTimeMatchEvent } from '@bleckert/football-simulator';
import { pick } from './rng';
import type { Rng } from './rng';

export function minuteOf(timeSeconds: number): number {
  return Math.max(1, Math.ceil(timeSeconds / 60));
}

function actor(homeName: string, awayName: string, e: RealTimeMatchEvent): { team: string; player: string } {
  const team = e.team?.name ?? (e.teamSide === 'home' ? homeName : e.teamSide === 'away' ? awayName : '-');
  return { team, player: e.player?.info.name ?? 'pemain' };
}

const GOAL_VERBS = [
  'menyambar umpan silang dengan sundulan keras',
  'melepaskan tembakan melengkung ke pojok gawang',
  'menyelesaikan serangan balik cepat dengan dingin',
  'menanduk bola sepak pojok tanpa ampun',
  'mencetak gol dari titik penalti',
  'menyodok bola muntah hasil tepisan kiper',
];

const SHOT_LINES = [
  'melepaskan tembakan dari luar kotak penalti',
  'mendapat ruang dan melepaskan tembakan',
  'menyambut umpan terobosan dengan tembakan',
];

const SAVE_LINES = ['Ditepis kiper!', 'Penyelamatan gemilang kiper!', 'Kiper membaca arah bola dengan sempurna!'];
const MISS_LINES = ['melambung jauh di atas mistar', 'menyamping tipis dari gawang', 'membentur tiang gawang!'];

/** Render satu event -> string, atau null bila disaring. */
export function commentateOne(
  homeName: string,
  awayName: string,
  e: RealTimeMatchEvent,
  rng: Rng,
): string | null {
  const m = minuteOf(e.time);
  const { team, player } = actor(homeName, awayName, e);
  switch (e.type) {
    case 'goal':
      return `${m}' GOL untuk ${team}! ${player} ${pick(rng, GOAL_VERBS)}.`;
    case 'shot':
      return `${m}' ${player} (${team}) ${pick(rng, SHOT_LINES)}.`;
    case 'save':
      return `${m}' ${pick(rng, SAVE_LINES)} Tembakan ${player} (${team}) gagal berbuah gol.`;
    case 'miss':
      return `${m}' Peluang ${team}! Tembakan ${player} ${pick(rng, MISS_LINES)}.`;
    case 'blocked_shot':
      return `${m}' Tembakan ${player} (${team}) diblok barisan pertahanan.`;
    case 'penalty':
      return `${m}' Penalti untuk ${team}! ${player} maju sebagai eksekutor.`;
    case 'foul':
      return `${m}' Pelanggaran! ${player} (${team}) melanggar lawan.`;
    case 'yellow_card':
      return `${m}' Kartu kuning untuk ${player} (${team}).`;
    case 'red_card':
      return `${m}' Kartu merah! ${player} (${team}) harus meninggalkan lapangan.`;
    case 'injury':
      return `${m}' ${player} (${team}) tergeletak dan butuh perawatan medis.`;
    case 'substitution':
      return `${m}' Pergantian pemain ${team}: ${player} masuk lapangan.`;
    case 'tactical_change':
      return `${m}' ${team} mengubah pendekatan taktik.`;
    case 'half_time':
      return `--- Babak pertama usai. Skor sementara akan dirangkum. ---`;
    case 'full_time':
      return `Peluit panjang! Laga ${homeName} vs ${awayName} selesai.`;
    default:
      return null;
  }
}

/** Render seluruh events engine -> feed teks siap tampil/simpan. */
export function commentate(
  homeName: string,
  awayName: string,
  events: RealTimeMatchEvent[],
  rng: Rng,
): string[] {
  return events
    .map((e) => commentateOne(homeName, awayName, e, rng))
    .filter((line): line is string => line !== null);
}
