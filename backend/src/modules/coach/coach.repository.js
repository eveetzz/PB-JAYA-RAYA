import { prisma } from "../../config/db.js";

export const COACH_FILE_FIELDS = [
  "foto",
  "fileSertifikasiKota",
  "fileSertifikasiProvinsi",
  "fileSertifikasiNasional",
  "fileSertifikasiBwf1",
  "fileSertifikasiBwf2",
  "fileSertifikasiSarjanaOlahraga",
  "fileSertifikasiMasterOlahraga",
];

const SORTABLE_FIELDS = [
  "createdAt",
  "updatedAt",
  "nik",
  "namaLengkap",
  "statusPelatih",
  "tahunBergabung",
];

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

const buildWhere = ({ search, status }) => {
  const and = [{ deletedAt: null }];

  if (search) {
    and.push({
      OR: [
        { namaLengkap: { contains: search, mode: "insensitive" } },
        { nik: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (status === "Aktif" || status === "Nonaktif") {
    and.push({ statusPelatih: status });
  }

  return { AND: and };
};

const addRelations = async (r, uidPelatih, userUid, rolePelatih = [], sektorList = []) => {
  if (rolePelatih.length > 0) {
    await r.rPelatihJenis.createMany({
      data: rolePelatih.map((jenis) => ({
        uidPelatih,
        jenisPelatih: jenis,
        startDate: new Date(),
        createdBy: userUid,
        updatedBy: userUid,
      })),
    });
  }

  if (sektorList.length > 0) {
    await r.rPelatihSektor.createMany({
      data: sektorList.map((uidSektor) => ({
        uidPelatih,
        uidSektor,
        startDate: new Date(),
        createdBy: userUid,
        updatedBy: userUid,
      })),
    });
  }
};

export const createCoach = async (data, userUid, filePaths, rolePelatih, sektorList) => {
  return prisma.$transaction(async (r) => {
    const addCoachData = await r.mPelatih.create({
      data: {
        nik: data.nik,
        namaLengkap: data.namaLengkap,
        jenisKelamin: data.jenisKelamin,
        tanggalLahir: new Date(data.tanggalLahir),
        tahunBergabung: parseInt(data.tahunBergabung) || new Date().getFullYear(),
        kewarganegaraan: data.kewarganegaraan || "Indonesia",
        pernahMelatihSebelumnya:
          data.pernahMelatihSebelumnya === "true" || data.pernahMelatihSebelumnya === true,
        klubNegaraSebelumnya: data.klubNegaraSebelumnya || null,
        statusPelatih: data.statusPelatih || "Aktif",
        foto: filePaths.foto ?? null,
        fileSertifikasiKota: filePaths.fileSertifikasiKota ?? null,
        fileSertifikasiProvinsi: filePaths.fileSertifikasiProvinsi ?? null,
        fileSertifikasiNasional: filePaths.fileSertifikasiNasional ?? null,
        fileSertifikasiBwf1: filePaths.fileSertifikasiBwf1 ?? null,
        fileSertifikasiBwf2: filePaths.fileSertifikasiBwf2 ?? null,
        fileSertifikasiSarjanaOlahraga: filePaths.fileSertifikasiSarjanaOlahraga ?? null,
        fileSertifikasiMasterOlahraga: filePaths.fileSertifikasiMasterOlahraga ?? null,
        createdBy: userUid,
        updatedBy: userUid,
      },
    });

    await addRelations(r, addCoachData.uidPelatih, userUid, rolePelatih, sektorList);

    return addCoachData;
  });
};

export const findByNik = async (nik, excludeUid = null) => {
  return prisma.mPelatih.findFirst({
    where: {
      nik,
      deletedAt: null,
      ...(excludeUid ? { uidPelatih: { not: excludeUid } } : {}),
    },
  });
};

export const findManyByNik = async (niks = []) => {
  if (!niks.length) return [];
  return prisma.mPelatih.findMany({
    where: {
      nik: { in: niks },
      deletedAt: null,
    },
    select: { nik: true },
  });
};

export const findByUid = async (id) => {
  return prisma.mPelatih.findFirst({
    where: { uidPelatih: id, deletedAt: null },
    include: coachInclude,
  });
};

export const getCoaches = async (query = {}) => {
  const {
    search,
    status,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
  const orderField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : "createdAt";
  const orderDir = sortOrder === "asc" ? "asc" : "desc";
  const where = buildWhere({ search, status });

  const [totalItems, total, aktif, incomplete, data] = await Promise.all([
    prisma.mPelatih.count({ where }),
    prisma.mPelatih.count({ where: { deletedAt: null } }),
    prisma.mPelatih.count({ where: { deletedAt: null, statusPelatih: "Aktif" } }),
    prisma.mPelatih.count({
      where: {
        ...where,
        AND: [
          ...where.AND,
          { OR: COACH_FILE_FIELDS.map((field) => ({ [field]: null })) },
        ],
      },
    }),
    prisma.mPelatih.findMany({
      where,
      include: coachInclude,
      orderBy: { [orderField]: orderDir },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    }),
  ]);

  return {
    data,
    meta: {
      totalItems,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(totalItems / safeLimit) || 1,
    },
    summary: { total, aktif, incomplete },
  };
};

export const updateCoach = async (
  id,
  data,
  userUid,
  filePaths,
  rolePelatih,
  sektorList,
) => {
  return prisma.$transaction(async (r) => {
    if (sektorList) {
      const now = new Date();
      await r.rPelatihSektor.updateMany({
        where: { uidPelatih: id, deletedAt: null, endDate: null },
        data: { endDate: now, deletedAt: now, deletedBy: userUid },
      });
      await r.rPelatihJenis.updateMany({
        where: { uidPelatih: id, deletedAt: null, endDate: null },
        data: { endDate: now, deletedAt: now, deletedBy: userUid },
      });
    }

    const updated = await r.mPelatih.update({
      where: { uidPelatih: id },
      data: {
        ...data,
        tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
        tahunBergabung:
          data.tahunBergabung !== undefined
            ? parseInt(data.tahunBergabung)
            : undefined,
        pernahMelatihSebelumnya:
          data.pernahMelatihSebelumnya === undefined
            ? undefined
            : data.pernahMelatihSebelumnya === "true" ||
              data.pernahMelatihSebelumnya === true,
        ...filePaths,
        updatedAt: new Date(),
        updatedBy: userUid,
      },
    });

    if (sektorList) {
      await addRelations(r, id, userUid, rolePelatih, sektorList);
    }

    return updated;
  });
};

export const softDeleteCoachRepo = async (id, userUid) => {
  return prisma.$transaction(async (r) => {
    const now = new Date();
    const coach = await r.mPelatih.update({
      where: { uidPelatih: id },
      data: {
        statusPelatih: "Nonaktif",
        deletedAt: now,
        deletedBy: userUid,
      },
    });

    await r.rPelatihSektor.updateMany({
      where: { uidPelatih: id, deletedAt: null, endDate: null },
      data: { endDate: now, deletedAt: now, deletedBy: userUid },
    });

    await r.rPelatihJenis.updateMany({
      where: { uidPelatih: id, deletedAt: null, endDate: null },
      data: { endDate: now, deletedAt: now, deletedBy: userUid },
    });

    await r.mUser.updateMany({
      where: { uidPelatih: id },
      data: {
        statusAkun: "Nonaktif",
        deletedAt: now,
        deletedBy: userUid,
      },
    });

    return coach;
  });
};

export const setJenisFromSektor = async (uidSektor) => {
  if (!uidSektor || uidSektor.length === 0) return [];

  const sektors = await prisma.mSektor.findMany({
    where: {
      uidSektor: { in: uidSektor },
      deletedAt: null,
    },
    select: {
      kategori: true,
    },
  });

  const kategori = [...new Set(sektors.map((sektor) => sektor.kategori))];

  return kategori.map((k) => (k === "Fisik" ? "pelatih_fisik" : "pelatih_teknik"));
};