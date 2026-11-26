import express from "express";
import { fetchSektorsController } from "./sektor.controller.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect(), fetchSektorsController);

export default router;