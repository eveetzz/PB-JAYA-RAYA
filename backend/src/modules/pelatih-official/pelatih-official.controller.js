import { successResponse } from "../../utils/errorResponse.js";
import { fetchPelatihOfficial } from "./pelatih-official.service.js";

export const fetchPelatihOfficialController = async (req, res, next) => {
  try {
    const data = await fetchPelatihOfficial(req.query);
    return successResponse(
      res,
      data,
      "Berhasil mengambil data pelatih dan official",
    );
  } catch (error) {
    next(error);
  }
};