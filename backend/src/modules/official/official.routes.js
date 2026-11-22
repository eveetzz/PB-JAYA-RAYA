import express from "express";
import {
  addOfficialController,
  deleteOfficialController,
  fetchOfficialsController,
} from "./official.controller.js";
import { localUpload } from "../../utils/fileUpload.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { createOfficialSchema } from "./official.validation.js";

const router = express.Router();

router.get("/", protect("admin:official:manage"), fetchOfficialsController);

router.post(
  "/import-data",
  protect("admin:official:manage"),
  localUpload.single("foto"),
  validate(createOfficialSchema),
  addOfficialController,
);

router.delete("/delete/:id", protect("admin:official:delete"), deleteOfficialController);

export default router;
