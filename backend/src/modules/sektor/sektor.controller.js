import { successResponse } from "../../utils/errorResponse.js";
import { fetchSektors } from "./sektor.service.js";

export const fetchSektorsController = async (req, res, next) => {
  try {
    const data = await fetchSektors();
    return successResponse(res, data, "Berhasil mengambil data sektor");
  } catch (error) {
    next(error);
  }
};