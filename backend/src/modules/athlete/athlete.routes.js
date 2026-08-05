import express from "express";
import {
  addAthleteController,
  deleteAthleteController,
  fetchAthletesController,
} from "./athlete.controller.js";
import { uploadMiddleware } from "../../utils/cloudinary.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect(), fetchAthletesController);

router.post(
  "/import-data",
  protect("admin:athlete:manage"),
  uploadMiddleware,
  addAthleteController,
);

router.delete("/delete/:id", protect("admin:athlete:delete"), deleteAthleteController);

export default router;
