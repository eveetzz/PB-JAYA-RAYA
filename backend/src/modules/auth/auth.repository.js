import { prisma } from "../../config/db.js";

export const findByEmailUser = async (email) => {
  return await prisma.mUser.findFirst({
    where: {
      email: email,
      deletedAt: null,
    },
    include: {
      atlet: true,
      pelatih: true,
      official: true,
    },
  });
};

export const findByUidUser = async (uidUser) => {
  return await prisma.mUser.findUnique({
    where: {
      uidUser: uidUser,
    },
    include: {
      atlet: true,
      pelatih: true,
      official: true,
    },
  });
};

export const findJenisPelatih = async (user) => {
  if (!user.uidPelatih) return [];
  return await prisma.rPelatihJenis.findMany({
    where: {
      uidPelatih: user.uidPelatih,
      deletedAt: null,
    },
    select: {
      jenisPelatih: true,
    },
  });
};
