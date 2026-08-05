import express from "express";
import { addAthlete, softDeleteAthlete } from "./athlete.service.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { uploadMiddleware } from "../../utils/cloudinary.js";
import { getAthletes } from "./athlete.repository.js";

const router = express.Router();

export const addAthleteController = async (req, res) => {
  try {
    const data = req.body;
    const getFile = req.file.buffer;

    if (!data.namaLengkap || !data.nik) {
      return res
        .status(400)
        .json({ message: "mohon lengkapi data yang dibutuhkan" });
    }

    const userUid = req.user.uidUser;

    const result = await addAthlete(data, userUid, getFile);

    res.json({ data: result, message: "Berhasil menambahkan data atlet" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};

export const fetchAthletesController = async (req, res) => {
  try {
    const data = await getAthletes();
    res.json({ data: data, message: "Berhasil mengambil data atlet" });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Data tidak ditemukan", error: error.message });
  }
};

export const deleteAthleteController = async (req, res) => {
  try {
    const { id } = req.params;
    const userUid = req.user.uidUser;

    const result = await softDeleteAthlete(id, userUid);

    res.status(200).json({ message: "Data berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};

export default router;
