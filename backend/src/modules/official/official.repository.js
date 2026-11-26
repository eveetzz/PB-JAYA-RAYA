import { prisma } from "../../config/db.js";

export const OFFICIAL_FILE_FIELDS = ["foto"];

const SORTABLE_FIELDS = [
  "createdAt",
  "updatedAt",
  "nik",
  "namaLengkap",
  "statusOfficial",
  "tempatLahir",
];

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
    and.push({ statusOfficial: status });
  }

  return { AND: and };
};

export const createOfficial = async (data, userUid, fotoPath) => {
  return prisma.mOfficial.create({
    data: {
      nik: data.nik,
      namaLengkap: data.namaLengkap,
      nomorTelp: data.nomorTelp,
      tempatLahir: data.tempatLahir,
      tanggalLahir: new Date(data.tanggalLahir),
      jenisKelamin: data.jenisKelamin,
      statusOfficial: data.statusOfficial || "Aktif",
      foto: fotoPath ?? null,
      createdBy: userUid,
      updatedBy: userUid,
    },
  });
};

export const findByNik = async (nik, excludeUid = null) => {
  return prisma.mOfficial.findFirst({
    where: {
      nik,
      deletedAt: null,
      ...(excludeUid ? { uidOfficial: { not: excludeUid } } : {}),
    },
  });
};

export const findManyByNik = async (niks = []) => {
  if (!niks.length) return [];
  return prisma.mOfficial.findMany({
    where: {
      nik: { in: niks },
      deletedAt: null,
    },
    select: { nik: true },
  });
};

export const findByUid = async (id) => {
  return prisma.mOfficial.findFirst({
    where: {
      uidOfficial: id,
      deletedAt: null,
    },
  });
};

export const getOfficials = async (query = {}) => {
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
    prisma.mOfficial.count({ where }),
    prisma.mOfficial.count({ where: { deletedAt: null } }),
    prisma.mOfficial.count({ where: { deletedAt: null, statusOfficial: "Aktif" } }),
    prisma.mOfficial.count({
      where: {
        ...where,
        AND: [
          ...where.AND,
          { OR: OFFICIAL_FILE_FIELDS.map((field) => ({ [field]: null })) },
        ],
      },
    }),
    prisma.mOfficial.findMany({
      where,
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

export const updateOfficial = async (id, data, userUid, fotoPath) => {
  return prisma.mOfficial.update({
    where: { uidOfficial: id },
    data: {
      ...data,
      tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : undefined,
      ...(fotoPath !== undefined ? { foto: fotoPath } : {}),
      updatedAt: new Date(),
      updatedBy: userUid,
    },
  });
};

export const softDeleteOfficialRepo = async (id, userUid) => {
  return prisma.$transaction(async (r) => {
    const now = new Date();
    const deletedOfficial = await r.mOfficial.update({
      where: { uidOfficial: id },
      data: {
        statusOfficial: "Nonaktif",
        deletedAt: now,
        deletedBy: userUid,
      },
    });

    await r.mUser.updateMany({
      where: { uidOfficial: id },
      data: {
        statusAkun: "Nonaktif",
        deletedAt: now,
        deletedBy: userUid,
      },
    });

    return deletedOfficial;
  });
};