export const STAFF_TIPE = {
  PELATIH: 'Pelatih',
  OFFICIAL: 'Official',
};

// Nilai khusus URL ?tipe=Semua: tanpa filter tipe (gabungan).
export const TIPE_ALL = 'Semua';

export const STATUS_OPTIONS = ['Aktif', 'Nonaktif'];

export const JENIS_KELAMIN_OPTIONS = [
  { value: 'L', label: 'Laki-laki' },
  { value: 'P', label: 'Perempuan' },
];

// Field sertifikasi pelatih. `field` harus sama dengan kolom MPelatih.
export const COACH_CERTIFICATIONS = [
  { field: 'fileSertifikasiKota', label: 'Sertifikasi Kota' },
  { field: 'fileSertifikasiProvinsi', label: 'Sertifikasi Provinsi' },
  { field: 'fileSertifikasiNasional', label: 'Sertifikasi Nasional' },
  { field: 'fileSertifikasiBwf1', label: 'Sertifikasi BWF 1' },
  { field: 'fileSertifikasiBwf2', label: 'Sertifikasi BWF 2' },
  { field: 'fileSertifikasiSarjanaOlahraga', label: 'Sertifikasi Sarjana Olahraga' },
  { field: 'fileSertifikasiMasterOlahraga', label: 'Sertifikasi Master Olahraga' },
];

export const COACH_FILE_FIELDS = [
  'foto',
  ...COACH_CERTIFICATIONS.map((item) => item.field),
];

export const isCoachIncomplete = (coach) =>
  !coach || COACH_FILE_FIELDS.some((field) => !coach[field]);

export const isOfficialIncomplete = (official) => !official?.foto;

export const isStaffIncomplete = (person) => {
  if (typeof person?.incomplete === 'boolean') return person.incomplete;
  return person?.tipe === STAFF_TIPE.OFFICIAL
    ? isOfficialIncomplete(person)
    : isCoachIncomplete(person);
};

export const statusBadgeClass = (status) =>
  status === 'Aktif'
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';

// URL file backend berupa path relatif (/uploads/...).
export const resolveFileUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `/api${path}`;
};

export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const genderLabel = (value) =>
  value === 'L' ? 'Laki-laki' : value === 'P' ? 'Perempuan' : '-';

export const dateInputValue = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};