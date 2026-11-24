import ExcelJS from "exceljs";
import { createAtletSchema } from "./athlete.validation.js";

// Kolom template import Excel. Urutan ini juga dipakai saat generate template.
export const ATHLETE_EXCEL_COLUMNS = [
  "nik",
  "idPbsi",
  "namaLengkap",
  "namaIbu",
  "tempatLahir",
  "tanggalLahir",
  "alamat",
  "jenisKelamin",
  "peganganRaket",
  "provinsi",
  "klubSaatIni",
  "asalKlubSebelumnya",
  "gabungSatelitPada",
  "gabungJayaRayaPada",
  "statusAtlet",
];

export const REQUIRED_COLUMNS = [
  "nik",
  "idPbsi",
  "namaLengkap",
  "namaIbu",
  "tempatLahir",
  "tanggalLahir",
  "alamat",
  "jenisKelamin",
  "peganganRaket",
  "provinsi",
  "klubSaatIni",
];

const SAMPLE_ROW = {
  nik: "3171000000000001",
  idPbsi: "PBSI-0001",
  namaLengkap: "Contoh Nama Atlet",
  namaIbu: "Contoh Nama Ibu",
  tempatLahir: "Jakarta",
  tanggalLahir: "2005-01-31",
  alamat: "Jl. Contoh No. 1",
  jenisKelamin: "L",
  peganganRaket: "Kanan",
  provinsi: "DKI Jakarta",
  klubSaatIni: "PB Jaya Raya",
  asalKlubSebelumnya: "",
  gabungSatelitPada: "",
  gabungJayaRayaPada: "2020-01-01",
  statusAtlet: "Aktif",
};

// Normalisasi header: buang spasi/underscore, lowercase
const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const HEADER_MAP = ATHLETE_EXCEL_COLUMNS.reduce((acc, key) => {
  acc[normalizeKey(key)] = key;
  return acc;
}, {});

// Ubah serial number Excel menjadi Date
const excelSerialToDate = (serial) => {
  const ms = Math.round((serial - 25569) * 86400 * 1000);
  return new Date(ms);
};

const parseDate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "number") {
    return excelSerialToDate(value);
  }

  const text = String(value).trim();
  // dukung dd/mm/yyyy dan dd-mm-yyyy
  const dmy = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toIsoDate = (date) => {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
};

// Ambil nilai sel, prioritaskan text untuk sel formula
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

// Parse workbook menjadi baris objek dengan key sesuai schema
export const parseAthleteWorkbook = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet || sheet.rowCount < 2) {
    return { rows: [], missingColumns: REQUIRED_COLUMNS };
  }

  const headerRow = sheet.getRow(1);
  const columnIndex = {};
  const missingColumns = [];

  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const key = HEADER_MAP[normalizeKey(getCellValue(cell))];
    if (key) columnIndex[key] = colNumber;
  });

  REQUIRED_COLUMNS.forEach((key) => {
    if (!columnIndex[key]) missingColumns.push(key);
  });

  const rows = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;

    const raw = { row: rowNumber };
    let hasValue = false;

    ATHLETE_EXCEL_COLUMNS.forEach((key) => {
      const col = columnIndex[key];
      const value = col ? getCellValue(row.getCell(col)) : null;
      raw[key] = value === undefined || value === "" ? null : value;
      if (raw[key] !== null) hasValue = true;
    });

    if (hasValue) rows.push(raw);
  });

  return { rows, missingColumns };
};

// Validasi baris dengan Joi schema yang sama seperti input manual
export const validateImportRows = (rows) => {
  const valid = [];
  const errors = [];

  const seenNik = new Map();

  rows.forEach((row) => {
    const payload = {
      nik: row.nik != null ? String(row.nik).trim() : "",
      idPbsi: row.idPbsi != null ? String(row.idPbsi).trim() : "",
      namaLengkap:
        row.namaLengkap != null ? String(row.namaLengkap).trim() : "",
      namaIbu: row.namaIbu != null ? String(row.namaIbu).trim() : "",
      tempatLahir:
        row.tempatLahir != null ? String(row.tempatLahir).trim() : "",
      tanggalLahir: toIsoDate(parseDate(row.tanggalLahir)),
      alamat: row.alamat != null ? String(row.alamat).trim() : "",
      jenisKelamin:
        row.jenisKelamin != null
          ? String(row.jenisKelamin).trim().toUpperCase()
          : "",
      peganganRaket:
        row.peganganRaket != null
          ? String(row.peganganRaket).trim()
          : "",
      provinsi: row.provinsi != null ? String(row.provinsi).trim() : "",
      klubSaatIni:
        row.klubSaatIni != null ? String(row.klubSaatIni).trim() : "",
      asalKlubSebelumnya: row.asalKlubSebelumnya
        ? String(row.asalKlubSebelumnya).trim()
        : null,
      gabungSatelitPada: toIsoDate(parseDate(row.gabungSatelitPada)),
      gabungJayaRayaPada: toIsoDate(parseDate(row.gabungJayaRayaPada)),
      statusAtlet: row.statusAtlet
        ? String(row.statusAtlet).trim()
        : "Aktif",
    };

    const { error, value } = createAtletSchema.validate(payload, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      error.details.forEach((detail) => {
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

// Generate template Excel
export const generateAthleteTemplate = async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data Atlet");

  sheet.columns = ATHLETE_EXCEL_COLUMNS.map((key) => ({
    header: key,
    key,
    width: Math.max(14, key.length + 4),
  }));

  sheet.addRow(SAMPLE_ROW);

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3E4FE" },
  };

  // Petunjuk ditaruh di sheet terpisah agar tidak terbaca sebagai baris data
  const guide = workbook.addWorksheet("Petunjuk");
  guide.getCell("A1").value = "Petunjuk Import Data Atlet";
  guide.getCell("A1").font = { bold: true, size: 13 };
  guide.getCell("A3").value = `Kolom wajib: ${REQUIRED_COLUMNS.join(", ")}.`;
  guide.getCell("A4").value =
    "Kolom opsional: asalKlubSebelumnya, gabungSatelitPada, gabungJayaRayaPada, statusAtlet.";
  guide.getCell("A5").value =
    "Format tanggal: YYYY-MM-DD (contoh 2005-01-31).";
  guide.getCell("A6").value =
    "jenisKelamin: L atau P. peganganRaket: Kanan atau Kiri.";
  guide.getCell("A7").value = "statusAtlet: Aktif atau Nonaktif (default Aktif).";
  guide.getCell("A8").value =
    "Hapus baris contoh di sheet Data Atlet sebelum melakukan import.";
  guide.getColumn(1).width = 90;

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};
