import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { findByEmailUser, findJenisPelatih } from "./auth.repository.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../../config/env.js";
import { appError } from "../../utils/errorHandler.js";

export const login = async (data) => {
  const user = await findByEmailUser(data.email);

  if (!user) {
    throw appError("Email atau Password salah", 401);
  }

  if (user.statusAkun === "Nonaktif" || user.deletedAt) {
    throw appError("Akun telah dinonaktifkan", 403);
  }

  const validatePassword = await bcrypt.compare(data.password, user.password);

  if (!validatePassword) {
    throw appError("Email atau Password salah", 401);
  }

  let permissions = {};

  if (user.role === "Pelatih" && user.uidPelatih) {
    const checkJenisPelatih = await findJenisPelatih(user);
    permissions = {
      jenis: checkJenisPelatih.map((item) => item.jenisPelatih),
    };
  }

  const token = generateToken(user, permissions);

  return {
    token,
    user: {
      uidUser: user.uidUser,
      email: user.email,
      role: user.role,
      statusAkun: user.statusAkun,
      mustChangePassword: user.mustChangePassword,
      uidAtlet: user.uidAtlet,
      uidPelatih: user.uidPelatih,
      uidOfficial: user.uidOfficial,
      atlet: user.atlet,
      pelatih: user.pelatih,
      official: user.official,
    },
  };
};

const generateToken = (user, permissions) => {
  return jwt.sign(
    {
      uidUser: user.uidUser,
      email: user.email,
      role: user.role,
      uidAtlet: user.uidAtlet,
      uidPelatih: user.uidPelatih,
      uidOfficial: user.uidOfficial,
      permissions: permissions,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
};
