import { prisma } from "../../config/db.js";
import {
  createCoach,
  findByNik,
  getCoaches,
  setJenisFromSektor,
} from "./coach.repository.js";
import { getOptimizedUrl, uploadToCloudinary } from "../../utils/cloudinary.js";

export const getAllCoaches = async () => {
  const users = await getCoaches();

  return users;
};

export const addCoach = async (data, userUid, getFile) => {
  const existingData = await findByNik(data.nik);

  if (existingData) {
    throw new Error("Akun tersebut telah terdaftar");
  }

  const cloudinaryResult = await uploadToCloudinary(getFile, "pelatih");
  const optimizedImgUrl = getOptimizedUrl(cloudinaryResult.public_id);

  // ambil array jenis pelatih
  const getRolePelatih = await setJenisFromSektor(data.uidSektor);

  const dataCoach = await createCoach(
    data,
    userUid,
    optimizedImgUrl,
    getRolePelatih,
  );

  return dataCoach;
};
