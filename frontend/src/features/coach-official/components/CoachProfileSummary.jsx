import { Award, Check, Dumbbell, User, XCircle } from 'lucide-react';
import {
  COACH_CERTIFICATIONS,
  formatDate,
  genderLabel,
  statusBadgeClass,
} from '../constants';

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

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center px-4 py-3 border-b border-[#e7bdb8] last:border-b-0">
      <span className="w-28 sm:w-44 flex-shrink-0 pr-3 text-[11px] font-bold text-[#5f5e5e] border-r-1 border-[#b80012]/40 uppercase leading-snug">
        {label}
      </span>
      <span
        className={`flex-1 pl-4 text-sm text-[#0b1c30] break-words ${
          highlight ? 'font-bold' : 'font-medium'
        }`}
      >
        {value || '-'}
      </span>
    </div>
  );
}

function InfoCard({ rows }) {
  return (
    <div className="rounded-lg border border-[#b80012]/40 bg-white overflow-hidden">
      {rows.map(([label, value, highlight]) => (
        <InfoRow
          key={label}
          label={label}
          value={value}
          highlight={highlight}
        />
      ))}
    </div>
  );
}

function CoachOverviewCard({ coach, foto }) {
  const status = coach.status || coach.statusPelatih || 'Aktif';

  return (
    <div className="border border-[#b80012]/40 rounded-lg bg-white p-5 flex flex-col items-center gap-3">
      <h3 className="text-sm font-extrabold text-[#b80012] uppercase tracking-wide self-start">
        Coach Profile Overview
      </h3>

      <div className="w-32 h-40 sm:w-40 sm:h-52 overflow-hidden rounded border border-[#e7bdb8] bg-[#f4f5f7]">
        {foto?.url ? (
          <img
            src={foto.url}
            alt={coach.namaLengkap}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#b80012]/30">
            {coach.namaLengkap?.charAt(0) || 'C'}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="font-bold text-base text-[#0b1c30]">
          {coach.namaLengkap || '-'}
        </span>
        <div className="flex items-center gap-1">
          {/* <span className="text-xs font-medium text-[#5f5e5e]">{status}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status === 'Aktif' ? 'bg-green-500' : 'bg-red-500'
            }`}
          /> */}
        </div>
        <span
          className={`mt-1 px-3 py-0.5 rounded-lg text-[11px] font-bold ${statusBadgeClass(status)}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
}

export default function CoachProfileSummary({ coach, getFile }) {
  const sektorList =
    Array.isArray(coach.sektor) && coach.sektor.length
      ? coach.sektor
      : coach.sektorUtama
        ? [coach.sektorUtama]
        : (coach.pelatihSektorList || [])
            .map((item) => item.sektor?.namaSektor)
            .filter(Boolean);

  const riwayat =
    coach.pernahMelatihSebelumnya === true ||
    coach.pernahMelatihSebelumnya === 'true'
      ? coach.klubNegaraSebelumnya || 'Ada'
      : 'Tidak ada';

  const pribadiRows = [
    ['NIK', coach.nik],
    ['Nama Lengkap', coach.namaLengkap, true],
    ['Jenis Kelamin', genderLabel(coach.jenisKelamin)],
    ['Tgl Lahir', formatDate(coach.tanggalLahir)],
    ['Kewarganegaraan', coach.kewarganegaraan],
  ];

  const karirRows = [
    ['Sektor Spesialisasi', sektorList.join(', ')],
    ['Riwayat Kepelatihan', riwayat],
    ['Tahun Bergabung', coach.tahunBergabung],
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
      <div className="lg:col-span-3 flex flex-col gap-6">
        <section>
          <SectionHeader icon={User}>Informasi Pribadi</SectionHeader>
          <InfoCard rows={pribadiRows} />
        </section>

        <section>
          <SectionHeader icon={Dumbbell}>Sektor & Karir</SectionHeader>
          <InfoCard rows={karirRows} />
        </section>

        <section>
          <SectionHeader icon={Award}>Sertifikasi</SectionHeader>
          <div className="overflow-x-auto rounded border border-[#b80012]/40 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#f8f9ff]">
                <tr>
                  <th className="px-4 py-2.5 text-center font-bold text-[11px] text-[#5f5e5e] uppercase">
                    Jenis Sertifikasi
                  </th>
                  <th className="px-4 py-2.5 text-center font-bold text-[11px] text-[#5f5e5e] uppercase w-24">
                    File
                  </th>
                </tr>
              </thead>
              <tbody>
                {COACH_CERTIFICATIONS.map((cert) => {
                  const file = getFile(cert.field);
                  return (
                    <tr key={cert.field} className="border-t border-[#e7bdb8]">
                      <td className="px-4 py-2.5 text-center text-[#0b1c30] font-medium">
                        {cert.label}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-center">
                          {file?.url ? (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-center w-6 h-6 rounded-sm bg-[#b80012] hover:bg-[#9a0010]"
                              title={`Lihat ${cert.label}`}
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
      </div>

      <div className="lg:col-span-2">
        <CoachOverviewCard coach={coach} foto={getFile('foto')} />
      </div>
    </div>
  );
}