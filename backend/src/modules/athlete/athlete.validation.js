import Joi from "joi";

// enum
const jenis_kelamin = ["L", "P"];
const pegangan_raket = ["Kanan", "Kiri"];
const status_atlet = ["Aktif", "Cedera", "Pensiun", "Pelatnas"];

export const createAtletSchema = Joi.object({
  nik: Joi.string().max(20).required().messages({
    "string.max": "NIK maksimal 20 karakter",
    "any.required": "NIK wajib diisi",
  }),
  idPbsi: Joi.string().max(20).required().messages({
    "string.max": "ID PBSI maksimal 20 karakter",
    "any.required": "ID PBSI wajib diisi",
  }),
  email: Joi.string().email().max(50).required().messages({
    "string.email": "Format email tidak valid",
    "string.max": "Email maksimal 50 karakter",
    "any.required": "Email wajib diisi",
  }),
  namaLengkap: Joi.string().max(100).required().messages({
    "string.max": "Nama lengkap maksimal 100 karakter",
    "any.required": "Nama lengkap wajib diisi",
  }),
  namaAyah: Joi.string().max(100).required().messages({
    "string.max": "Nama ayah maksimal 100 karakter",
    "any.required": "Nama ayah wajib diisi",
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
  tinggiBadan: Joi.number().integer().min(50).max(250).required().messages({
    "number.base": "Tinggi badan harus berupa angka",
    "number.integer": "Tinggi badan harus bilangan bulat",
    "number.min": "Tinggi badan minimal 50 cm",
    "number.max": "Tinggi badan maksimal 250 cm",
    "any.required": "Tinggi badan wajib diisi",
  }),
  beratBadan: Joi.number().integer().min(10).max(300).required().messages({
    "number.base": "Berat badan harus berupa angka",
    "number.integer": "Berat badan harus bilangan bulat",
    "number.min": "Berat badan minimal 10 kg",
    "number.max": "Berat badan maksimal 300 kg",
    "any.required": "Berat badan wajib diisi",
  }),
  statusAtlet: Joi.string()
    .valid(...status_atlet)
    .required()
    .messages({
      "any.only": `Status atlet harus salah satu dari: ${status_atlet.join(", ")}`,
      "any.required": "Status atlet wajib diisi",
    }),
  foto: Joi.string().max(255).allow(null, "").optional().messages({
    "string.max": "URL foto maksimal 255 karakter",
  }),
  uidProvinsi: Joi.string().max(10).required().messages({
    "string.max": "UID Provinsi maksimal 10 karakter",
    "any.required": "UID Provinsi wajib diisi",
  }),
});

// update schema
export const updateAtletSchema = Joi.object({
  nik: Joi.string().max(20).optional(),
  idPbsi: Joi.string().max(20).optional(),
  email: Joi.string().email().max(50).optional(),
  namaLengkap: Joi.string().max(100).optional(),
  namaAyah: Joi.string().max(100).optional(),
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
  tinggiBadan: Joi.number().integer().min(50).max(250).optional(),
  beratBadan: Joi.number().integer().min(10).max(300).optional(),
  statusAtlet: Joi.string()
    .valid(...status_atlet)
    .optional(),
  foto: Joi.string().max(255).allow(null, "").optional(),
  uidProvinsi: Joi.string().max(10).optional(),
})
  .min(1)
  .messages({
    "object.min": "Minimal harus ada 1 data yang dikirim untuk diupdate",
  });
