import { hash } from "bcrypt";
import { randomBytes } from "crypto";
import {
  createUser,
  createUserWithRelation,
  fetchMasterAtlet,
  fetchMasterOfficial,
  fetchMasterPelatih,
  fetchUser,
  findByEmail,
  findByUidUser,
  findExistingUserByMasterUid,
  findItemByType,
  updateEmail,
  updateStatus,
} from "./user-management.repository.js";
import { generatePassword } from "../../utils/authHelper.js";
import { appError } from "../../utils/errorHandler.js";

const ROLE_LABELS = {
  Atlet: "Atlet",
  Pelatih: "Pelatih",
  Official: "Official",
};

const generateTempPassword = () => `PBJR@${randomBytes(3).toString("hex")}`;

// Gabungkan master personil + akun MUser menjadi satu daftar
const buildUserRows = async () => {
  const [users, atlets, pelatihs, officials] = await Promise.all([
    fetchUser(),
    fetchMasterAtlet(),
    fetchMasterPelatih(),
    fetchMasterOfficial(),
  ]);

  const accountByAtlet = new Map();
  const accountByPelatih = new Map();
  const accountByOfficial = new Map();

  users.forEach((u) => {
    if (u.uidAtlet) accountByAtlet.set(u.uidAtlet, u);
    if (u.uidPelatih) accountByPelatih.set(u.uidPelatih, u);
    if (u.uidOfficial) accountByOfficial.set(u.uidOfficial, u);
  });

  const rows = [];

  atlets.forEach((a) => {
    const account = accountByAtlet.get(a.uidAtlet);
    rows.push({
      key: `Atlet:${a.uidAtlet}`,
      uid: a.uidAtlet,
      uidUser: account?.uidUser ?? null,
      nik: a.nik,
      namaLengkap: a.namaLengkap,
      email: account?.email ?? null,
      role: "Atlet",
      statusAkun: account?.statusAkun ?? null,
      hasAccount: Boolean(account),
    });
  });

  pelatihs.forEach((p) => {
    const account = accountByPelatih.get(p.uidPelatih);
    rows.push({
      key: `Pelatih:${p.uidPelatih}`,
      uid: p.uidPelatih,
      uidUser: account?.uidUser ?? null,
      nik: p.nik,
      namaLengkap: p.namaLengkap,
      email: account?.email ?? null,
      role: "Pelatih",
      statusAkun: account?.statusAkun ?? null,
      hasAccount: Boolean(account),
    });
  });

  officials.forEach((o) => {
    const account = accountByOfficial.get(o.uidOfficial);
    rows.push({
      key: `Official:${o.uidOfficial}`,
      uid: o.uidOfficial,
      uidUser: account?.uidUser ?? null,
      nik: o.nik,
      namaLengkap: o.namaLengkap,
      email: account?.email ?? null,
      role: "Official",
      statusAkun: account?.statusAkun ?? null,
      hasAccount: Boolean(account),
    });
  });

  // Akun tanpa relasi master (Admin / Manajemen)
  users.forEach((u) => {
    if (u.uidAtlet || u.uidPelatih || u.uidOfficial) return;
    rows.push({
      key: `User:${u.uidUser}`,
      uid: u.uidUser,
      uidUser: u.uidUser,
      nik: null,
      namaLengkap: u.email.split("@")[0],
      email: u.email,
      role: u.role,
      statusAkun: u.statusAkun,
      hasAccount: true,
      isManual: true,
    });
  });

  return rows.sort((a, b) =>
    a.namaLengkap.localeCompare(b.namaLengkap, "id", { sensitivity: "base" }),
  );
};

const buildSummary = (rows) => {
  const build = (role) => {
    const items = rows.filter((row) => row.role === role);
    return {
      total: items.length,
      punyaAkun: items.filter((row) => row.hasAccount).length,
      belumAkun: items.filter((row) => !row.hasAccount).length,
    };
  };

  return {
    atlet: build("Atlet"),
    pelatih: build("Pelatih"),
    official: build("Official"),
  };
};

export const fetchAllUsers = async (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  const { role, status, search } = query;

  const rows = await buildUserRows();
  const summary = buildSummary(rows);

  let filtered = rows;

  if (role && ROLE_LABELS[role]) {
    filtered = filtered.filter((row) => row.role === role);
  }

  if (status === "punya") {
    filtered = filtered.filter((row) => row.hasAccount);
  } else if (status === "belum") {
    filtered = filtered.filter((row) => !row.hasAccount);
  }

  const keyword = (search || "").trim().toLowerCase();
  if (keyword) {
    filtered = filtered.filter((row) => {
      const nama = (row.namaLengkap || "").toLowerCase();
      const email = (row.email || "").toLowerCase();
      const nik = (row.nik || "").toLowerCase();
      return (
        nama.includes(keyword) ||
        email.includes(keyword) ||
        nik.includes(keyword)
      );
    });
  }

  const total = filtered.length;
  const start = (page - 1) * limit;

  return {
    data: filtered.slice(start, start + limit),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
    summary,
  };
};

export const addUser = async (data) => {
  const existing = await findByEmail(data.email);
  if (existing) {
    throw appError("Akun dengan email tersebut sudah ada", 409);
  }

  const generated = data.password ? null : generateTempPassword();
  const plainPassword = data.password || generated;
  const hashedPassword = await hash(plainPassword, 12);

  const created = await createUser(data, hashedPassword);
  const { password, ...safeUser } = created;

  return {
    user: safeUser,
    temporaryPassword: generated,
  };
};

export const changeEmail = async (uidUser, email, updatedBy) => {
  const user = await findByUidUser(uidUser);
  if (!user) {
    throw appError("Akun tidak ditemukan", 404);
  }

  const existing = await findByEmail(email);
  if (existing && existing.uidUser !== uidUser) {
    throw appError("Email sudah digunakan akun lain", 409);
  }

  const updated = await updateEmail(uidUser, email, updatedBy);
  const { password, ...safeUser } = updated;
  return safeUser;
};

export const changeStatus = async (uidUser, statusAkun, updatedBy) => {
  const user = await findByUidUser(uidUser);
  if (!user) {
    throw appError("Akun tidak ditemukan", 404);
  }

  const updated = await updateStatus(uidUser, statusAkun, updatedBy);
  const { password, ...safeUser } = updated;
  return safeUser;
};

export const assignRole = async (payloadList, userUid, itemType) => {
  const results = {
    totalProcessed: payloadList.length,
    success: [],
    failed: [],
  };

  for (const itemData of payloadList) {
    const { uid, email } = itemData;
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
