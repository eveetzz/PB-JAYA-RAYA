import { prisma } from "../../config/db.js";

export const createOfficial = async (data, userUid, fotoPath) => {
  return await prisma.mOfficial.create({
    data: {
      nik: data.nik,
      namaLengkap: data.namaLengkap,
      nomorTelp: data.nomorTelp,
      tempatLahir: data.tempatLahir,
      tanggalLahir: new Date(data.tanggalLahir),
      jenisKelamin: data.jenisKelamin,
      foto: fotoPath,
      createdBy: userUid,
      updatedBy: userUid,
    },
  });
};

export const findByNik = async (nik) => {
  return await prisma.mOfficial.findFirst({
    where: {
      nik,
      deletedAt: null,
    },
  });
};

export const findByUid = async (id) => {
  return await prisma.mOfficial.findFirst({
    where: {
      uidOfficial: id,
      deletedAt: null,
    },
  });
};

export const getOfficials = async () => {
  return await prisma.mOfficial.findMany({
    where: {
      deletedAt: null,
    },
  });
};

export const softDeleteOfficialRepo = async (id, userUid) => {
  return await prisma.$transaction(async (r) => {
    const deletedOfficial = await r.mOfficial.update({
      where: { uidOfficial: id },
      data: {
        statusOfficial: "Nonaktif",
        deletedAt: new Date(),
        deletedBy: userUid,
      },
    });

    await r.mUser.updateMany({
      where: { uidOfficial: id },
      data: {
        statusAkun: "Nonaktif",
        deletedAt: new Date(),
        deletedBy: userUid,
      },
    });

    return deletedOfficial;
  });
};
