import express from "express";
import {
  checkAuthController,
  loginController,
  logoutController,
} from "./auth.controller.js";
import { authenticate, protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", loginController);

// protected routes
router.get("/me", protect(), checkAuthController);
router.post("/logout", protect(), logoutController);

export default router;
