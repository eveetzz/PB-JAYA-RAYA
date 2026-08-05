import { prisma } from "../../config/db.js";

export const findByEmailUser = async (email) => {
  const emailUser = await prisma.mUser.findUnique({
    where: {
      email: email,
    },
    include: {
      atlet: true,
      pelatih: true,
    },
  });

  return emailUser;
};

export const findByUidUser = async (uidUser) => {
  const user = await prisma.mUser.findUnique({
    where: {
      uidUser: uidUser,
    },
    include: {
      atlet: true,
      pelatih: true,
    },
  });

  return user;
};

export const findJenisPelatih = async (uidUser) => {
  const jenisPelatih = await prisma.rPelatihJenis.findMany({
    where: {
      uidPelatih: uidUser.uidPelatih,
      deletedAt: null,
    },
    select: {
      jenisPelatih: true,
    },
  });

  return jenisPelatih;
};
