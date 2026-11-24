import Joi from "joi";

// enum
const jenis_kelamin = ["L", "P"];
const pegangan_raket = ["Kanan", "Kiri"];
// sinkron dengan enum StatusAktivitas di schema Prisma
const status_atlet = ["Aktif", "Nonaktif"];

export const createAtletSchema = Joi.object({
  nik: Joi.string().max(20).required().messages({
    "string.max": "NIK maksimal 20 karakter",
    "any.required": "NIK wajib diisi",
  }),
  idPbsi: Joi.string().max(20).required().messages({
    "string.max": "ID PBSI maksimal 20 karakter",
    "any.required": "ID PBSI wajib diisi",
  }),
  namaLengkap: Joi.string().max(100).required().messages({
    "string.max": "Nama lengkap maksimal 100 karakter",
    "any.required": "Nama lengkap wajib diisi",
  }),
  namaIbu: Joi.string().max(100).required().messages({
    "string.max": "Nama ibu maksimal 100 karakter",
    "any.required": "Nama ibu wajib diisi",
  }),
  tempatLahir: Joi.string().max(100).required().messages({
    "string.max": "Tempat lahir maksimal 100 karakter",
    "any.required": "Tempat lahir wajib diisi",
  }),
  tanggalLahir: Joi.date().iso().required().messages({
    "date.base": "Tanggal lahir harus berupa format tanggal (YYYY-MM-DD)",
    "any.required": "Tanggal lahir wajib diisi",
  }),
  alamat: Joi.string().required().messages({
    "any.required": "Alamat wajib diisi",
  }),
  jenisKelamin: Joi.string()
    .valid(...jenis_kelamin)
    .required()
    .messages({
      "any.only": `Jenis kelamin harus salah satu dari: ${jenis_kelamin.join(", ")}`,
      "any.required": "Jenis kelamin wajib diisi",
    }),
  peganganRaket: Joi.string()
    .valid(...pegangan_raket)
    .required()
    .messages({
      "any.only": `Pegangan raket harus salah satu dari: ${pegangan_raket.join(", ")}`,
      "any.required": "Pegangan raket wajib diisi",
    }),
  provinsi: Joi.string().max(100).required().messages({
    "string.max": "Provinsi maksimal 100 karakter",
    "any.required": "Provinsi wajib diisi",
  }),
  klubSaatIni: Joi.string().max(100).required().messages({
    "string.max": "Klub saat ini maksimal 100 karakter",
    "any.required": "Klub saat ini wajib diisi",
  }),
  asalKlubSebelumnya: Joi.string().max(100).allow(null, "").optional().messages({
    "string.max": "Asal klub sebelumnya maksimal 100 karakter",
  }),
  gabungSatelitPada: Joi.date().iso().allow(null, "").optional().messages({
    "date.base": "Tanggal gabung satelit harus format tanggal (YYYY-MM-DD)",
  }),
  gabungJayaRayaPada: Joi.date().iso().allow(null, "").optional().messages({
    "date.base": "Tanggal gabung Jaya Raya harus format tanggal (YYYY-MM-DD)",
  }),
  statusAtlet: Joi.string()
    .valid(...status_atlet)
    .optional()
    .messages({
      "any.only": `Status atlet harus salah satu dari: ${status_atlet.join(", ")}`,
    }),
  foto: Joi.string().max(255).allow(null, "").optional().messages({
    "string.max": "URL foto maksimal 255 karakter",
  }),
});

// update schema
export const updateAtletSchema = Joi.object({
  nik: Joi.string().max(20).optional(),
  idPbsi: Joi.string().max(20).optional(),
  namaLengkap: Joi.string().max(100).optional(),
  namaIbu: Joi.string().max(100).optional(),
  tempatLahir: Joi.string().max(100).optional(),
  tanggalLahir: Joi.date().iso().optional(),
  alamat: Joi.string().optional(),
  jenisKelamin: Joi.string()
    .valid(...jenis_kelamin)
    .optional(),
  peganganRaket: Joi.string()
    .valid(...pegangan_raket)
    .optional(),
  provinsi: Joi.string().max(100).optional(),
  klubSaatIni: Joi.string().max(100).optional(),
  asalKlubSebelumnya: Joi.string().max(100).allow(null, "").optional(),
  gabungSatelitPada: Joi.date().iso().allow(null, "").optional(),
  gabungJayaRayaPada: Joi.date().iso().allow(null, "").optional(),
  statusAtlet: Joi.string()
    .valid(...status_atlet)
    .optional(),
  foto: Joi.string().max(255).allow(null, "").optional(),
})
  .min(1)
  .messages({
    "object.min": "Minimal harus ada 1 data yang dikirim untuk diupdate",
  });
