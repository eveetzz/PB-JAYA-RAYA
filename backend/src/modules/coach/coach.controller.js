import express from "express";
import { addCoach, getAllCoaches } from "./coach.service.js";
import {
  authenticate,
  authorize,
  protect,
} from "../../middlewares/auth.middleware.js";
import { softDeleteCoach } from "./coach.repository.js";
import { uploadMiddleware } from "../../utils/cloudinary.js";

export const fetchCoachesController = async (req, res) => {
  try {
    const data = await getAllCoaches();

    res.send({ data: data, message: "Berhasil mengambil data pelatih" });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Data tidak ditemukan", error: error.message });
  }
};

export const addCoachController = async (req, res) => {
  try {
    const data = req.body;
    const getFile = req.file.buffer;

    if (!data.namaLengkap || !data.nik) {
      return res
        .status(400)
        .json({ message: "mohon lengkapi data yang dibutuhkan" });
    }

    const userUid = req.user.uidUser;

    const result = await addCoach(data, userUid, getFile);

    res.json({ data: result, message: "Berhasil menambahkan data pelatih" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};

export const deleteCoachController = async (req, res) => {
  try {
    const { id } = req.params;
    const userUid = req.user.uidUser;

    const result = await softDeleteCoach(id, userUid);

    res.status(200).json({ message: "Data berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "internal server error", error: error.message });
  }
};
