import { appError } from "../../utils/errorHandler.js";
import { getSektors, getSektorsByIds } from "../sektor/sektor.repository.js";
import {
  COACH_FILE_FIELDS,
  createCoach,
  findByNik,
  findByUid,
  findManyByNik,
  getCoaches,
  setJenisFromSektor,
  softDeleteCoachRepo,
  updateCoach,
} from "./coach.repository.js";
import {
  generateCoachTemplate,
  parseCoachWorkbook,
  validateCoachImportRows,
} from "./coach.importer.js";

const COACH_FILE_PATHS = {
  foto: "/uploads/pelatih/foto",
  fileSertifikasiKota: "/uploads/pelatih/sertifikasi",
  fileSertifikasiProvinsi: "/uploads/pelatih/sertifikasi",
  fileSertifikasiNasional: "/uploads/pelatih/sertifikasi",
  fileSertifikasiBwf1: "/uploads/pelatih/sertifikasi",
  fileSertifikasiBwf2: "/uploads/pelatih/sertifikasi",
  fileSertifikasiSarjanaOlahraga: "/uploads/pelatih/sertifikasi",
  fileSertifikasiMasterOlahraga: "/uploads/pelatih/sertifikasi",
};

const normalizeSektor = (value) => {
  let parsed = value;

  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      throw appError("Format data sektor tidak valid", 400);
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw appError("Sektor wajib dipilih minimal satu", 400);
  }

  return parsed.map((id) => String(id).trim()).filter(Boolean);
};

const assertSektorExists = async (sektorList) => {
  const sektors = await getSektorsByIds(sektorList);
  if (sektors.length !== sektorList.length) {
    throw appError("Sektor yang dipilih tidak ditemukan", 400);
  }
  return sektors;
};

const buildFilePaths = (files = {}, existing = null) => {
  return COACH_FILE_FIELDS.reduce((acc, field) => {
    const picked = files[field]?.[0];
    acc[field] = picked
      ? `${COACH_FILE_PATHS[field]}/${picked.filename}`
      : existing?.[field] ?? null;
    return acc;
  }, {});
};

export const getAllCoaches = async (query = {}) => {
  return getCoaches(query);
};

export const getCoachDetail = async (id) => {
  const data = await findByUid(id);
  if (!data) throw appError("Data pelatih tidak ditemukan", 404);
  return data;
};

export const addCoach = async (data, userUid, files) => {
  const existingData = await findByNik(data.nik);
  if (existingData) {
    throw appError("Pelatih dengan NIK tersebut telah terdaftar", 409);
  }

  const sektorList = normalizeSektor(data.uidSektor);
  await assertSektorExists(sektorList);

  const filePaths = buildFilePaths(files);
  const rolePelatih = await setJenisFromSektor(sektorList);

  const { uidSektor: _uidSektor, ...payload } = data;

  return createCoach(payload, userUid, filePaths, rolePelatih, sektorList);
};

export const editCoach = async (id, data, userUid, files) => {
  const existing = await findByUid(id);
  if (!existing) throw appError("Data pelatih tidak ditemukan", 404);

  if (data.nik && data.nik !== existing.nik) {
    const duplicate = await findByNik(data.nik, id);
    if (duplicate) {
      throw appError("Pelatih dengan NIK tersebut telah terdaftar", 409);
    }
  }

  const hasSektor = Object.prototype.hasOwnProperty.call(data, "uidSektor");
  const sektorList = hasSektor ? normalizeSektor(data.uidSektor) : null;
  if (sektorList) await assertSektorExists(sektorList);

  const rolePelatih = sektorList
    ? await setJenisFromSektor(sektorList)
    : null;

  const filePaths = buildFilePaths(files, existing);
  const { uidSektor: _uidSektor, ...payload } = data;

  return updateCoach(
    id,
    payload,
    userUid,
    filePaths,
    rolePelatih,
    sektorList,
  );
};

export const importExcelCoaches = async (file, userUid, { dryRun }) => {
  if (!file) throw appError("File Excel wajib diunggah", 400);

  let parsed;
  try {
    parsed = await parseCoachWorkbook(file.buffer);
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

  const sektors = await getSektors();
  const sektorLookup = new Map(
    sektors.map((sektor) => [sektor.namaSektor.toLowerCase(), sektor.uidSektor]),
  );

  const { valid, errors } = validateCoachImportRows(parsed.rows, sektorLookup);

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
    const sektorList = row.data.uidSektor;
    const rolePelatih = await setJenisFromSektor(sektorList);
    const { uidSektor: _uidSektor, ...payload } = row.data;
    await createCoach(payload, userUid, buildFilePaths(), rolePelatih, sektorList);
    created += 1;
  }

  return { ...result, created };
};

export const downloadCoachTemplate = async () => generateCoachTemplate();

export const softDeleteCoach = async (id, userUid) => {
  const existing = await findByUid(id);
  if (!existing) {
    throw appError("Data pelatih tidak ditemukan atau sudah terhapus", 404);
  }
  return softDeleteCoachRepo(id, userUid);
};