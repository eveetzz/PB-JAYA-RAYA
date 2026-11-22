import multer from "multer";
import path from "path";
import fs from "fs";

// Helper untuk memastikan direktori ada
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/others";
    const fieldName = file.fieldname;

    if (fieldName.startsWith("atlet") || req.baseUrl.includes("athlete")) {
      folder = fieldName === "foto" ? "uploads/atlet/foto" : "uploads/atlet/dokumen";
    } else if (fieldName.startsWith("pelatih") || req.baseUrl.includes("coach")) {
      folder = fieldName === "foto" ? "uploads/pelatih/foto" : "uploads/pelatih/sertifikasi";
    } else if (fieldName.startsWith("official") || req.baseUrl.includes("official")) {
      folder = "uploads/official/foto";
    }

    const uploadPath = path.join(process.cwd(), folder);
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const localUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit 5MB per file
});
