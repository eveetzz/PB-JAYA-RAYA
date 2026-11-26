import { prisma } from "../config/db.js";

const SEKTORS = [
  { namaSektor: "Tunggal Putra", kategori: "Teknik" },
  { namaSektor: "Tunggal Putri", kategori: "Teknik" },
  { namaSektor: "Ganda Putra", kategori: "Teknik" },
  { namaSektor: "Ganda Putri", kategori: "Teknik" },
  { namaSektor: "Ganda Campuran", kategori: "Teknik" },
  { namaSektor: "Fisik", kategori: "Fisik" },
];

async function seedSektor() {
  try {
    for (const sektor of SEKTORS) {
      const existing = await prisma.mSektor.findFirst({
        where: { namaSektor: sektor.namaSektor, deletedAt: null },
      });

      if (existing) {
        console.log(`Sektor sudah ada: ${sektor.namaSektor}`);
        continue;
      }

      await prisma.mSektor.create({
        data: {
          ...sektor,
          createdBy: "system",
          updatedBy: "system",
        },
      });

      console.log(`Sektor dibuat: ${sektor.namaSektor}`);
    }
  } catch (error) {
    console.error("Gagal membuat data sektor:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSektor();