import express from "express";
import multer from "multer";
import {
  addOfficialController,
  deleteOfficialController,
  downloadOfficialTemplateController,
  editOfficialController,
  fetchOfficialByIdController,
  fetchOfficialsController,
  importExcelOfficialController,
} from "./official.controller.js";
import { localUpload } from "../../utils/fileUpload.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  createOfficialSchema,
  updateOfficialSchema,
} from "./official.validation.js";

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

router.get("/", protect("admin:official:manage"), fetchOfficialsController);

router.get(
  "/import-template",
  protect("admin:official:manage"),
  downloadOfficialTemplateController,
);

router.post(
  "/import-excel",
  protect("admin:official:manage"),
  excelUpload.single("file"),
  importExcelOfficialController,
);

router.get("/detail/:id", protect(), fetchOfficialByIdController);

router.post(
  "/import-data",
  protect("admin:official:manage"),
  localUpload.single("foto"),
  validate(createOfficialSchema),
  addOfficialController,
);

router.put(
  "/edit/:id",
  protect("admin:official:manage"),
  localUpload.single("foto"),
  validate(updateOfficialSchema),
  editOfficialController,
);

router.delete(
  "/delete/:id",
  protect("admin:official:delete"),
  deleteOfficialController,
);

export default router;