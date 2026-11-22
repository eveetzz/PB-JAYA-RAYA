import { appError } from "../../utils/errorHandler.js";
import {
  createOfficial,
  findByNik,
  findByUid,
  getOfficials,
  softDeleteOfficialRepo,
} from "./official.repository.js";

export const addOfficial = async (data, userUid, fotoPath) => {
  const existing = await findByNik(data.nik);
  if (existing) {
    throw appError("Official dengan NIK tersebut sudah terdaftar", 409);
  }

  const dataOfficial = await createOfficial(data, userUid, fotoPath);
  return dataOfficial;
};

export const fetchDataOfficial = async () => {
  const data = await getOfficials();
  if (!data) {
    throw appError("Data official tidak ditemukan", 404);
  }
  return data;
};

export const softDeleteOfficial = async (id, userUid) => {
  const isExists = await findByUid(id);
  if (!isExists) {
    throw appError("Data official tidak ditemukan atau sudah terhapus", 404);
  }

  return await softDeleteOfficialRepo(id, userUid);
};
