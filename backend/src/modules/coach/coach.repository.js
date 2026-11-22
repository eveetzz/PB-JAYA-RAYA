import { prisma } from "../../config/db.js";

export const createCoach = async (data, userUid, filePaths, rolePelatih, sektorList) => {
  const results = await prisma.$transaction(async (r) => {
    const addCoachData = await r.mPelatih.create({
      data: {
        nik: data.nik,
        namaLengkap: data.namaLengkap,
        jenisKelamin: data.jenisKelamin,
        tanggalLahir: new Date(data.tanggalLahir),
        tahunBergabung: parseInt(data.tahunBergabung) || new Date().getFullYear(),
        kewarganegaraan: data.kewarganegaraan || "Indonesia",
        pernahMelatihSebelumnya: data.pernahMelatihSebelumnya === "true" || data.pernahMelatihSebelumnya === true,
        klubNegaraSebelumnya: data.klubNegaraSebelumnya || null,
        statusPelatih: data.statusPelatih || "Aktif",
        foto: filePaths.foto,
        fileSertifikasiKota: filePaths.fileSertifikasiKota,
        fileSertifikasiProvinsi: filePaths.fileSertifikasiProvinsi,
        fileSertifikasiNasional: filePaths.fileSertifikasiNasional,
        fileSertifikasiBwf1: filePaths.fileSertifikasiBwf1,
        fileSertifikasiBwf2: filePaths.fileSertifikasiBwf2,
        fileSertifikasiSarjanaOlahraga: filePaths.fileSertifikasiSarjanaOlahraga,
        fileSertifikasiMasterOlahraga: filePaths.fileSertifikasiMasterOlahraga,
        createdBy: userUid,
        updatedBy: userUid,
      },
    });

    if (rolePelatih.length > 0) {
      await r.rPelatihJenis.createMany({
        data: rolePelatih.map((jenis) => ({
          uidPelatih: addCoachData.uidPelatih,
          jenisPelatih: jenis,
          startDate: new Date(),
          createdBy: userUid,
          updatedBy: userUid,
        })),
      });
    }

    if (sektorList.length > 0) {
      await r.rPelatihSektor.createMany({
        data: sektorList.map((uidSektor) => ({
          uidPelatih: addCoachData.uidPelatih,
          uidSektor: uidSektor,
          startDate: new Date(),
          createdBy: userUid,
          updatedBy: userUid,
        })),
      });
    }

    return addCoachData;
  });

  return results;
};

export const findByNik = async (nik) => {
  return await prisma.mPelatih.findFirst({
    where: {
      nik: nik,
      deletedAt: null,
    },
  });
};

export const getCoaches = async () => {
  return await prisma.mPelatih.findMany({
    where: {
      deletedAt: null,
    },
  });
};

export const softDeleteCoachRepo = async (id, userUid) => {
  return await prisma.$transaction(async (r) => {
    const coach = await r.mPelatih.update({
      where: {
        uidPelatih: id,
      },
      data: {
        statusPelatih: "Nonaktif",
        deletedAt: new Date(),
        deletedBy: userUid,
      },
    });

    await r.mUser.updateMany({
      where: { uidPelatih: id },
      data: {
        statusAkun: "Nonaktif",
        deletedAt: new Date(),
        deletedBy: userUid,
      },
    });

    return coach;
  });
};

export const setJenisFromSektor = async (uidSektor) => {
  if (!uidSektor || uidSektor.length === 0) return [];

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

  return kategori.map((k) => (k === "Fisik" ? "pelatih_fisik" : "pelatih_teknik"));
};
