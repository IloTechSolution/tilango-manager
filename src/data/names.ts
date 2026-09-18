// Kumpulan nama fiksi bernuansa Indonesia untuk generator skuad.
// Kombinasi dipakai unik per liga (lihat createNamePool). Bukan nama pemain asli.

export const FIRST_NAMES: readonly string[] = [
  'Agus', 'Bima', 'Cahyo', 'Dimas', 'Eko', 'Fajar', 'Galih', 'Hendra',
  'Irfan', 'Joko', 'Kurnia', 'Lukman', 'Made', 'Nanda', 'Putra', 'Raka',
  'Rizky', 'Samsul', 'Teguh', 'Wahyu', 'Yoga', 'Yusuf', 'Bagas', 'Darma',
  'Eka', 'Fikri', 'Gilang', 'Hafiz', 'Ilham', 'Jaya', 'Krisna', 'Luthfi',
  'Pandji', 'Rangga', 'Sakti', 'Taufik',
];

export const LAST_NAMES: readonly string[] = [
  'Pratama', 'Saputra', 'Nugroho', 'Setiawan', 'Wijaya', 'Kusuma', 'Santoso',
  'Hidayat', 'Ramadhan', 'Firmansyah', 'Maulana', 'Siregar', 'Nasution',
  'Pangestu', 'Wibowo', 'Setiaji', 'Gunawan', 'Halim', 'Suhendra', 'Laksmana',
  'Baskoro', 'Maharaja', 'Samudra', 'Angkasa', 'Buana', 'Cakrawala', 'Dirgantara',
  'Handoko', 'Iskandar', 'Jatmiko', 'Kartika', 'Lembana', 'Mahesa', 'Nararya',
  'Purnama', 'Segara',
];

export type Rng = () => number;

/** Kembalikan pool "Nama Depan + Nama Belakang" yang di-shuffle, unik. */
export function createNamePool(rng: Rng): string[] {
  const combos: string[] = [];
  for (const first of FIRST_NAMES) {
    for (const last of LAST_NAMES) {
      combos.push(`${first} ${last}`);
    }
  }
  // Fisher-Yates dengan RNG seeded -> deterministik per seed liga.
  for (let i = combos.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [combos[i], combos[j]] = [combos[j] as string, combos[i] as string];
  }
  return combos;
}
