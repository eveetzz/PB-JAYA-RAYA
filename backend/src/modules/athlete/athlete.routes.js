import express from "express";
import {
  addAthleteController,
  assignSektorController,
  deleteAthleteController,
  downloadImportTemplateController,
  editAthleteController,
  fetchAthleteByIdController,
  fetchAthletesController,
  importExcelAthleteController,
} from "./athlete.controller.js";
import multer from "multer";
import { localUpload } from "../../utils/fileUpload.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createAtletSchema, updateAtletSchema } from "./athlete.validation.js";

const router = express.Router();

// Upload Excel hanya di memori (tidak perlu disimpan ke disk)
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

router.get("/", protect(), fetchAthletesController);

router.get(
  "/import-template",
  protect("admin:athlete:manage"),
  downloadImportTemplateController,
);

router.post(
  "/import-excel",
  protect("admin:athlete:manage"),
  excelUpload.single("file"),
  importExcelAthleteController,
);

const athleteUploads = localUpload.fields([
  { name: "foto", maxCount: 1 },
  { name: "fileSttbSd", maxCount: 1 },
  { name: "fileKk", maxCount: 1 },
  { name: "fileNisnOnline", maxCount: 1 },
  { name: "fileAkteKelahiran", maxCount: 1 },
]);

router.post(
  "/import-data",
  protect("admin:athlete:manage"),
  athleteUploads,
  validate(createAtletSchema),
  addAthleteController,
);

router.put(
  "/:id/assign-sektor",
  protect("admin:athlete:manage"),
  assignSektorController,
);

router.patch(
  "/edit/:id",
  protect("admin:athlete:manage"),
  athleteUploads,
  validate(updateAtletSchema),
  editAthleteController,
);

router.delete(
  "/delete/:id",
  protect("admin:athlete:delete"),
  deleteAthleteController,
);

router.get("/:id", protect(), fetchAthleteByIdController);

export default router;
