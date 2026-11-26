import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB, disconnectDB } from "./config/db.js";
import authRoutes from "./modules/auth/auth.routes.js";
import athleteRoutes from "./modules/athlete/athlete.routes.js";
import coachRoutes from "./modules/coach/coach.routes.js";
import officialRoutes from "./modules/official/official.routes.js";
import pelatihOfficialRoutes from "./modules/pelatih-official/pelatih-official.routes.js";
import sektorRoutes from "./modules/sektor/sektor.routes.js";
import userRoutes from "./modules/user-management/user-management.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// static files for local uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

connectDB();

// routes
app.use("/user", userRoutes);
app.use("/auth", authRoutes);
app.use("/athlete", athleteRoutes);
app.use("/coach", coachRoutes);
app.use("/official", officialRoutes);
app.use("/pelatih-official", pelatihOfficialRoutes);
app.use("/sektor", sektorRoutes);

// error handler
app.use(errorHandler);

// initialize server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("server running on port: " + PORT);
});

// error handler
// handle database error
process.on("unhandledRejection", (err) => {
  console.log("Unhandle Rejction: ", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// handle uncaught exception
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception: ", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// graceful shutdown
process.on("SIGTERM", (err) => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});
