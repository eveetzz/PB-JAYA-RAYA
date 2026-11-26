import { successResponse } from "../../utils/errorResponse.js";
import { appError } from "../../utils/errorHandler.js";
import {
  addOfficial,
  downloadOfficialTemplate,
  editDataOfficial,
  fetchDataOfficial,
  getOfficialDetail,
  importExcelOfficials,
  softDeleteOfficial,
} from "./official.service.js";

export const fetchOfficialsController = async (req, res, next) => {
  try {
    const data = await fetchDataOfficial(req.query);
    return successResponse(res, data, "Berhasil mengambil data official");
  } catch (error) {
    next(error);
  }
};

export const fetchOfficialByIdController = async (req, res, next) => {
  try {
    // Role Official hanya boleh melihat detail miliknya sendiri.
    if (req.user.role === "Official" && req.user.uidOfficial !== req.params.id) {
      throw appError("Hak akses tidak tersedia untuk role ini", 403);
    }

    const data = await getOfficialDetail(req.params.id);
    return successResponse(res, data, "Berhasil mengambil detail official");
  } catch (error) {
    next(error);
  }
};

export const addOfficialController = async (req, res, next) => {
  try {
    const userUid = req.user.uidUser;
    const data = await addOfficial(req.body, userUid, req.file);

    return successResponse(
      res,
      data,
      "Berhasil menambahkan data official",
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const editOfficialController = async (req, res, next) => {
  try {
    const data = await editDataOfficial(
      req.params.id,
      req.body,
      req.user.uidUser,
      req.file,
    );

    return successResponse(res, data, "Berhasil memperbarui data official");
  } catch (error) {
    next(error);
  }
};

export const importExcelOfficialController = async (req, res, next) => {
  try {
    const dryRun = String(req.body?.dryRun ?? req.query?.dryRun) !== "false";
    const result = await importExcelOfficials(req.file, req.user.uidUser, {
      dryRun,
    });

    return successResponse(
      res,
      result,
      dryRun
        ? "Cek data selesai"
        : `Berhasil mengimport ${result.created} data official`,
    );
  } catch (error) {
    next(error);
  }
};

export const downloadOfficialTemplateController = async (req, res, next) => {
  try {
    const buffer = await downloadOfficialTemplate();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="template-import-official.xlsx"',
    );

    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

export const deleteOfficialController = async (req, res, next) => {
  try {
    await softDeleteOfficial(req.params.id, req.user.uidUser);
    return successResponse(res, null, "Berhasil menghapus data official");
  } catch (error) {
    next(error);
  }
};