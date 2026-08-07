import { appError } from "../utils/errorHandler.js";

export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      stripUnknown: true,
    };
    const { error, value } = schema.validate(req[property], options);

    if (error) {
      const errors = error.details.map((detail) => ({
        // Menggunakan join('.') agar mendukung nested object (misal: "user.profile.name")
        field: detail.path.join("."),
        // Menghapus tanda kutip bawaan Joi agar pesan lebih rapi
        message: detail.message.replace(/"/g, ""),
      }));

      return next(appError("Data yang dikirim tidak valid", 400, errors));
    }
    req[property] = value;
    next();
  };
};
