import { prisma } from "../../config/db.js";

export const getSektors = async () => {
  return prisma.mSektor.findMany({
    where: { deletedAt: null },
    select: {
      uidSektor: true,
      namaSektor: true,
      kategori: true,
    },
    orderBy: [{ kategori: "asc" }, { namaSektor: "asc" }],
  });
};

export const getSektorsByIds = async (ids = []) => {
  if (!ids.length) return [];
  return prisma.mSektor.findMany({
    where: {
      uidSektor: { in: ids },
      deletedAt: null,
    },
    select: {
      uidSektor: true,
      namaSektor: true,
      kategori: true,
    },
  });
};