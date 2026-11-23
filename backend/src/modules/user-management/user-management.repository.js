import { prisma } from "../../config/db.js";

export const fetchUser = async () => {
  // Tidak memfilter deletedAt agar akun yang di-soft-delete (Nonaktif)
  // tetap tampil di Manajemen User dan bisa diaktifkan kembali.
  return await prisma.mUser.findMany({
    include: {
      atlet: true,
      pelatih: true,
      official: true,
    },
  });
};

// Ambil seluruh personil master (untuk menggabungkan data yang belum punya akun)
export const fetchMasterAtlet = async () => {
  return await prisma.mAtlet.findMany({
    where: { deletedAt: null },
    select: {
      uidAtlet: true,
      nik: true,
      namaLengkap: true,
      statusAtlet: true,
    },
  });
};

export const fetchMasterPelatih = async () => {
  return await prisma.mPelatih.findMany({
    where: { deletedAt: null },
    select: {
      uidPelatih: true,
      nik: true,
      namaLengkap: true,
      statusPelatih: true,
    },
  });
};

export const fetchMasterOfficial = async () => {
  return await prisma.mOfficial.findMany({
    where: { deletedAt: null },
    select: {
      uidOfficial: true,
      nik: true,
      namaLengkap: true,
      statusOfficial: true,
    },
  });
};

export const createUser = async (data, hashedPassword) => {
  return await prisma.mUser.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role,
      mustChangePassword: true,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    },
  });
};

export const findByEmail = async (email) => {
  // Tanpa filter deletedAt: email milik akun soft-delete tetap dianggap terpakai
  // agar tidak terjadi duplikasi. Aktifkan kembali akun lama bila perlu.
  return await prisma.mUser.findFirst({
    where: { email },
  });
};

export const findByUidUser = async (uidUser) => {
  // Tanpa filter deletedAt supaya akun Nonaktif masih bisa ditemukan & diaktifkan.
  return await prisma.mUser.findUnique({
    where: { uidUser },
  });
};

export const updateEmail = async (uidUser, email, updatedBy) => {
  return await prisma.mUser.update({
    where: { uidUser },
    data: { email, updatedBy },
  });
};

export const updateStatus = async (uidUser, statusAkun, updatedBy) => {
  const isNonaktif = statusAkun === "Nonaktif";

  return await prisma.mUser.update({
    where: { uidUser },
    data: {
      statusAkun,
      updatedBy,
      // Soft delete: Nonaktif mengisi deletedAt, Aktif mengosongkannya kembali.
      deletedAt: isNonaktif ? new Date() : null,
      deletedBy: isNonaktif ? updatedBy : null,
    },
  });
};

export const findItemByType = async (uid, itemType) => {
  if (itemType === "Atlet") {
    return await prisma.mAtlet.findUnique({ where: { uidAtlet: uid, deletedAt: null } });
  } else if (itemType === "Pelatih") {
    return await prisma.mPelatih.findUnique({ where: { uidPelatih: uid, deletedAt: null } });
  } else if (itemType === "Official") {
    return await prisma.mOfficial.findUnique({ where: { uidOfficial: uid, deletedAt: null } });
  }
  return null;
};

export const findExistingUserByMasterUid = async (uid, itemType) => {
  const query = {
    Atlet: { uidAtlet: uid },
    Pelatih: { uidPelatih: uid },
    Official: { uidOfficial: uid },
  };
  return await prisma.mUser.findFirst({
    where: { ...query[itemType], deletedAt: null },
  });
};

export const createUserWithRelation = async (item, email, hashedPassword, role, userUid) => {
  const data = {
    email,
    password: hashedPassword,
    role,
    mustChangePassword: true,
    createdBy: userUid,
    updatedBy: userUid,
  };

  if (role === "Atlet") data.uidAtlet = item.uidAtlet;
  else if (role === "Pelatih") data.uidPelatih = item.uidPelatih;
  else if (role === "Official") data.uidOfficial = item.uidOfficial;

  return await prisma.mUser.create({ data });
};
