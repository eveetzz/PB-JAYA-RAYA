import {
  createCoach,
  findByNik,
  getCoaches,
  setJenisFromSektor,
  softDeleteCoachRepo,
} from "./coach.repository.js";
import { appError } from "../../utils/errorHandler.js";

export const getAllCoaches = async () => {
  const users = await getCoaches();
  return users;
};

export const addCoach = async (data, userUid, files) => {
  const existingData = await findByNik(data.nik);
  if (existingData) {
    throw appError("Pelatih dengan NIK tersebut telah terdaftar", 409);
  }

  const filePaths = {
    foto: files.foto ? `/uploads/pelatih/foto/${files.foto[0].filename}` : null,
    fileSertifikasiKota: files.fileSertifikasiKota ? `/uploads/pelatih/sertifikasi/${files.fileSertifikasiKota[0].filename}` : null,
    fileSertifikasiProvinsi: files.fileSertifikasiProvinsi ? `/uploads/pelatih/sertifikasi/${files.fileSertifikasiProvinsi[0].filename}` : null,
    fileSertifikasiNasional: files.fileSertifikasiNasional ? `/uploads/pelatih/sertifikasi/${files.fileSertifikasiNasional[0].filename}` : null,
    fileSertifikasiBwf1: files.fileSertifikasiBwf1 ? `/uploads/pelatih/sertifikasi/${files.fileSertifikasiBwf1[0].filename}` : null,
    fileSertifikasiBwf2: files.fileSertifikasiBwf2 ? `/uploads/pelatih/sertifikasi/${files.fileSertifikasiBwf2[0].filename}` : null,
    fileSertifikasiSarjanaOlahraga: files.fileSertifikasiSarjanaOlahraga ? `/uploads/pelatih/sertifikasi/${files.fileSertifikasiSarjanaOlahraga[0].filename}` : null,
    fileSertifikasiMasterOlahraga: files.fileSertifikasiMasterOlahraga ? `/uploads/pelatih/sertifikasi/${files.fileSertifikasiMasterOlahraga[0].filename}` : null,
  };

  const sektorList = typeof data.uidSektor === "string" ? JSON.parse(data.uidSektor) : (data.uidSektor || []);
  const getRolePelatih = await setJenisFromSektor(sektorList);

  const dataCoach = await createCoach(
    data,
    userUid,
    filePaths,
    getRolePelatih,
    sektorList,
  );

  return dataCoach;
};

export const softDeleteCoach = async (id, userUid) => {
  return await softDeleteCoachRepo(id, userUid);
};
