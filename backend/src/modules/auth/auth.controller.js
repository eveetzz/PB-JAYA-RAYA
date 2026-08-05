import express from "express";
import createError from "http-errors";
import { login } from "./auth.service.js";
import { COOKIE_MAX_AGE, NODE_ENV } from "../../config/env.js";
import { findByUidUser } from "./auth.repository.js";

export const loginController = async (req, res, next) => {
  try {
    const data = req.body;

    const result = await login(data);

    res.cookie("token", result.token, cookieOptions);

    // destructure agar token tidak terbawa
    const { token, ...safeResult } = result;

    return res
      .status(200)
      .send({ data: safeResult, message: "Login berhasil" });
  } catch (error) {
    next(error);
  }
};

// mengetahui status login user secara real-time dari backend
export const checkAuthController = async (req, res, next) => {
  try {
    const user = await findByUidUser(req.user.uidUser);

    if (!user) {
      throw createError(401, "Sesi tidak valid");
    }

    if (user.deletedAt) {
      throw createError(403, "Akun telah dinonaktifkan");
    }

    const { password, ...safeUser } = user;

    return res.status(200).json({
      status: "success",
      data: safeUser,
    });
  } catch (error) {
    next(error);
  } 
};

export const logoutController = async (req, res) => {
  try {
    const logoutCookieOptions = {
      ...cookieOptions,
      maxAge: 0,
      expires: new Date(0),
    };

    res.clearCookie("token", logoutCookieOptions);

    return res.status(200).send({ message: "Berhasil logout" });
  } catch (error) {
    next(error);
  }
};

// inisiasi cookies
const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "lax",
  maxAge: COOKIE_MAX_AGE || 24 * 60 * 60 * 1000,
};
