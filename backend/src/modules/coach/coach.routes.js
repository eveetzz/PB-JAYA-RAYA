import express from "express";
import {
  addCoachController,
  deleteCoachController,
  fetchCoachesController,
} from "./coach.controller.js";
import { uploadMiddleware } from "../../utils/cloudinary.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect("pelatih:dashboard:view"), fetchCoachesController);

router.post(
  "/import-data",
  protect("admin:pelatih:manage"),
  uploadMiddleware,
  addCoachController,
);

router.delete("/delete/:id", protect("admin:pelatih:delete"), deleteCoachController);

export default router;
