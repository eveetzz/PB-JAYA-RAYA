import express from "express";
import {
  addAthlete,
  editDataAthlete,
  fetchDataAthlete,
  softDeleteAthlete,
} from "./athlete.service.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../../utils/cloudinary.js";
import { getAthletes } from "./athlete.repository.js";
import { appError } from "../../utils/errorHandler.js";
import { successResponse } from "../../utils/errorResponse.js";
import { HTTP_STATUS } from "../../templates/http.template.js";

const router = express.Router();

export const addAthleteController = async (req, res, next) => {
  try {
    const data = req.body;
    const getFile = req.file.buffer;

    const userUid = req.user.uidUser;

    const result = await addAthlete(data, userUid, getFile);

    return successResponse(
      res,
      result,
      "Berhasil menambahkan data atlet",
      HTTP_STATUS.CREATED,
    );
  } catch (error) {
    next(error);
  }
};

export const fetchAthletesController = async (req, res, next) => {
  try {
    const data = await fetchDataAthlete();

    return successResponse(
      res,
      data,
      "Berhasil mengambil data atlet",
      HTTP_STATUS.OK,
    );
  } catch (error) {
    next(error);
  }
};

export const editAthleteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userUid = req.user.uidUser;
    const updatedData = req.body;

    const result = await editDataAthlete(id, userUid, updatedData);

    return successResponse(
      res,
      result,
      "Data berhasil diperbarui",
      HTTP_STATUS.OK,
    );
  } catch (error) {
    next(error);
  }
};

export const deleteAthleteController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userUid = req.user.uidUser;

    const result = await softDeleteAthlete(id, userUid);

    return successResponse(
      res,
      result,
      "Data berhasil dihapus",
      HTTP_STATUS.OK,
    );
  } catch (error) {
    next(error);
  }
};

export default router;
