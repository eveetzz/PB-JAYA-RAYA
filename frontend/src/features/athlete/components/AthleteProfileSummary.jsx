import {
  CalendarDays,
  Check,
  FileText,
  Flag,
  MapPin,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { ATHLETE_DOCUMENTS } from "../constants";

const formatMonthYear = (value) => {
  if (!value) return "-";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", { month: "short", year: "numeric" });
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const genderLabel = (value) =>
  value === "L" ? "Laki-laki" : value === "P" ? "Perempuan" : "-";

function SectionHeader({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-5 h-5 text-brand flex-shrink-0" />}
      <h2 className="text-base font-bold text-brand uppercase tracking-wide">
        {children}
      </h2>
    </div>
  );
}

function InfoCard({ rows }) {
  return (
    <div className="rounded-lg border border-brand/40 bg-white overflow-hidden divide-y divide-brand/40">
      {rows.map(([label, value, isBold]) => (
        <div key={label} className="flex items-center px-4 py-3.5">
          {/* Kolom Kiri: Label */}
          <div className="w-36 sm:w-44 flex-shrink-0 pr-3 border-r border-brand/40">
            <span className="block text-xs font-bold text-muted uppercase leading-snug">
              {label}
            </span>
          </div>

          {/* Kolom Kanan: Value */}
          <div className="flex-1 pl-4 min-w-0">
            <span
              className={`block text-sm text-ink break-words ${
                isBold ? "font-bold" : "font-medium"
              }`}
            >
              {value || "-"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function OverviewCard({ athlete, foto }) {
  const isAktif =
    !athlete.statusAtlet || athlete.statusAtlet.toLowerCase() === "aktif";

  const clubs = [athlete.klubSaatIni, athlete.asalKlubSebelumnya]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="w-full h-full border border-brand/50 rounded-xl bg-white p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 shadow-sm">
      {/* Baris 1: Header Judul (Kiri) & Badge Status (Kanan) */}
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h3 className="text-base sm:text-xl font-bold text-brand uppercase tracking-tight">
          Athlete Profile Overview
        </h3>
        <span
          className={`px-3 py-1 rounded-sm text-xs font-bold flex-shrink-0 ${
            isAktif ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {athlete.statusAtlet || "Aktif"}
        </span>
      </div>

      {/* Baris 2: Foto (Kiri) & Kotak Informasi (Kanan) */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
        {/* Kolom Kiri: Foto, Nama, ID PBSI */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-32 h-40 sm:w-40 sm:h-52 overflow-hidden rounded-md border border-line bg-brand-light shadow-md">
            {foto?.url ? (
              <img
                src={foto.url}
                alt={athlete.namaLengkap || "Foto atlet"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-brand">
                {athlete.namaLengkap?.charAt(0) || "A"}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center text-center mt-0.5">
            <span className="font-bold text-base text-ink leading-snug">
              {athlete.namaLengkap || "-"}
            </span>
            <span className="text-xs font-bold text-brand tracking-wide mt-0.5">
              ID: {athlete.idPbsi || "-"}
            </span>
          </div>
        </div>

        {/* Kolom Kanan: Padding aktif di mobile (py-3.5), tinggi pas foto di desktop (sm:h-52) */}
        <div className="flex flex-col gap-3 sm:gap-3.5 flex-1 min-w-0 w-full sm:h-52">
          <div className="w-full flex-1 flex items-center gap-3.5 bg-surface/60 border border-brand/30 rounded-lg px-4 py-3.5 sm:py-0 shadow-xs">
            <CalendarDays className="w-5 h-5 text-brand flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                Tanggal Bergabung Satelit
              </span>
              <span className="text-sm font-bold text-ink break-words sm:truncate mt-0.5">
                {formatMonthYear(athlete.gabungSatelitPada)}
              </span>
            </div>
          </div>

          <div className="w-full flex-1 flex items-center gap-3.5 bg-white border border-brand/30 rounded-lg px-4 py-3.5 sm:py-0 shadow-xs">
            <Users className="w-5 h-5 text-brand flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                Klub
              </span>
              <span className="text-sm font-bold text-ink break-words sm:truncate mt-0.5">
                {clubs || "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ringkasan profil atlet. Presentational murni: data dan berkas disiapkan
// pemanggil lewat `getFile(field)` => { url, name }.
export default function AthleteProfileSummary({ athlete, getFile }) {
  const pribadiRows = [
    ["NIK", athlete.nik],
    ["ID PBSI", athlete.idPbsi],
    ["Nama Lengkap", athlete.namaLengkap, true],
    ["Nama Ibu Kandung", athlete.namaIbu],
    ["Tempat Lahir", athlete.tempatLahir],
    ["Tanggal Lahir", formatDate(athlete.tanggalLahir)],
    ["Jenis Kelamin", genderLabel(athlete.jenisKelamin)],
    ["Pegangan Raket", athlete.peganganRaket],
  ];

  const klubRows = [
    ["Provinsi", athlete.provinsi],
    ["Klub Sekarang", athlete.klubSaatIni, true],
    ["Klub Sebelumnya", athlete.asalKlubSebelumnya],
    ["Bln Bergabung Satelit", formatMonthYear(athlete.gabungSatelitPada)],
    ["Bln Bergabung Jaya Raya", formatMonthYear(athlete.gabungJayaRayaPada)],
  ];

  // Foto sudah tampil di OverviewCard, jadi tidak diulang di daftar dokumen.
  const docs = ATHLETE_DOCUMENTS.filter((doc) => doc.kind !== "foto");

  return (
    <div className="flex flex-col gap-6">
      {/* Baris 1: Informasi Pribadi + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <section className="flex flex-col">
          <SectionHeader icon={User}>Informasi Pribadi</SectionHeader>
          <div className="flex-1">
            <InfoCard rows={pribadiRows} />
          </div>
        </section>

        {/* Spacer transparan di desktop agar batas atas kartu sejajar dengan InfoCard */}
        <div className="flex flex-col lg:pt-8">
          <OverviewCard athlete={athlete} foto={getFile("foto")} />
        </div>
      </div>

      {/* Baris 2: Verifikasi Dokumen + Data Klub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section>
          <SectionHeader icon={FileText}>Verifikasi Dokumen</SectionHeader>
          <div className="overflow-hidden rounded-lg border border-brand/40 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr>
                  <th className="px-4 py-2.5 text-left font-bold text-[11px] text-muted uppercase">
                    Nama Dokumen
                  </th>
                  <th className="px-4 py-2.5 text-center font-bold text-[11px] text-muted uppercase w-28">
                    File
                  </th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => {
                  const file = getFile(doc.field);
                  return (
                    <tr key={doc.field} className="border-t border-line">
                      <td className="px-4 py-2.5 text-ink font-medium">
                        {doc.label}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-center">
                          {file?.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center w-6 h-6 rounded-sm bg-brand hover:bg-brand-dark transition-colors"
                              title={`Lihat ${doc.label}`}
                            >
                              <Check className="w-4 h-4 text-white" />
                            </a>
                          ) : (
                            <div className="flex items-center justify-center w-6 h-6 rounded-sm border border-line">
                              <XCircle className="w-4 h-4 text-[#ba1a1a]" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <SectionHeader icon={Flag}>Data Klub & Domisili</SectionHeader>
          <InfoCard rows={klubRows} />
        </section>
      </div>

      {/* Baris 3: Alamat */}
      <section>
        <SectionHeader icon={MapPin}>Alamat</SectionHeader>
        <div className="border border-brand/40 rounded-lg px-4 py-3.5 bg-white">
          <span className="text-sm font-semibold text-ink break-words">
            {athlete.alamat || "-"}
          </span>
        </div>
      </section>
    </div>
  );
}
