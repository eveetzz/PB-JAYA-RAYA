import { getOptimizedUrl, uploadToCloudinary } from "../../utils/cloudinary.js";
import {
  createAthlete,
  findByNik,
  findByUid,
  softDeleteUser,
} from "./athlete.repository.js";

export const addAthlete = async (data, userUid, getFile) => {
  const isUserExists = await findByNik(data.nik);

  if (isUserExists) {
    throw new Error("Data tersebut sudah ada");
  }

  const cloudinaryResult = await uploadToCloudinary(getFile, "atlet");
  const optimizedImgUrl = getOptimizedUrl(cloudinaryResult.public_id);

  const dataAthlete = await createAthlete(data, userUid, optimizedImgUrl);

  return dataAthlete;
};

export const softDeleteAthlete = async (id, userUid) => {
  const isUserExists = await findByUid(id);

  if (!isUserExists) {
    throw new Error("Data sudah terhapus");
  }

  const deleteAthlete = await softDeleteUser(id, userUid);

  return deleteAthlete;
};
