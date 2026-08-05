import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { PERMISSIONS } from "./permissions.js";
import createError from "http-errors";

// autentikasi token
export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw createError(
        401,
        "Token tidak ditemukan. Silakan login terlebih dahulu.",
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      uidUser: decoded.uidUser,
      email: decoded.email,
      role: decoded.role,
      uidAtlet: decoded.uidAtlet,
      uidPelatih: decoded.uidPelatih,
      permissions: decoded.permissions,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        createError(401, "Token sudah expired. Silakan login ulang."),
      );
    }

    if (error.name === "JsonWebTokenError") {
      return next(createError(401, "Token tidak valid"));
    }
    next(error);
  }
};

// auutentikasi role user
export const authorize = (permissions) => {
  return (req, res, next) => {
    const user = req.user;
    const checkPermissions = PERMISSIONS[permissions];

    if (!checkPermissions) {
      console.error(`[Permission Error] "${permissions}" tidak terdefinisi`);
      return next(createError(500, "Konfigurasi permission tidak valid"));
    }

    // cek role
    if (checkPermissions.role) {
      if (!checkPermissions.role.includes(user.role)) {
        return next(
          createError(403, "Hak akses tidak tersedia untuk role ini"),
        );
      }
    }

    // cek apakah role user adalah pelatih
    if (user.role === "Pelatih") {
      const userRole = user.permissions?.jenis || [];
      const requiredRole = Array.isArray(checkPermissions.jenis)
        ? checkPermissions.jenis
        : [checkPermissions.jenis];

      // cek apakah user terdapat irisan antara jenis user dan jenis yang diminta
      const hasAccess = requiredRole.some((role) => userRole.includes(role));

      if (!hasAccess) {
        return next(
          createError(403, "Hak akses tidak tersedia untuk role ini"),
        );
      }
    }
    next();
  };
};

// wrapper untuk authenticate dan authorize
export const protect = (permissions) => {
  // jika hanya perlu authenticate, hanya perlu memnanggil protect() tanpa parameter
  if (!permissions) {
    return [authenticate];
  }

  return [authenticate, authorize(permissions)];
};

// export const authorizeDev = (allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return next(createError(401, "User tidak terautentikasi"));
//     }
//     if (!allowedRoles.includes(req.user.role)) {
//       return next(
//         createError(403, "Anda tidak memiliki hak akses untuk mengakses ini"),
//       );
//     }
//     next();
//   };
// };
