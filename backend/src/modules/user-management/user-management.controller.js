import {
  addUser,
  assignRole,
  changeEmail,
  changeStatus,
  fetchAllUsers,
} from "./user-management.service.js";

export const fetchUsersController = async (req, res, next) => {
  try {
    const result = await fetchAllUsers(req.query);

    return res.status(200).json({
      status: "success",
      message: "Berhasil mengambil data pengguna",
      data: result.data,
      meta: result.meta,
      summary: result.summary,
    });
  } catch (error) {
    next(error);
  }
};

export const registerUserController = async (req, res, next) => {
  try {
    const result = await addUser({
      ...req.body,
      createdBy: req.user.uidUser,
    });

    res.status(201).send({
      data: result.user,
      temporaryPassword: result.temporaryPassword,
      message: "Berhasil menambahkan akun",
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmailController = async (req, res, next) => {
  try {
    const { uidUser } = req.params;
    const { email } = req.body;

    const result = await changeEmail(uidUser, email, req.user.uidUser);

    res.status(200).json({
      data: result,
      message: "Email akun berhasil diperbarui",
    });
  } catch (error) {
    next(error);
  }
};

export const updateStatusController = async (req, res, next) => {
  try {
    const { uidUser } = req.params;
    const { statusAkun } = req.body;

    const result = await changeStatus(uidUser, statusAkun, req.user.uidUser);

    res.status(200).json({
      data: result,
      message: `Status akun berhasil diubah menjadi ${statusAkun}`,
    });
  } catch (error) {
    next(error);
  }
};

export const addRolesController = async (req, res, next) => {
  try {
    const userUid = req.user.uidUser;
    const data = req.body;
    const itemType = req.query.type;

    if (!itemType || !["Atlet", "Pelatih", "Official"].includes(itemType)) {
      return res.status(400).json({ message: "Parameter type tidak valid" });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ message: "Pilih data atlet setidaknya 1" });
    }

    const result = await assignRole(data, userUid, itemType);

    res.status(200).json({
      message: `Proses pembuatan akun ${itemType} selesai`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
