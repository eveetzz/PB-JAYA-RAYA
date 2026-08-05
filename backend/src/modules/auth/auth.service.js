import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import createError from "http-errors";
import { findByEmailUser, findJenisPelatih } from "./auth.repository.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/env.js";

export const login = async (data) => {
  const user = await findByEmailUser(data.email);

  if (!user) {
    throw createError(401, "Email atau Password salah");
  }

  const validatePassword = await bcrypt.compare(data.password, user.password);

  if (!validatePassword) {
    throw createError(401, "Username atau Password salah");
  }

  if (user.deletedAt) {
    throw createError(403, "Akun telah dinonaktifkan");
  }

  // untuk mengambil jenis pelatih dan stored ke jwt
  let permissions = {};

  if (user.role === "Pelatih" && user.uidPelatih) {
    const checkJenisPelatih = await findJenisPelatih(user);

    permissions = {
      jenis: checkJenisPelatih.map((item) => item.jenisPelatih),
    };
  }

  const token = generateToken(user, permissions);

  return { token, user };
};

// generate token
const generateToken = (user, permissions) => {
  return jwt.sign(
    {
      uidUser: user.uidUser,
      email: user.email,
      role: user.role,
      uidAtlet: user.uidAtlet,
      uidPelatih: user.uidPelatih,
      permissions: permissions,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
};
