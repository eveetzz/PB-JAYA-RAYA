import { prisma } from "../../config/db.js";

export const fetchUser = async () => {
  return await prisma.mUser.findMany({
    where: { deletedAt: null },
    include: {
      atlet: true,
      pelatih: true,
      official: true,
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
  return await prisma.mUser.findFirst({
    where: { email, deletedAt: null },
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
