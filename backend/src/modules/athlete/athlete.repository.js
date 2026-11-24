import { prisma } from "../../config/db.js";

export const createAthlete = async (data, userUid, filePaths) => {
  const createData = await prisma.mAtlet.create({
    data: {
      nik: data.nik,
      idPbsi: data.idPbsi,
      namaLengkap: data.namaLengkap,
      namaIbu: data.namaIbu,
      tempatLahir: data.tempatLahir,
      tanggalLahir: new Date(data.tanggalLahir),
      alamat: data.alamat,
      jenisKelamin: data.jenisKelamin,
      peganganRaket: data.peganganRaket,
      provinsi: data.provinsi,
      klubSaatIni: data.klubSaatIni,
      asalKlubSebelumnya: data.asalKlubSebelumnya,
      gabungSatelitPada: data.gabungSatelitPada ? new Date(data.gabungSatelitPada) : null,
      gabungJayaRayaPada: data.gabungJayaRayaPada ? new Date(data.gabungJayaRayaPada) : null,
      statusAtlet: data.statusAtlet || "Aktif",
      foto: filePaths.foto,
      fileSttbSd: filePaths.fileSttbSd,
      fileKk: filePaths.fileKk,
      fileNisnOnline: filePaths.fileNisnOnline,
      fileAkteKelahiran: filePaths.fileAkteKelahiran,
      createdBy: userUid,
      updatedBy: userUid,
    },
  });

  return createData;
};

// Insert banyak atlet sekaligus secara atomik (dipakai import Excel)
export const createManyAthletes = async (rows, userUid) => {
  return prisma.$transaction(
    rows.map((row) =>
      prisma.mAtlet.create({
        data: {
          nik: row.nik,
          idPbsi: row.idPbsi,
          namaLengkap: row.namaLengkap,
          namaIbu: row.namaIbu,
          tempatLahir: row.tempatLahir,
          tanggalLahir: new Date(row.tanggalLahir),
          alamat: row.alamat,
          jenisKelamin: row.jenisKelamin,
          peganganRaket: row.peganganRaket,
          provinsi: row.provinsi,
          klubSaatIni: row.klubSaatIni,
          asalKlubSebelumnya: row.asalKlubSebelumnya || null,
          gabungSatelitPada: row.gabungSatelitPada
            ? new Date(row.gabungSatelitPada)
            : null,
          gabungJayaRayaPada: row.gabungJayaRayaPada
            ? new Date(row.gabungJayaRayaPada)
            : null,
          statusAtlet: row.statusAtlet || "Aktif",
          createdBy: userUid,
          updatedBy: userUid,
        },
      }),
    ),
  );
};

export const assignSektor = async (id, sektorList, userUid) => {
  const results = await prisma.$transaction(async (r) => {
    await r.rAtletSektor.updateMany({
      where: {
        uidAtlet: id,
        endDate: null,
        deletedAt: null,
      },
      data: {
        endDate: new Date(),
        updatedBy: userUid,
      },
    });

    if (sektorList.length > 0) {
      await r.rAtletSektor.createMany({
        data: sektorList.map((item) => ({
          uidAtlet: id,
          uidSektor: item.uidSektor,
          statusSektor: item.statusSektor,
          startDate: new Date(),
          endDate: null,
          createdBy: userUid,
          updatedBy: userUid,
        })),
      });
    }
  });

  return results;
};

export const findByNik = async (nik) => {
  const findData = await prisma.mAtlet.findFirst({
    where: {
      nik: nik,
      deletedAt: null,
    },
  });

  return findData;
};

export const findManyByNik = async (nikList) => {
  if (!nikList.length) return [];
  return prisma.mAtlet.findMany({
    where: { nik: { in: nikList } },
    select: { nik: true, deletedAt: true },
  });
};

// Daftar field yang boleh dipakai untuk sorting
const SORTABLE_FIELDS = [
  "createdAt",
  "updatedAt",
  "nik",
  "idPbsi",
  "namaLengkap",
  "jenisKelamin",
  "statusAtlet",
];

const STATUS_ATLET = ["Aktif", "Nonaktif"];

// Field berkas yang menentukan status "dokumen lengkap"
const FILE_FIELDS = [
  "foto",
  "fileSttbSd",
  "fileKk",
  "fileNisnOnline",
  "fileAkteKelahiran",
];

const buildWhere = ({ search, status }) => {
  const and = [{ deletedAt: null }];

  if (search) {
    and.push({
      OR: [
        { namaLengkap: { contains: search, mode: "insensitive" } },
        { idPbsi: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  if (status && STATUS_ATLET.includes(status)) {
    and.push({ statusAtlet: status });
  }

  return { AND: and };
};

export const getAthletes = async (query = {}) => {
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

  const [totalItems, totalAtlet, aktifCount, incompleteCount, data] =
    await Promise.all([
      prisma.mAtlet.count({ where }),
      prisma.mAtlet.count({ where: { deletedAt: null } }),
      prisma.mAtlet.count({
        where: { deletedAt: null, statusAtlet: "Aktif" },
      }),
      prisma.mAtlet.count({
        where: {
          ...where,
          AND: [
            ...where.AND,
            { OR: FILE_FIELDS.map((field) => ({ [field]: null })) },
          ],
        },
      }),
      prisma.mAtlet.findMany({
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
    summary: {
      total: totalAtlet,
      aktif: aktifCount,
      incomplete: incompleteCount,
    },
  };
};

export const findByUid = async (id) => {
  const checkUser = await prisma.mAtlet.findFirst({
    where: {
      uidAtlet: id,
      deletedAt: null,
    },
  });

  return checkUser;
};

export const updateDataAthlete = async (id, user, updatedData, filePaths) => {
  const updatedAthlete = await prisma.mAtlet.update({
    where: { uidAtlet: id },
    data: {
      ...updatedData,
      tanggalLahir: updatedData.tanggalLahir ? new Date(updatedData.tanggalLahir) : undefined,
      gabungSatelitPada: updatedData.gabungSatelitPada ? new Date(updatedData.gabungSatelitPada) : undefined,
      gabungJayaRayaPada: updatedData.gabungJayaRayaPada ? new Date(updatedData.gabungJayaRayaPada) : undefined,
      foto: filePaths.foto,
      fileSttbSd: filePaths.fileSttbSd,
      fileKk: filePaths.fileKk,
      fileNisnOnline: filePaths.fileNisnOnline,
      fileAkteKelahiran: filePaths.fileAkteKelahiran,
      updatedAt: new Date(),
      updatedBy: user,
    },
  });

  return updatedAthlete;
};

export const softDeleteUser = async (id, userUid) => {
  const deleteUser = await prisma.$transaction(async (r) => {
    const atlet = await r.mAtlet.update({
      where: {
        uidAtlet: id,
      },
      data: {
        statusAtlet: "Nonaktif",
        deletedBy: userUid,
        deletedAt: new Date(),
      },
    });

    await r.mUser.updateMany({
      where: { uidAtlet: id },
      data: {
        statusAkun: "Nonaktif",
        deletedBy: userUid,
        deletedAt: new Date(),
      },
    });

    return atlet;
  });

  return deleteUser;
};
