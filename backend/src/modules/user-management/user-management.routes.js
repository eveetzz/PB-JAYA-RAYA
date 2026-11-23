import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  addRolesPayloadSchema,
  registerUserSchema,
  updateEmailSchema,
  updateStatusSchema,
} from "./user-management.validation.js";
import {
  addRolesController,
  fetchUsersController,
  registerUserController,
  updateEmailController,
  updateStatusController,
} from "./user-management.controller.js";

const router = express.Router();

router.get("/", protect("admin:user:manage"), fetchUsersController);

router.post(
  "/register",
  protect("admin:user:manage"),
  validate(registerUserSchema),
  registerUserController,
);

router.patch(
  "/:uidUser/email",
  protect("admin:user:manage"),
  validate(updateEmailSchema),
  updateEmailController,
);

router.patch(
  "/:uidUser/status",
  protect("admin:user:manage"),
  validate(updateStatusSchema),
  updateStatusController,
);

router.post(
  "/add-roles",
  protect("admin:user:assign-roles"),
  validate(addRolesPayloadSchema),
  addRolesController,
);

export default router;
