import Joi from "joi";

const jenis_kelamin = ["L", "P"];
const status_aktivitas = ["Aktif", "Nonaktif"];

export const createOfficialSchema = Joi.object({
  nik: Joi.string().max(20).required().messages({
    "string.max": "NIK maksimal 20 karakter",
    "any.required": "NIK wajib diisi",
  }),
  namaLengkap: Joi.string().max(100).required().messages({
    "string.max": "Nama lengkap maksimal 100 karakter",
    "any.required": "Nama lengkap wajib diisi",
  }),
  nomorTelp: Joi.string().max(20).required().messages({
    "string.max": "Nomor telepon maksimal 20 karakter",
    "any.required": "Nomor telepon wajib diisi",
  }),
  tempatLahir: Joi.string().max(100).required().messages({
    "string.max": "Tempat lahir maksimal 100 karakter",
    "any.required": "Tempat lahir wajib diisi",
  }),
  tanggalLahir: Joi.date().iso().required().messages({
    "date.base": "Tanggal lahir harus format tanggal (YYYY-MM-DD)",
    "any.required": "Tanggal lahir wajib diisi",
  }),
  jenisKelamin: Joi.string()
    .valid(...jenis_kelamin)
    .required()
    .messages({
      "any.only": `Jenis kelamin harus salah satu dari: ${jenis_kelamin.join(", ")}`,
      "any.required": "Jenis kelamin wajib diisi",
    }),
  statusOfficial: Joi.string()
    .valid(...status_aktivitas)
    .default("Aktif"),
});

export const updateOfficialSchema = Joi.object({
  nik: Joi.string().max(20).optional(),
  namaLengkap: Joi.string().max(100).optional(),
  nomorTelp: Joi.string().max(20).optional(),
  tempatLahir: Joi.string().max(100).optional(),
  tanggalLahir: Joi.date().iso().optional(),
  jenisKelamin: Joi.string().valid(...jenis_kelamin).optional(),
  statusOfficial: Joi.string().valid(...status_aktivitas).optional(),
}).min(1);
