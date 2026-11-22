import { appError } from "../../utils/errorHandler.js";
import {
  assignSektor,
  createAthlete,
  findByNik,
  findByUid,
  getAthletes,
  softDeleteUser,
  updateDataAthlete,
} from "./athlete.repository.js";

export const addAthlete = async (data, userUid, files) => {
  const isExists = await findByNik(data.nik);
  if (isExists) {
    throw appError("Atlet dengan NIK tersebut sudah ada", 409);
  }

  const filePaths = {
    foto: files.foto ? `/uploads/atlet/foto/${files.foto[0].filename}` : null,
    fileSttbSd: files.fileSttbSd ? `/uploads/atlet/dokumen/${files.fileSttbSd[0].filename}` : null,
    fileKk: files.fileKk ? `/uploads/atlet/dokumen/${files.fileKk[0].filename}` : null,
    fileNisnOnline: files.fileNisnOnline ? `/uploads/atlet/dokumen/${files.fileNisnOnline[0].filename}` : null,
    fileAkteKelahiran: files.fileAkteKelahiran ? `/uploads/atlet/dokumen/${files.fileAkteKelahiran[0].filename}` : null,
  };

  const dataAthlete = await createAthlete(data, userUid, filePaths);
  return dataAthlete;
};

export const fetchDataAthlete = async () => {
  const data = await getAthletes();
  if (!data) {
    throw appError("Data tidak ditemukan", 404);
  }
  return data;
};

export const editDataAthlete = async (id, user, data, files) => {
  const isUserExists = await findByUid(id);
  if (!isUserExists) {
    throw appError("Data tidak ditemukan", 404);
  }

  const filePaths = {
    foto: files.foto ? `/uploads/atlet/foto/${files.foto[0].filename}` : isUserExists.foto,
    fileSttbSd: files.fileSttbSd ? `/uploads/atlet/dokumen/${files.fileSttbSd[0].filename}` : isUserExists.fileSttbSd,
    fileKk: files.fileKk ? `/uploads/atlet/dokumen/${files.fileKk[0].filename}` : isUserExists.fileKk,
    fileNisnOnline: files.fileNisnOnline ? `/uploads/atlet/dokumen/${files.fileNisnOnline[0].filename}` : isUserExists.fileNisnOnline,
    fileAkteKelahiran: files.fileAkteKelahiran ? `/uploads/atlet/dokumen/${files.fileAkteKelahiran[0].filename}` : isUserExists.fileAkteKelahiran,
  };

  const updatedData = await updateDataAthlete(id, user, data, filePaths);
  return updatedData;
};

export const assignSektorAthlete = async (id, sektorList, userUid) => {
  if (!Array.isArray(sektorList)) {
    throw appError("Format data harus berupa array", 400);
  }

  const result = await assignSektor(id, sektorList, userUid);
  return result;
};

export const softDeleteAthlete = async (id, userUid) => {
  const isUserExists = await findByUid(id);
  if (!isUserExists) {
    throw appError("Data sudah terhapus", 404);
  }

  const deleteAthlete = await softDeleteUser(id, userUid);
  return deleteAthlete;
};
