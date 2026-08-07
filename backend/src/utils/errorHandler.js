export const appError = (message, statusCode = 500, errors = null) => {
  const error = new Error(message);

  error.name = "AppError";
  error.statusCode = statusCode;
  error.errors = errors;
  error.isOperational = true;

  Error.captureStackTrace(error, appError);

  return error;
};
