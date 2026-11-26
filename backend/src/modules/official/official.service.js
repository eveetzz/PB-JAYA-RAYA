import { appError } from "../../utils/errorHandler.js";
import {
  createOfficial,
  findByNik,
  findByUid,
  findManyByNik,
  getOfficials,
  softDeleteOfficialRepo,
  updateOfficial,
} from "./official.repository.js";
import {
  generateOfficialTemplate,
  parseOfficialWorkbook,
  validateOfficialImportRows,
} from "./official.importer.js";

const buildFotoPath = (file, existing = null) => {
  if (file) return `/uploads/official/foto/${file.filename}`;
  return existing?.foto ?? null;
};

export const addOfficial = async (data, userUid, file) => {
  const existing = await findByNik(data.nik);
  if (existing) {
    throw appError("Official dengan NIK tersebut sudah terdaftar", 409);
  }

  const dataOfficial = await createOfficial(data, userUid, buildFotoPath(file));
  return dataOfficial;
};

export const fetchDataOfficial = async (query = {}) => {
  return getOfficials(query);
};

export const getOfficialDetail = async (id) => {
  const data = await findByUid(id);
  if (!data) throw appError("Data official tidak ditemukan", 404);
  return data;
};

export const editDataOfficial = async (id, data, userUid, file) => {
  const existing = await findByUid(id);
  if (!existing) throw appError("Data official tidak ditemukan", 404);

  if (data.nik && data.nik !== existing.nik) {
    const duplicate = await findByNik(data.nik, id);
    if (duplicate) {
      throw appError("Official dengan NIK tersebut sudah terdaftar", 409);
    }
  }

  return updateOfficial(id, data, userUid, buildFotoPath(file, existing));
};

export const importExcelOfficials = async (file, userUid, { dryRun }) => {
  if (!file) throw appError("File Excel wajib diunggah", 400);

  let parsed;
  try {
    parsed = await parseOfficialWorkbook(file.buffer);
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

  const { valid, errors } = validateOfficialImportRows(parsed.rows);

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

  if (dryRun) return result;

  if (errors.length) {
    throw appError(
      "Import dibatalkan: masih terdapat baris yang tidak valid. Perbaiki file lalu cek ulang",
      422,
    );
  }

  if (!validRows.length) throw appError("Tidak ada baris untuk diimport", 400);

  let created = 0;
  for (const row of validRows) {
    await createOfficial(row.data, userUid, null);
    created += 1;
  }

  return { ...result, created };
};

export const downloadOfficialTemplate = async () => generateOfficialTemplate();

export const softDeleteOfficial = async (id, userUid) => {
  const isExists = await findByUid(id);
  if (!isExists) {
    throw appError("Data official tidak ditemukan atau sudah terhapus", 404);
  }

  return softDeleteOfficialRepo(id, userUid);
};