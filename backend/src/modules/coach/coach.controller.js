import { addCoach, getAllCoaches, softDeleteCoach } from "./coach.service.js";

export const fetchCoachesController = async (req, res, next) => {
  try {
    const data = await getAllCoaches();
    res.status(200).json({ status: true, message: "Berhasil mengambil data pelatih", data });
  } catch (error) {
    next(error);
  }
};

export const addCoachController = async (req, res, next) => {
  try {
    const data = req.body;
    const files = req.files || {};
    const userUid = req.user.uidUser;

    const result = await addCoach(data, userUid, files);

    res.status(201).json({ status: true, message: "Berhasil menambahkan data pelatih", data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteCoachController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userUid = req.user.uidUser;

    await softDeleteCoach(id, userUid);

    res.status(200).json({ status: true, message: "Data berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};
