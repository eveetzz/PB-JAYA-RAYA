import { hash } from "bcrypt";
import {
  createUser,
  createUserWithRelation,
  fetchUser,
  findByEmail,
  findExistingUserByMasterUid,
  findItemByType,
} from "./user-management.repository.js";
import { generatePassword } from "../../utils/authHelper.js";

export const fetchAllUsers = async () => {
  return await fetchUser();
};

export const addUser = async (data) => {
  const existing = await findByEmail(data.email);
  if (existing) {
    throw new Error("Akun dengan email tersebut sudah ada");
  }

  const hashedPassword = await hash(data.password, 12);
  return await createUser(data, hashedPassword);
};

export const assignRole = async (payloadList, userUid, itemType) => {
  const results = {
    totalProcessed: payloadList.length,
    success: [],
    failed: [],
  };

  for (const itemData of payloadList) {
    const { uid, email } = itemData; // payload bisa kirim [{ uid, email }] atau sejenisnya
    try {
      const item = await findItemByType(uid, itemType);
      if (!item) {
        results.failed.push({ uid, reason: `Data ${itemType} tidak terdaftar di sistem` });
        continue;
      }

      if (!email) {
        results.failed.push({ uid, nama: item.namaLengkap, reason: "Email wajib diisi untuk pembuatan akun" });
        continue;
      }

      const existingEmail = await findByEmail(email);
      if (existingEmail) {
        results.failed.push({ uid, nama: item.namaLengkap, reason: "Email sudah digunakan akun lain" });
        continue;
      }

      const existingUser = await findExistingUserByMasterUid(uid, itemType);
      if (existingUser) {
        results.failed.push({ uid, nama: item.namaLengkap, reason: "Akun untuk entitas ini sudah ada" });
        continue;
      }

      const defaultPassword = generatePassword(item.nik);
      const hashedPassword = await hash(defaultPassword, 12);

      await createUserWithRelation(item, email, hashedPassword, itemType, userUid);

      results.success.push({
        uid,
        nama: item.namaLengkap,
        email,
        temporaryPassword: defaultPassword,
        message: "Akun berhasil dibuat. Simpan password untuk diblast secara manual.",
      });
    } catch (err) {
      results.failed.push({ uid, reason: err.message });
    }
  }

  return results;
};
