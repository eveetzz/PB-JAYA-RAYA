import express from "express";
import { addUser, assignRole } from "./user-management.service.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";
import { fetchUser } from "./user-management.repository.js";

export const fetchUsersController = async (req, res) => {
  try {
    const getUsers = await fetchUser();

    return res
      .status(200)
      .json({ data: getUsers, message: "Berhasil mengambil data pengguna" });
  } catch (error) {
    res
      .status(404)
      .json({ message: "Data tidak ditemukan", error: error.message });
  }
};

export const registerUserController = async (req, res) => {
    try {
      const data = req.body;

      const result = await addUser(data);

      res.send({ data: result, message: "Berhasil menambahkan akun" });
    } catch (error) {
      res
        .status(500)
        .send({ message: "internal server error", error: error.message });
    }
  }

export const addRolesController = async (req, res, next) => {
    try {
      const userUid = req.user.uidUser; // UID Admin yang sedang login
      const data = req.body; // Array dari uidAtlet [ "id1", "id2" ]
      const itemType = req.query.type;

      // check type item
      if (!itemType || !["Atlet", "Pelatih"].includes(itemType)) {
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
  }

// router.post(
//   "/assign-roles",
//   authenticate,
//   authorize(["Admin", "Manajemen"]),
//   async (req, res, next) => {
//     try {
//       const userUid = req.user.uidUser; // UID Admin yang sedang login
//       const data = req.body; // Array dari uidAtlet [ "id1", "id2" ]

//       if (!data || !Array.isArray(data) || data.length === 0) {
//         return res
//           .status(400)
//           .json({ message: "Pilih data atlet setidaknya 1" });
//       }

//       // PERBAIKAN: Urutan parameter disamakan dengan fungsi service
//       const result = await assignRole(data, userUid);

//       // PERBAIKAN: Mengirimkan hasil laporan dari service secara utuh
//       res.status(200).json({
//         message: "Proses pembuatan akun massal selesai",
//         data: result,
//       });
//     } catch (error) {
//       // PERBAIKAN: Tangkap error ke dalam block catch sebelum dioper ke next()
//       next(error);
//     }
//   },
// );
