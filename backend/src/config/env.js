import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const COOKIE_SECRET = process.env.COOKIE_SECRET;
export const NODE_ENV = process.env.NODE_ENV;
export const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;
export const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME;
