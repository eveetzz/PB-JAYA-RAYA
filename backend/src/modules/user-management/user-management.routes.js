import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { registerUserSchema, addRolesSchema } from "./user-management.validation.js";
import {
  addRolesController,
  fetchUsersController,
  registerUserController,
} from "./user-management.controller.js";

const router = express.Router();

router.get("/", protect(), fetchUsersController);

router.post(
  "/register",
  protect("admin:user:manage"),
  validate(registerUserSchema),
  registerUserController,
);

router.post(
  "/add-roles",
  protect("admin:user:assign-roles"),
  validate(addRolesSchema),
  addRolesController,
);

export default router;
