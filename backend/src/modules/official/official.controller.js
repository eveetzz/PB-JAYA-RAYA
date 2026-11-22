import {
  addOfficial,
  fetchDataOfficial,
  softDeleteOfficial,
} from "./official.service.js";

export const fetchOfficialsController = async (req, res, next) => {
  try {
    const officials = await fetchDataOfficial();
    res.status(200).json({
      status: true,
      message: "Berhasil mengambil data official",
      data: officials,
    });
  } catch (error) {
    next(error);
  }
};

export const addOfficialController = async (req, res, next) => {
  try {
    const userUid = req.user.uidUser;
    const file = req.file ? `/uploads/official/foto/${req.file.filename}` : null;
    const data = await addOfficial(req.body, userUid, file);

    res.status(201).json({
      status: true,
      message: "Berhasil menambahkan data official",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOfficialController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userUid = req.user.uidUser;
    await softDeleteOfficial(id, userUid);

    res.status(200).json({
      status: true,
      message: "Berhasil menghapus data official",
    });
  } catch (error) {
    next(error);
  }
};
