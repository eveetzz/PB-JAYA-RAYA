import Joi from "joi";

const role_user = ["Admin", "Manajemen", "Atlet", "Pelatih", "Official"];

export const registerUserSchema = Joi.object({
  email: Joi.string().email().max(100).required().messages({
    "string.email": "Format email tidak valid",
    "any.required": "Email wajib diisi",
  }),
  password: Joi.string().min(5).required().messages({
    "string.min": "Password minimal 5 karakter",
    "any.required": "Password wajib diisi",
  }),
  role: Joi.string()
    .valid(...role_user)
    .required()
    .messages({
      "any.only": `Role harus salah satu dari: ${role_user.join(", ")}`,
      "any.required": "Role wajib diisi",
    }),
});

export const addRolesSchema = Joi.object({
  itemType: Joi.string().valid("Atlet", "Pelatih", "Official").required().messages({
    "any.required": "Item type wajib diisi",
    "any.only": "Item type harus Atlet, Pelatih, atau Official",
  }),
  payloadList: Joi.array()
    .items(
      Joi.object({
        uid: Joi.string().required().messages({ "any.required": "UID wajib diisi" }),
        email: Joi.string().email().required().messages({
          "string.email": "Format email tidak valid",
          "any.required": "Email wajib diisi",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.min": "Minimal harus ada 1 data dalam payload list",
      "any.required": "Payload list wajib diisi",
    }),
});
