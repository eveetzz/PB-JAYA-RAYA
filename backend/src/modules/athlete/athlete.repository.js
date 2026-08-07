import { prisma } from "../../config/db.js";

export const createAthlete = async (data, userUid, optimizedImgUrl) => {
  const createData = await prisma.mAtlet.create({
    data: {
      nik: data.nik,
      idPbsi: data.idPbsi,
      email: data.email,
      namaLengkap: data.namaLengkap,
      namaAyah: data.namaAyah,
      namaIbu: data.namaIbu,
      tempatLahir: data.tempatLahir,
      tanggalLahir: new Date(data.tanggalLahir),
      alamat: data.alamat,
      jenisKelamin: data.jenisKelamin,
      peganganRaket: data.peganganRaket,
      tinggiBadan: parseInt(data.tinggiBadan) || 0,
      beratBadan: parseInt(data.beratBadan) || 0,
      statusAtlet: data.statusAtlet,
      foto: optimizedImgUrl,
      uidProvinsi: data.uidProvinsi,
      createdBy: userUid,
      updatedBy: userUid,
    },
  });

  return createData;
};

export const findByNik = async (nik) => {
  const findData = await prisma.mAtlet.findUnique({
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

export const updateDataAthlete = async (id, user, updatedData) => {
  const updatedAthlete = await prisma.mAtlet.update({
    where: { uidAtlet: id },
    data: { ...updatedData, updatedAt: new Date(), updatedBy: user },
  });

  return updatedAthlete;
};

export const softDeleteUser = async (id, userUid) => {
  const deleteUser = await prisma.mAtlet.update({
    where: {
      uidAtlet: id,
    },
    data: {
      deletedBy: userUid,
      deletedAt: new Date(),
    },
  });
  return deleteUser;
};
