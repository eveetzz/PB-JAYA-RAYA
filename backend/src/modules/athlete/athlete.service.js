import { getOptimizedUrl, uploadToCloudinary } from "../../utils/cloudinary.js";
import { appError } from "../../utils/errorHandler.js";
import {
  createAthlete,
  findByNik,
  findByUid,
  getAthletes,
  softDeleteUser,
  updateDataAthlete,
} from "./athlete.repository.js";

export const addAthlete = async (data, userUid, getFile) => {
  const isUserExists = await findByUid(data.uidAtlet);

  if (isUserExists) {
    throw appError("Data tersebut sudah ada", 409);
  }

  const cloudinaryResult = await uploadToCloudinary(getFile, "atlet");
  const optimizedImgUrl = getOptimizedUrl(cloudinaryResult.public_id);

  const dataAthlete = await createAthlete(data, userUid, optimizedImgUrl);

  return dataAthlete;
};

export const fetchDataAthlete = async () => {
  const data = await getAthletes();

  if (!data) {
    throw appError("Data tidak ditemukan", 404);
  }

  return data;
};

export const editDataAthlete = async (id, user, data) => {
  const isUserExists = await findByUid(id);

  if (!isUserExists) {
    throw appError("Data tidak ditemukan", 404);
  }

  const updatedData = await updateDataAthlete(id, user, data);

  return updatedData;
};

export const softDeleteAthlete = async (id, userUid) => {
  const isUserExists = await findByUid(id);

  if (!isUserExists) {
    throw appError("Data sudah terhapus", 404);
  }

  const deleteAthlete = await softDeleteUser(id, userUid);

  return deleteAthlete;
};
