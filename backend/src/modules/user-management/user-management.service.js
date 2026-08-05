import bcrypt, { hash } from "bcrypt";
import {
  checkByUids,
  createUser,
  createUserByAssignRoles,
  fetchUser,
  findByEmail,
  findItemType,
  ifUserExists,
  updateEmailStatus,
} from "./user-management.repository.js";
import { findByUid } from "../athlete/athlete.repository.js";
import { generatePassword } from "../../utils/authHelper.js";
// import { sendCredentialEmail } from "../../common/service/brevoService.js";
import { sendCredentialByEmail } from "../../common/service/resend.service.js";

export const addUser = async (data) => {
  const existingData = await findByEmail(data.email);

  if (existingData) {
    throw new Error("Akun dengan email tersebut sudah ada");
  }

  const hashedPassword = await hash(data.password, 12);

  const getData = await createUser(data, hashedPassword);

  return getData;
};

export const assignRoleDev = async (data, userUid) => {
  const results = {
    totalProcessed: data.length,
    success: [],
    failed: [],
  };

  for (const uidAtlet of data) {
    try {
      // PERBAIKAN: Cari berdasarkan item loop (uidAtlet), bukan data (array)
      const atlet = await findByUid(uidAtlet);

      if (!atlet) {
        results.failed.push({
          uid: uidAtlet,
          reason: "Data atlet tidak terdaftar di sistem",
        });
        continue;
      }

      if (!atlet.email) {
        results.failed.push({
          uid: uidAtlet,
          nama: atlet.namaLengkap,
          reason: "Atlet tidak punya email",
        });
        continue; // PERBAIKAN: Tambahkan continue agar tidak lanjut jika email kosong
      }

      const existingUser = await ifUserExists(uidAtlet);

      if (existingUser) {
        results.failed.push({
          uid: uidAtlet,
          nama: atlet.namaLengkap,
          reason: "Akun sudah ada",
        });
        continue;
      }

      // Generate kredensial sementara
      const defaultPassword = generatePassword(atlet.nik);
      const hashedPassword = await hash(defaultPassword, 12);

      // Generate Akun & Hubungkan Relasi
      await createUserByAssignRoles(atlet, hashedPassword, userUid);

      // Kirim kredensial akun lewat Resend
      try {
        await sendCredentialByEmail({
          toEmail: atlet.email,
          toName: atlet.namaLengkap,
          password: defaultPassword,
        });

        results.success.push({
          uid: uidAtlet,
          nama: atlet.namaLengkap,
          emailStatus: "terkirim",
        });
      } catch (emailError) {
        results.success.push({
          uid: uidAtlet,
          nama: atlet.namaLengkap,
          emailStatus: `Gagal Kirim Email: ${emailError.message}`,
        });
      }
    } catch (singleError) {
      results.failed.push({ uid: uidAtlet, reason: singleError.message });
    }
  }

  // PERBAIKAN: Kembalikan objek results saja, jangan mengembalikan res.status() di sini
  return results;
};

export const assignRole = async (data, userUid, itemType) => {
  const results = {
    totalProcessed: data.length,
    success: [],
    failed: [],
  };

  const items = await findItemType(data, itemType);
  const existingUser = await checkByUids(data, itemType);

  const itemKey = itemType === "Atlet" ? "uidAtlet" : "uidPelatih";
  const itemMap = new Map(items.map((i) => [i[itemKey], i]));
  const existingSet = new Set(existingUser.map((u) => u[itemKey]));

  // menampung akun yang sukses dibuat
  const createdAccounts = [];

  for (const uid of data) {
    const item = itemMap.get(uid);

    if (!item) {
      results.failed.push({
        uid,
        reason: `Data ${itemType} tidak terdaftar di sistem`,
      });
      continue;
    }

    if (!item.email) {
      results.failed.push({
        uid,
        nama: item.namaLengkap,
        reason: "Email tidak ditemukan",
      });
      continue;
    }

    if (existingSet.has(uid)) {
      results.failed.push({
        uid,
        nama: item.namaLengkap,
        reason: "Akun sudah ada",
      });
      continue;
    }
    try {
      // Generate kredensial sementara
      const defaultPassword = generatePassword(item.nik);
      const hashedPassword = await hash(defaultPassword, 12);

      // Generate Akun & Hubungkan Relasi
      await createUserByAssignRoles(item, hashedPassword, userUid, itemType);

      // Kirim kredensial akun lewat Resend
      try {
        await sendCredentialByEmail({
          toEmail: item.email,
          toName: item.namaLengkap,
          password: defaultPassword,
        });

        createdAccounts.push(uid); // menyimpan uid yang berhasil dibuat

        results.success.push({
          uid,
          nama: item.namaLengkap,
          emailStatus: "terkirim",
        });
      } catch (emailError) {
        results.success.push({
          uid,
          nama: item.namaLengkap,
          emailStatus: `Gagal Kirim Email: ${emailError.message}`,
        });
      }
    } catch (singleError) {
      results.failed.push({ uid, reason: singleError.message });
    }
  }

  if (createdAccounts.length > 0) {
    await updateEmailStatus(createdAccounts, itemType);
  }

  return results;
};
