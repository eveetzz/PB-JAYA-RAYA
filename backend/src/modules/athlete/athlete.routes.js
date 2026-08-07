import express from "express";
import {
  addAthleteController,
  deleteAthleteController,
  editAthleteController,
  fetchAthletesController,
} from "./athlete.controller.js";
import { uploadMiddleware } from "../../utils/cloudinary.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createAtletSchema, updateAtletSchema } from "./athlete.validation.js";

const router = express.Router();

router.get("/", protect(), fetchAthletesController);

router.post(
  "/import-data",
  protect("admin:athlete:manage"),
  uploadMiddleware,
  validate(createAtletSchema),
  addAthleteController,
);

router.patch(
  "/edit/:id",
  protect("admin:athlete:manage"),
  uploadMiddleware,
  validate(updateAtletSchema),
  editAthleteController,
);

router.delete(
  "/delete/:id",
  protect("admin:athlete:delete"),
  deleteAthleteController,
);

export default router;
