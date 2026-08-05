import { prisma } from "../../config/db.js";

export const createCoach = async (data, userUid, img, rolePelatih) => {
  const results = await prisma.$transaction(async (r) => {
    const addCoachData = await r.mPelatih.create({
      data: {
        nik: data.nik,
        email: data.email,
        namaLengkap: data.namaLengkap,
        tanggalLahir: new Date(data.tanggalLahir),
        tahunBergabung: parseInt(data.tahunBergabung),
        pernahMelatihSebelumnya: Boolean(data.pernahMelatihSebelumnya), // Pastikan bertipe Boolean (true/false)
        klubNegaraSebelumnya: data.klubNegaraSebelumnya,
        mantanAtletNasional: Boolean(data.mantanAtletNasional),
        asalKlubNasional: data.asalKlubNasional,
        jenisKelamin: data.jenisKelamin,
        mantanPelatnas: Boolean(data.mantanPelatnas),
        tahunPelatnas: data.tahunPelatnas ? parseInt(data.tahunPelatnas) : null,
        foto: img,
        createdBy: userUid,
        updatedBy: userUid,
      },
    });

    await r.rPelatihJenis.createMany({
      data: rolePelatih.map((jenis) => ({
        uidPelatih: addCoachData.uidPelatih,
        jenisPelatih: jenis,
        startDate: new Date(),
        createdBy: userUid,
        updatedBy: userUid,
      })),
    });

    await r.rPelatihSektor.createMany({
      data: data.uidSektor.map((uidSektor) => ({
        uidPelatih: addCoachData.uidPelatih,
        uidSektor: uidSektor,
        startDate: new Date(),
        createdBy: userUid,
        updatedBy: userUid,
      })),
    });
  });

  return results;
};

export const findByNik = async (nik) => {
  const findData = await prisma.mPelatih.findUnique({
    where: {
      nik: nik,
    },
  });

  return findData;
};

export const getCoaches = async () => {
  const data = await prisma.mPelatih.findMany({
    where: {
      deletedAt: null,
    },
  });

  return data;
};

export const softDeleteCoach = async (id, userUid) => {
  const deleteCoach = prisma.mPelatih.update({
    where: {
      uidPelatih: id,
    },
    data: {
      deletedAt: new Date(),
      deletedBy: userUid,
    },
  });
  return deleteCoach;
};

export const setJenisFromSektor = async (uidSektor) => {
  const sektors = await prisma.mSektor.findMany({
    where: {
      uidSektor: { in: uidSektor },
      deletedAt: null,
    },
    select: {
      kategori: true,
    },
  });

  const kategori = [...new Set(sektors.map((sektor) => sektor.kategori))];

  const jenisPelatih = kategori.map((kategori) => {
    if (kategori === "Fisik") {
      return "pelatih_fisik";
    } else {
      return "pelatih_teknik";
    }
  });

  return jenisPelatih;
};
