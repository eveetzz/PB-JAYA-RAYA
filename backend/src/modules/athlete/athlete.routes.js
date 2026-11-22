import express from "express";
import {
  addAthleteController,
  assignSektorController,
  deleteAthleteController,
  editAthleteController,
  fetchAthletesController,
} from "./athlete.controller.js";
import { localUpload } from "../../utils/fileUpload.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createAtletSchema, updateAtletSchema } from "./athlete.validation.js";

const router = express.Router();

router.get("/", protect(), fetchAthletesController);

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

export default router;
