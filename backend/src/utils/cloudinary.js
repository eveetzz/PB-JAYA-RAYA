import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// config multer
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("img"); //nama field di form-data

// fungsi upload cloudinary
export const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `pbjr_apps/${folderName}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    uploadStream.end(fileBuffer);
  });
};

// optimasi size foto
export const getOptimizedUrl = (publicId) => {
  return cloudinary.url(publicId, {
    fetch_format: "auto", // f_auto: Mengubah format ke WebP secara otomatis
    quality: "auto", // q_auto: Mengompres kualitas gambar secara cerdas tanpa merusak visual noticeable
    secure: true,
  });
};
