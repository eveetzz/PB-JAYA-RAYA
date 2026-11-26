import { prisma } from "../../config/db.js";
import { COACH_FILE_FIELDS } from "../coach/coach.repository.js";
import { OFFICIAL_FILE_FIELDS } from "../official/official.repository.js";

const coachInclude = {
  pelatihSektorList: {
    where: { deletedAt: null, endDate: null },
    select: {
      sektor: {
        select: {
          uidSektor: true,
          namaSektor: true,
          kategori: true,
        },
      },
    },
  },
};

const buildWhere = ({ search }) => {
  const and = [{ deletedAt: null }];

  if (search) {
    and.push({
      OR: [
        { namaLengkap: { contains: search, mode: "insensitive" } },
        { nik: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  return { AND: and };
};

const mapCoach = (row) => {
  const sektorList = (row.pelatihSektorList || [])
    .map((item) => item.sektor)
    .filter(Boolean);

  return {
    uid: row.uidPelatih,
    tipe: "Pelatih",
    nik: row.nik,
    namaLengkap: row.namaLengkap,
    jenisKelamin: row.jenisKelamin,
    tanggalLahir: row.tanggalLahir,
    tahunBergabung: row.tahunBergabung,
    kewarganegaraan: row.kewarganegaraan,
    pernahMelatihSebelumnya: row.pernahMelatihSebelumnya,
    klubNegaraSebelumnya: row.klubNegaraSebelumnya,
    status: row.statusPelatih,
    foto: row.foto,
    sektor: sektorList,
    sektorUtama: sektorList[0]?.namaSektor || null,
    incomplete: COACH_FILE_FIELDS.some((field) => !row[field]),
    createdAt: row.createdAt,
  };
};

const mapOfficial = (row) => ({
  uid: row.uidOfficial,
  tipe: "Official",
  nik: row.nik,
  namaLengkap: row.namaLengkap,
  nomorTelp: row.nomorTelp,
  tempatLahir: row.tempatLahir,
  tanggalLahir: row.tanggalLahir,
  jenisKelamin: row.jenisKelamin,
  status: row.statusOfficial,
  foto: row.foto,
  sektor: [],
  sektorUtama: null,
  incomplete: OFFICIAL_FILE_FIELDS.some((field) => !row[field]),
  createdAt: row.createdAt,
});

const normalizeTipe = (tipe) => {
  const value = String(tipe || "").toLowerCase();
  if (value === "pelatih" || value === "coach") return "Pelatih";
  if (value === "official") return "Official";
  return null;
};

export const getPelatihOfficialList = async (query = {}) => {
  const {
    tipe,
    search,
    status,
    page = 1,
    limit = 20,
  } = query;

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const selectedTipe = normalizeTipe(tipe);

  const coachWhere = buildWhere({ search });
  if (status === "Aktif" || status === "Nonaktif") {
    coachWhere.AND.push({ statusPelatih: status });
  }

  const officialWhere = buildWhere({ search });
  if (status === "Aktif" || status === "Nonaktif") {
    officialWhere.AND.push({ statusOfficial: status });
  }

  const [coaches, officials, totalPelatih, totalOfficial, incompletePelatih, incompleteOfficial] =
    await Promise.all([
      selectedTipe === "Official"
        ? []
        : prisma.mPelatih.findMany({
            where: coachWhere,
            include: coachInclude,
            orderBy: { createdAt: "desc" },
          }),
      selectedTipe === "Pelatih"
        ? []
        : prisma.mOfficial.findMany({
            where: officialWhere,
            orderBy: { createdAt: "desc" },
          }),
      prisma.mPelatih.count({ where: { deletedAt: null } }),
      prisma.mOfficial.count({ where: { deletedAt: null } }),
      prisma.mPelatih.count({
        where: {
          deletedAt: null,
          OR: COACH_FILE_FIELDS.map((field) => ({ [field]: null })),
        },
      }),
      prisma.mOfficial.count({
        where: {
          deletedAt: null,
          OR: OFFICIAL_FILE_FIELDS.map((field) => ({ [field]: null })),
        },
      }),
    ]);

  const merged = [
    ...coaches.map(mapCoach),
    ...officials.map(mapOfficial),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const totalItems = merged.length;
  const start = (safePage - 1) * safeLimit;

  return {
    data: merged.slice(start, start + safeLimit),
    meta: {
      totalItems,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(totalItems / safeLimit) || 1,
    },
    summary: {
      totalPelatih,
      totalOfficial,
      total: totalPelatih + totalOfficial,
      incompletePelatih,
      incompleteOfficial,
    },
  };
};