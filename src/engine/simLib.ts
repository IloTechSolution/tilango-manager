// Loader malas untuk @bleckert/football-simulator.
//
// Alasan: package.json paket tersebut hanya mendefinisikan kondisi "exports"
// untuk "types" + "import", tanpa "main"/"require". Akibatnya require() ala
// CJS (yang dipakai tsx untuk file .ts tanpa "type": "module") gagal dengan
// ERR_PACKAGE_PATH_NOT_EXPORTED. dynamic import() memakai kondisi "import"
// sehingga lolos — di Node maupun (nanti) Metro yang menganalisis literal statis.
//
// Aturan: import NILAI (class/enum) dari paket ini HANYA lewat simLib().
// Import TYPE (interface) boleh statis karena terhapus saat kompilasi.

export async function simLib(): Promise<typeof import('@bleckert/football-simulator')> {
  return import('@bleckert/football-simulator');
}

export type SimLib = Awaited<ReturnType<typeof simLib>>;
