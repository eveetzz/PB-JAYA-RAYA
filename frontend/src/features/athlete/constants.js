// Daftar dokumen atlet. `field` harus sama dengan nama kolom di MAtlet.
export const ATHLETE_DOCUMENTS = [
  { field: 'foto', label: 'Foto Atlet', kind: 'foto' },
  { field: 'fileSttbSd', label: 'STTB SD', kind: 'dokumen' },
  { field: 'fileKk', label: 'Kartu Keluarga', kind: 'dokumen' },
  { field: 'fileNisnOnline', label: 'NISN Online', kind: 'dokumen' },
  { field: 'fileAkteKelahiran', label: 'Surat Keterangan Lahir', kind: 'dokumen' },
];

// Semua field ini wajib terisi agar atlet tidak berstatus "Incomplete".
const REQUIRED_FILE_FIELDS = ATHLETE_DOCUMENTS.map((doc) => doc.field);

export const isAthleteIncomplete = (athlete) =>
  !athlete || REQUIRED_FILE_FIELDS.some((field) => !athlete[field]);

export const STATUS_ATLET_OPTIONS = ['Aktif', 'Nonaktif'];

export const JENIS_KELAMIN_OPTIONS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
];

export const PEGANGAN_RAKET_OPTIONS = ['Kanan', 'Kiri'];

// URL file dari backend berbentuk path relatif (/uploads/...),
// sehingga perlu ditempel ke origin API (lewat proxy Vite).
export const resolveFileUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `/api${path}`;
};