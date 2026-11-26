import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { PERMISSIONS } from "./permissions.js";
// import createError from "http-errors";
import { appError } from "../utils/errorHandler.js";

// autentikasi token
export const authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw appError(
        "Token tidak ditemukan. Silakan login terlebih dahulu.",
        401,
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      uidUser: decoded.uidUser,
      email: decoded.email,
      role: decoded.role,
      uidAtlet: decoded.uidAtlet,
      uidPelatih: decoded.uidPelatih,
      uidOfficial: decoded.uidOfficial,
      permissions: decoded.permissions,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(appError("Token sudah expired. Silakan login ulang.", 401));
    }

    if (error.name === "JsonWebTokenError") {
      return next(appError("Token tidak valid", 401));
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
      return next(appError("Konfigurasi permission tidak valid", 500));
    }

    // cek role
    if (checkPermissions.role) {
      if (!checkPermissions.role.includes(user.role)) {
        return next(appError("Hak akses tidak tersedia untuk role ini", 403));
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
        return next(appError("Hak akses tidak tersedia untuk role ini", 403));
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
