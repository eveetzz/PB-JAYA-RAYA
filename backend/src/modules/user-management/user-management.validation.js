import Joi from "joi";

const role_user = ["Admin", "Manajemen", "Atlet", "Pelatih", "Official"];
const status_akun = ["Aktif", "Nonaktif"];

export const registerUserSchema = Joi.object({
  email: Joi.string().email().max(100).required().messages({
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().min(5).optional().messages({
    "string.min": "Password minimal 5 karakter",
  }),
  role: Joi.string()
    .valid(...role_user)
    .required()
    .messages({
      "any.only": `Role harus salah satu dari: ${role_user.join(", ")}`,
      "any.required": "Role wajib diisi",
    }),
});

export const updateEmailSchema = Joi.object({
  email: Joi.string().email().max(100).required().messages({
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
});

export const updateStatusSchema = Joi.object({
  statusAkun: Joi.string()
    .valid(...status_akun)
    .required()
    .messages({
      "any.only": `Status akun harus salah satu dari: ${status_akun.join(", ")}`,
      "any.required": "Status akun wajib diisi",
    }),
});

// Body untuk pembuatan akun dari data personil:
// POST /user/add-roles?type=Atlet  body: [{ uid, email }]
export const addRolesPayloadSchema = Joi.array()
  .items(
    Joi.object({
      uid: Joi.string().required().messages({ "any.required": "UID wajib diisi" }),
      email: Joi.string().email().required().messages({
        "string.email": "Format email tidak valid",
        "any.required": "Email wajib diisi",
      }),
    }),
  )
  .min(1)
  .required()
  .messages({
    "array.min": "Minimal harus ada 1 data dalam payload list",
    "any.required": "Payload list wajib diisi",
  });
