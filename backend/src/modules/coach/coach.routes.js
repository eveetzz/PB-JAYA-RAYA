import express from "express";
import {
  addCoachController,
  deleteCoachController,
  fetchCoachesController,
} from "./coach.controller.js";
import { localUpload } from "../../utils/fileUpload.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createCoachSchema, updateCoachSchema } from "./coach.validation.js";

const router = express.Router();

router.get("/", protect("coach:dashboard:view"), fetchCoachesController);

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

router.post(
  "/import-data",
  protect("admin:coach:manage"),
  coachUploads,
  validate(createCoachSchema),
  addCoachController,
);

router.delete("/delete/:id", protect("admin:coach:delete"), deleteCoachController);

export default router;
