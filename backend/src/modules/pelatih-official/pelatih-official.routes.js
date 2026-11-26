import express from "express";
import { fetchPelatihOfficialController } from "./pelatih-official.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect(), fetchPelatihOfficialController);

export default router;