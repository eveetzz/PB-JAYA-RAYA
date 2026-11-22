import {
  addAthlete,
  assignSektorAthlete,
  editDataAthlete,
  fetchDataAthlete,
  softDeleteAthlete,
} from "./athlete.service.js";
import { appError } from "../../utils/errorHandler.js";
import { successResponse } from "../../utils/errorResponse.js";
import { HTTP_STATUS } from "../../templates/http.template.js";

export const addAthleteController = async (req, res, next) => {
  try {
    const data = req.body;
    const files = req.files || {};
    const userUid = req.user.uidUser;

    const result = await addAthlete(data, userUid, files);

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
    const files = req.files || {};

    const result = await editDataAthlete(id, userUid, updatedData, files);

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

export const assignSektorController = async (req, res, next) => {
  try {
    const uidAtlet = req.params.id;
    const { sektorList } = req.body;
    const userUid = req.user.uidUser;

    if (!sektorList || !Array.isArray(sektorList)) {
      throw appError("Harus berisi array", 400);
    }

    const result = await assignSektorAthlete(uidAtlet, sektorList, userUid);

    return successResponse(
      res,
      result,
      "Berhasil menambahkan sektor",
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
