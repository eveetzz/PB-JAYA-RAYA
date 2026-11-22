import Joi from "joi";

const jenis_kelamin = ["L", "P"];
const status_aktivitas = ["Aktif", "Nonaktif"];

export const createCoachSchema = Joi.object({
  nik: Joi.string().max(20).required().messages({
    "string.max": "NIK maksimal 20 karakter",
    "any.required": "NIK wajib diisi",
  }),
  namaLengkap: Joi.string().max(100).required().messages({
    "string.max": "Nama lengkap maksimal 100 karakter",
    "any.required": "Nama lengkap wajib diisi",
  }),
  jenisKelamin: Joi.string()
    .valid(...jenis_kelamin)
    .required()
    .messages({
      "any.only": `Jenis kelamin harus salah satu dari: ${jenis_kelamin.join(", ")}`,
      "any.required": "Jenis kelamin wajib diisi",
    }),
  tanggalLahir: Joi.date().iso().required().messages({
    "date.base": "Tanggal lahir harus format tanggal (YYYY-MM-DD)",
    "any.required": "Tanggal lahir wajib diisi",
  }),
  tahunBergabung: Joi.number().integer().min(1900).max(new Date().getFullYear()).required().messages({
    "number.base": "Tahun bergabung harus berupa angka",
    "any.required": "Tahun bergabung wajib diisi",
  }),
  kewarganegaraan: Joi.string().max(50).default("Indonesia").messages({
    "string.max": "Kewarganegaraan maksimal 50 karakter",
  }),
  pernahMelatihSebelumnya: Joi.boolean().default(false),
  klubNegaraSebelumnya: Joi.string().max(100).allow(null, "").optional(),
  statusPelatih: Joi.string()
    .valid(...status_aktivitas)
    .default("Aktif"),
});

export const updateCoachSchema = Joi.object({
  nik: Joi.string().max(20).optional(),
  namaLengkap: Joi.string().max(100).optional(),
  jenisKelamin: Joi.string().valid(...jenis_kelamin).optional(),
  tanggalLahir: Joi.date().iso().optional(),
  tahunBergabung: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  kewarganegaraan: Joi.string().max(50).optional(),
  pernahMelatihSebelumnya: Joi.boolean().optional(),
  klubNegaraSebelumnya: Joi.string().max(100).allow(null, "").optional(),
  statusPelatih: Joi.string().valid(...status_aktivitas).optional(),
}).min(1);
