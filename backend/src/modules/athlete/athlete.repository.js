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

export const getAthletes = async () => {
  const fetchAthletes = await prisma.mAtlet.findMany({
    where: {
      deletedAt: null,
    },
  });

  return fetchAthletes;
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
