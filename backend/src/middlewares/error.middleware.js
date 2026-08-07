import { errorResponse } from "../utils/errorResponse.js";

export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  if (err.isOperational) {
    return errorResponse(res, err.message, err.statusCode, err.errors);
  }

  return errorResponse(res, "Terjadi kesalahan pada server", 500);
};
