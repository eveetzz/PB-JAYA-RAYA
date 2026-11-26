import ExcelJS from "exceljs";
import { createCoachSchema } from "./coach.validation.js";

export const COACH_EXCEL_COLUMNS = [
  "nik",
  "namaLengkap",
  "jenisKelamin",
  "tanggalLahir",
  "tahunBergabung",
  "kewarganegaraan",
  "statusPelatih",
  "pernahMelatihSebelumnya",
  "klubNegaraSebelumnya",
  "sektor",
];

export const COACH_REQUIRED_COLUMNS = [
  "nik",
  "namaLengkap",
  "jenisKelamin",
  "tanggalLahir",
  "tahunBergabung",
  "sektor",
];

const SAMPLE_ROW = {
  nik: "3201234567890001",
  namaLengkap: "Contoh Nama Pelatih",
  jenisKelamin: "L",
  tanggalLahir: "1985-06-15",
  tahunBergabung: 2012,
  kewarganegaraan: "Indonesia",
  statusPelatih: "Aktif",
  pernahMelatihSebelumnya: "false",
  klubNegaraSebelumnya: "",
  sektor: "Ganda Putra",
};

const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const HEADER_MAP = COACH_EXCEL_COLUMNS.reduce((acc, key) => {
  acc[normalizeKey(key)] = key;
  return acc;
}, {});

const excelSerialToDate = (serial) => {
  const ms = Math.round((serial - 25569) * 86400 * 1000);
  return new Date(ms);
};

const parseDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") return excelSerialToDate(value);

  const text = String(value).trim();
  const dmy = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIsoDate = (date) => (date ? date.toISOString().slice(0, 10) : null);

const getCellValue = (cell) => {
  if (!cell) return null;
  if (cell.value && typeof cell.value === "object") {
    if ("result" in cell.value) return cell.value.result;
    if ("text" in cell.value) return cell.value.text;
    if ("richText" in cell.value) {
      return cell.value.richText.map((t) => t.text).join("");
    }
  }
  return cell.value;
};

const normalizeGender = (value) => {
  const text = String(value || "").trim().toLowerCase();
  if (["l", "laki-laki", "laki laki", "pria", "male"].includes(text)) return "L";
  if (["p", "perempuan", "wanita", "female"].includes(text)) return "P";
  return String(value || "").trim().toUpperCase();
};

const normalizeStatus = (value) => {
  const text = String(value || "").trim().toLowerCase();
  if (text === "nonaktif" || text === "non-aktif" || text === "tidak aktif") {
    return "Nonaktif";
  }
  return "Aktif";
};

const normalizeBoolean = (value) => {
  const text = String(value ?? "").trim().toLowerCase();
  return ["true", "1", "ya", "yes", "ada"].includes(text);
};

export const parseCoachWorkbook = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount < 2) {
    return { rows: [], missingColumns: COACH_REQUIRED_COLUMNS };
  }

  const headerRow = sheet.getRow(1);
  const columnIndex = {};
  const missingColumns = [];

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const key = HEADER_MAP[normalizeKey(getCellValue(cell))];
    if (key) columnIndex[key] = colNumber;
  });

  COACH_REQUIRED_COLUMNS.forEach((key) => {
    if (!columnIndex[key]) missingColumns.push(key);
  });

  const rows = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const raw = { row: rowNumber };
    let hasValue = false;

    COACH_EXCEL_COLUMNS.forEach((key) => {
      const col = columnIndex[key];
      const value = col ? getCellValue(row.getCell(col)) : null;
      raw[key] = value === undefined || value === "" ? null : value;
      if (raw[key] !== null) hasValue = true;
    });

    if (hasValue) rows.push(raw);
  });

  return { rows, missingColumns };
};

export const validateCoachImportRows = (rows, sektorLookup = new Map()) => {
  const valid = [];
  const errors = [];
  const seenNik = new Map();

  rows.forEach((row) => {
    const sektorNames = String(row.sektor || "")
      .split(/[,;]/)
      .map((name) => name.trim())
      .filter(Boolean);

    const uidSektor = [];
    const unknownSektor = [];

    sektorNames.forEach((name) => {
      const uid = sektorLookup.get(name.toLowerCase());
      if (uid) uidSektor.push(uid);
      else unknownSektor.push(name);
    });

    if (unknownSektor.length) {
      errors.push({
        row: row.row,
        field: "sektor",
        message: `Sektor tidak ditemukan: ${unknownSektor.join(", ")}`,
        value: unknownSektor.join(", "),
      });
    }

    const payload = {
      nik: row.nik != null ? String(row.nik).trim() : "",
      namaLengkap:
        row.namaLengkap != null ? String(row.namaLengkap).trim() : "",
      jenisKelamin: normalizeGender(row.jenisKelamin),
      tanggalLahir: toIsoDate(parseDate(row.tanggalLahir)),
      tahunBergabung: row.tahunBergabung != null
        ? Number(row.tahunBergabung)
        : "",
      kewarganegaraan: row.kewarganegaraan
        ? String(row.kewarganegaraan).trim()
        : "Indonesia",
      statusPelatih: normalizeStatus(row.statusPelatih),
      pernahMelatihSebelumnya: normalizeBoolean(row.pernahMelatihSebelumnya),
      klubNegaraSebelumnya: row.klubNegaraSebelumnya
        ? String(row.klubNegaraSebelumnya).trim()
        : null,
      uidSektor,
    };

    const { error, value } = createCoachSchema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      error.details.forEach((detail) => {
        if (
          detail.path[0] === "uidSektor" &&
          unknownSektor.length > 0
        ) {
          return;
        }
        errors.push({
          row: row.row,
          field: detail.path.join("."),
          message: detail.message,
          value: payload[detail.path[0]] ?? null,
        });
      });
      return;
    }

    if (seenNik.has(value.nik)) {
      errors.push({
        row: row.row,
        field: "nik",
        message: `NIK duplikat di dalam file (sama dengan baris ${seenNik.get(
          value.nik,
        )})`,
        value: value.nik,
      });
      return;
    }
    seenNik.set(value.nik, row.row);

    valid.push({ row: row.row, data: value });
  });

  return { valid, errors };
};

export const generateCoachTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data Pelatih");

  sheet.columns = COACH_EXCEL_COLUMNS.map((key) => ({
    header: key,
    key,
    width: Math.max(16, key.length + 4),
  }));

  sheet.addRow(SAMPLE_ROW);
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3E4FE" },
  };

  const guide = workbook.addWorksheet("Petunjuk");
  guide.getCell("A1").value = "Petunjuk Import Data Pelatih";
  guide.getCell("A1").font = { bold: true, size: 13 };
  guide.getCell("A3").value = `Kolom wajib: ${COACH_REQUIRED_COLUMNS.join(", ")}.`;
  guide.getCell("A4").value =
    "Kolom opsional: kewarganegaraan, statusPelatih, pernahMelatihSebelumnya, klubNegaraSebelumnya.";
  guide.getCell("A5").value =
    "Format tanggal: YYYY-MM-DD (contoh 1985-06-15).";
  guide.getCell("A6").value = "jenisKelamin: L atau P.";
  guide.getCell("A7").value =
    "statusPelatih: Aktif atau Nonaktif (default Aktif).";
  guide.getCell("A8").value =
    "sektor: pisahkan dengan koma bila lebih dari satu, contoh: Ganda Putra, Tunggal Putra.";
  guide.getCell("A9").value =
    "Hapus baris contoh di sheet Data Pelatih sebelum melakukan import.";
  guide.getColumn(1).width = 100;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};