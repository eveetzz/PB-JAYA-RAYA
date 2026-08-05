import { prisma } from "../../config/db.js";

export const fetchUser = async () => {
  const getData = await prisma.mUser.findMany({
    where: {
      deletedAt: null,
    },
  });

  return getData;
};

export const createUser = async (data, hashedPassword) => {
  const addUser = await prisma.mUser.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
    },
  });

  return addUser;
};

export const createUserByAssignRoles = async (
  data,
  hashedPassword,
  userUid,
  itemType,
) => {
  const userData = {
    email: data.email,
    password: hashedPassword,
    role: itemType,
    createdBy: userUid,
    updatedBy: userUid,
  };

  if (itemType === "Atlet") {
    userData.uidAtlet = data.uidAtlet; // pastikan ini ada
  } else if (itemType === "Pelatih") {
    userData.uidPelatih = data.uidPelatih; // pastikan ini ada
  }

  const addUser = await prisma.mUser.create({ data: userData });
  return addUser;
};

export const findByEmail = async (email) => {
  const findData = await prisma.mUser.findUnique({
    where: {
      email: email,
    },
  });

  return findData;
};

export const ifUserExists = async (id) => {
  const userExists = await prisma.mUser.findFirst({
    where: {
      uidAtlet: id,
      deletedAt: null,
    },
  });

  return userExists;
};

export const findItemType = async (data, itemType) => {
  if (itemType === "Atlet") {
    return prisma.mAtlet.findMany({ where: { uidAtlet: { in: data } } });
  }
  return prisma.mPelatih.findMany({ where: { uidPelatih: { in: data } } });
};

export const checkByUids = async (data, itemType) => {
  return prisma.mUser.findMany({
    where:
      itemType === "Atlet"
        ? { uidAtlet: { in: data } }
        : { uidPelatih: { in: data } },
  });
};

export const updateEmailStatus = async (data, itemType) => {
  const updateStatus = await prisma.mUser.updateMany({
    where:
      itemType === "Atlet"
        ? { uidAtlet: { in: data } }
        : { uidPelatih: { in: data } },
    data: {
      hasEmailSent: true,
      emailSentTime: new Date(),
    },
  });

  return updateStatus;
};
