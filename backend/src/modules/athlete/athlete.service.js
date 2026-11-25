import { appError } from "../../utils/errorHandler.js";
import {
  assignSektor,
  createAthlete,
  createManyAthletes,
  findManyByNik,
  findByNik,
  findByUid,
  getAthletes,
  softDeleteUser,
  updateDataAthlete,
} from "./athlete.repository.js";
import {
  parseAthleteWorkbook,
  validateImportRows,
  generateAthleteTemplate,
} from "./athlete.importer.js";

export const addAthlete = async (data, userUid, files) => {
  const isExists = await findByNik(data.nik);
  if (isExists) {
    throw appError("Atlet dengan NIK tersebut sudah ada", 409);
  }

  const filePaths = {
    foto: files.foto ? `/uploads/atlet/foto/${files.foto[0].filename}` : null,
    fileSttbSd: files.fileSttbSd ? `/uploads/atlet/dokumen/${files.fileSttbSd[0].filename}` : null,
    fileKk: files.fileKk ? `/uploads/atlet/dokumen/${files.fileKk[0].filename}` : null,
    fileNisnOnline: files.fileNisnOnline ? `/uploads/atlet/dokumen/${files.fileNisnOnline[0].filename}` : null,
    fileAkteKelahiran: files.fileAkteKelahiran ? `/uploads/atlet/dokumen/${files.fileAkteKelahiran[0].filename}` : null,
  };

  const dataAthlete = await createAthlete(data, userUid, filePaths);
  return dataAthlete;
};

export const fetchDataAthlete = async (query, user) => {
  // Role Atlet hanya melihat datanya sendiri. Bila akun belum memiliki
  // uidAtlet (belum terhubung), kembalikan daftar kosong — jangan bocorkan
  // atlet lain.
  if (user.role === "Atlet") {
    if (!user.uidAtlet) {
      const { page = 1, limit = 20 } = query;
      return {
        data: [],
        meta: { totalItems: 0, page: page, limit: limit, totalPages: 1 },
        summary: { total: 0, aktif: 0, incomplete: 0 },
      };
    }
    return getAthletes(query, user.uidAtlet);
  }

  const data = await getAthletes(query);
  return data;
};

export const fetchAthleteById = async (id, user) => {
  if (user.role === "Atlet" && id !== user.uidAtlet) {
    throw appError("Hak akses tidak tersedia untuk role ini", 403);
  }

  const data = await findByUid(id);
  if (!data) {
    throw appError("Data atlet tidak ditemukan", 404);
  }
  return data;
};

// Import Excel: dry-run validasi saja, atau commit bila dryRun=false
export const importExcelAthletes = async (file, userUid, { dryRun }) => {
  if (!file) {
    throw appError("File Excel wajib diunggah", 400);
  }

  let parsed;
  try {
    parsed = await parseAthleteWorkbook(file.buffer);
  } catch {
    throw appError(
      "File tidak dapat dibaca. Pastikan format .xlsx dan gunakan template yang disediakan",
      400,
    );
  }

  if (parsed.missingColumns?.length) {
    throw appError(
      `Kolom wajib tidak ditemukan: ${parsed.missingColumns.join(", ")}`,
      400,
    );
  }

  const { valid, errors } = validateImportRows(parsed.rows);

  // cek duplikat NIK yang sudah ada di database
  if (valid.length) {
    const existing = await findManyByNik(valid.map((v) => v.data.nik));
    const existingNik = new Set(existing.map((e) => e.nik));
    valid.forEach((v) => {
      if (existingNik.has(v.data.nik)) {
        errors.push({
          row: v.row,
          field: "nik",
          message: "NIK sudah terdaftar di database",
          value: v.data.nik,
        });
      }
    });
  }

  const invalidRows = new Set(errors.map((e) => e.row));
  const validRows = valid.filter((v) => !invalidRows.has(v.row));

  const result = {
    dryRun: Boolean(dryRun),
    totalRows: parsed.rows.length,
    validRows: validRows.length,
    invalidRows: errors.length,
    errors,
  };

  if (dryRun) {
    return result;
  }

  if (errors.length) {
    throw appError(
      "Import dibatalkan: masih terdapat baris yang tidak valid. Perbaiki file lalu cek ulang",
      422,
    );
  }

  if (!validRows.length) {
    throw appError("Tidak ada baris untuk diimport", 400);
  }

  const created = await createManyAthletes(
    validRows.map((v) => v.data),
    userUid,
  );

  return { ...result, created: created.length };
};

export const downloadImportTemplate = async () => {
  return generateAthleteTemplate();
};

export const editDataAthlete = async (id, user, data, files) => {
  const isUserExists = await findByUid(id);
  if (!isUserExists) {
    throw appError("Data tidak ditemukan", 404);
  }

  const filePaths = {
    foto: files.foto ? `/uploads/atlet/foto/${files.foto[0].filename}` : isUserExists.foto,
    fileSttbSd: files.fileSttbSd ? `/uploads/atlet/dokumen/${files.fileSttbSd[0].filename}` : isUserExists.fileSttbSd,
    fileKk: files.fileKk ? `/uploads/atlet/dokumen/${files.fileKk[0].filename}` : isUserExists.fileKk,
    fileNisnOnline: files.fileNisnOnline ? `/uploads/atlet/dokumen/${files.fileNisnOnline[0].filename}` : isUserExists.fileNisnOnline,
    fileAkteKelahiran: files.fileAkteKelahiran ? `/uploads/atlet/dokumen/${files.fileAkteKelahiran[0].filename}` : isUserExists.fileAkteKelahiran,
  };

  const updatedData = await updateDataAthlete(id, user, data, filePaths);
  return updatedData;
};

export const assignSektorAthlete = async (id, sektorList, userUid) => {
  if (!Array.isArray(sektorList)) {
    throw appError("Format data harus berupa array", 400);
  }

  const result = await assignSektor(id, sektorList, userUid);
  return result;
};

export const softDeleteAthlete = async (id, userUid) => {
  const isUserExists = await findByUid(id);
  if (!isUserExists) {
    throw appError("Data sudah terhapus", 404);
  }

  const deleteAthlete = await softDeleteUser(id, userUid);
  return deleteAthlete;
};
