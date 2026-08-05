import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import {
  addRolesController,
  fetchUsersController,
  registerUserController,
} from "./user-management.controller.js";

const router = express.Router();

router.get("/", protect(), fetchUsersController);

router.post(
  "/register",
  protect("admin:user-management:manage"),
  registerUserController,
);

router.post(
  "/add-roles",
  protect("admin:user-management:assign-roles"),
  addRolesController,
);

export default router;
