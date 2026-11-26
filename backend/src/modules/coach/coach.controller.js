import { successResponse } from "../../utils/errorResponse.js";
import { appError } from "../../utils/errorHandler.js";
import {
  addCoach,
  downloadCoachTemplate,
  editCoach,
  getAllCoaches,
  getCoachDetail,
  importExcelCoaches,
  softDeleteCoach,
} from "./coach.service.js";

export const fetchCoachesController = async (req, res, next) => {
  try {
    const data = await getAllCoaches(req.query);
    return successResponse(res, data, "Berhasil mengambil data pelatih");
  } catch (error) {
    next(error);
  }
};

export const fetchCoachByIdController = async (req, res, next) => {
  try {
    // Role Pelatih hanya boleh melihat detail miliknya sendiri.
    if (req.user.role === "Pelatih" && req.user.uidPelatih !== req.params.id) {
      throw appError("Hak akses tidak tersedia untuk role ini", 403);
    }

    const data = await getCoachDetail(req.params.id);
    return successResponse(res, data, "Berhasil mengambil detail pelatih");
  } catch (error) {
    next(error);
  }
};

export const addCoachController = async (req, res, next) => {
  try {
    const data = req.body;
    const files = req.files || {};
    const userUid = req.user.uidUser;

    const result = await addCoach(data, userUid, files);

    return successResponse(
      res,
      result,
      "Berhasil menambahkan data pelatih",
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const editCoachController = async (req, res, next) => {
  try {
    const result = await editCoach(
      req.params.id,
      req.body,
      req.user.uidUser,
      req.files || {},
    );

    return successResponse(res, result, "Berhasil memperbarui data pelatih");
  } catch (error) {
    next(error);
  }
};

export const importExcelCoachController = async (req, res, next) => {
  try {
    const dryRun = String(req.body?.dryRun ?? req.query?.dryRun) !== "false";
    const result = await importExcelCoaches(req.file, req.user.uidUser, {
      dryRun,
    });

    return successResponse(
      res,
      result,
      dryRun
        ? "Cek data selesai"
        : `Berhasil mengimport ${result.created} data pelatih`,
    );
  } catch (error) {
    next(error);
  }
};

export const downloadCoachTemplateController = async (req, res, next) => {
  try {
    const buffer = await downloadCoachTemplate();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="template-import-pelatih.xlsx"',
    );

    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const deleteCoachController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userUid = req.user.uidUser;

    await softDeleteCoach(id, userUid);

    return successResponse(res, null, "Data berhasil dihapus");
  } catch (error) {
    next(error);
  }
};