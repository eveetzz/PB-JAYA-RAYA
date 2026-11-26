import express from "express";
import multer from "multer";
import {
  addCoachController,
  deleteCoachController,
  downloadCoachTemplateController,
  editCoachController,
  fetchCoachByIdController,
  fetchCoachesController,
  importExcelCoachController,
} from "./coach.controller.js";
import { localUpload } from "../../utils/fileUpload.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createCoachSchema, updateCoachSchema } from "./coach.validation.js";

const router = express.Router();

const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error("File harus berupa .xlsx atau .xls"));
  },
});

const coachUploads = localUpload.fields([
  { name: "foto", maxCount: 1 },
  { name: "fileSertifikasiKota", maxCount: 1 },
  { name: "fileSertifikasiProvinsi", maxCount: 1 },
  { name: "fileSertifikasiNasional", maxCount: 1 },
  { name: "fileSertifikasiBwf1", maxCount: 1 },
  { name: "fileSertifikasiBwf2", maxCount: 1 },
  { name: "fileSertifikasiSarjanaOlahraga", maxCount: 1 },
  { name: "fileSertifikasiMasterOlahraga", maxCount: 1 },
]);

router.get("/", protect("coach:dashboard:view"), fetchCoachesController);

router.get(
  "/import-template",
  protect("admin:coach:manage"),
  downloadCoachTemplateController,
);

router.post(
  "/import-excel",
  protect("admin:coach:manage"),
  excelUpload.single("file"),
  importExcelCoachController,
);

router.get("/detail/:id", protect(), fetchCoachByIdController);

router.post(
  "/import-data",
  protect("admin:coach:manage"),
  coachUploads,
  validate(createCoachSchema),
  addCoachController,
);

router.put(
  "/edit/:id",
  protect("admin:coach:manage"),
  coachUploads,
  validate(updateCoachSchema),
  editCoachController,
);

router.delete(
  "/delete/:id",
  protect("admin:coach:delete"),
  deleteCoachController,
);

export default router;