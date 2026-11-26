import { useRef, useState } from 'react';
import { Eye, Pencil, Upload } from 'lucide-react';
import {
  COACH_CERTIFICATIONS,
  JENIS_KELAMIN_OPTIONS,
  STATUS_OPTIONS,
  resolveFileUrl,
} from '../constants';
import {
  DateBox,
  Field,
  InputBox,
  SectionLabel,
  SelectBox,
  YearBox,
} from './FormPrimitives';

function PhotoUpload({ files, existing, onFileChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const picked = files.foto;
  const savedUrl = resolveFileUrl(existing?.foto);
  const previewUrl = preview || savedUrl;

  return (
    <div className="flex flex-col justify-center items-center self-stretch bg-white p-8 rounded border-2 border-dashed border-[#e7bdb8]">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            setPreview(URL.createObjectURL(file));
            onFileChange('foto', file);
          }
          event.target.value = '';
        }}
      />

      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Pratinjau foto pelatih"
          className="w-24 h-24 object-cover rounded-xl border-4 border-[#b80012] mb-4"
        />
      ) : null}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1 bg-[#b80012] px-6 py-2 rounded hover:bg-[#9a0010] transition-colors"
      >
        <Upload className="w-3.5 h-3.5 text-white" />
        <span className="font-bold text-sm text-white">Upload Photo</span>
      </button>
      <span className="pt-2 font-medium text-xs text-[#5f5e5e]">
        {picked ? picked.name : 'Hanya file JPG/PNG, maksimal 2MB'}
      </span>
    </div>
  );
}

function CertRow({ label, field, files, existing, onFileChange }) {
  const inputRef = useRef(null);
  const picked = files[field];
  const savedUrl = resolveFileUrl(existing?.[field]);

  return (
    <div className="flex items-center justify-between gap-3 p-3 border border-[#e7bdb8] rounded">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileChange(field, file);
          event.target.value = '';
        }}
      />

      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-[#0b1c30]">{label}</span>
        <span className="text-[11px] text-[#5f5e5e] truncate">
          {picked ? picked.name : savedUrl ? 'File sudah diupload' : 'Belum diupload'}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {savedUrl && !picked && (
          <a
            href={savedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#b80012] hover:underline"
          >
            Lihat
          </a>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-[#b80012] text-white text-xs font-semibold hover:bg-[#9a0010] whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>
    </div>
  );
}

export default function CoachForm({
  value,
  files,
  existing,
  onChange,
  onFileChange,
  sektorOptions = [],
  onCancel,
  onPreview,
}) {
  const field = (name) => ({
    value: value[name] ?? '',
    onChange: (event) => onChange(name, event.target.value),
  });

  const pernahMelatih =
    value.pernahMelatihSebelumnya === true ||
    value.pernahMelatihSebelumnya === 'true';

  const setRiwayat = (next) => {
    onChange('pernahMelatihSebelumnya', next);
    if (!next) onChange('klubNegaraSebelumnya', '');
  };

  return (
    <div className="w-full flex flex-col bg-white rounded-lg border border-[#e7bdb8]">
      <div className="flex justify-between items-center self-stretch bg-[#b80012] px-6 py-2 rounded-t-lg">
        <span className="font-bold text-base text-white">
          Tambah / Edit Biodata
        </span>
        <Pencil className="w-[18px] h-4 text-white" />
      </div>

      <div className="flex flex-col gap-6 self-stretch p-6">
        <div className="flex flex-col self-stretch pb-1 border-b border-[#e7bdb8]">
          <span className="font-bold text-base text-[#b80012]">Biodata Utama</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 self-stretch">
          <div className="flex flex-col gap-6 w-full min-w-0">
            <div className="flex flex-col gap-4">
              <SectionLabel>IDENTITAS PELATIH</SectionLabel>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 self-stretch">
                <Field label="NIK" required>
                  <InputBox {...field('nik')} placeholder="3201234567890001" />
                </Field>
                <Field label="Tanggal Tahun Lahir" required>
                  <DateBox {...field('tanggalLahir')} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 self-stretch">
                <Field label="Nama Lengkap" required>
                  <InputBox {...field('namaLengkap')} placeholder="Nama pelatih" />
                </Field>
                <Field label="Kewarganegaraan" required>
                  <InputBox {...field('kewarganegaraan')} placeholder="Indonesia" />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 self-stretch">
                <Field label="Jenis Kelamin" required>
                  <SelectBox
                    {...field('jenisKelamin')}
                    options={JENIS_KELAMIN_OPTIONS}
                  />
                </Field>
                <Field label="Status" required>
                  <SelectBox {...field('statusPelatih')} options={STATUS_OPTIONS} />
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <SectionLabel>KEPELATIHAN JAYA RAYA</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 self-stretch">
                <Field label="Sektor" required>
                  <SelectBox
                    {...field('uidSektor')}
                    options={sektorOptions}
                    placeholder="Pilih sektor"
                  />
                </Field>
                <Field label="Tahun Bergabung Sebagai Pelatih" required>
                  <YearBox {...field('tahunBergabung')} />
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4">
              <SectionLabel>FOTO PELATIH</SectionLabel>
              <PhotoUpload
                files={files}
                existing={existing}
                onFileChange={onFileChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full min-w-0">
            <SectionLabel>RIWAYAT KARIR</SectionLabel>

            <Field label="Klub/Negara yang Dilatih Sebelum Bergabung" required>
              <div className="flex items-center gap-6 py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="riwayatKlub"
                    checked={pernahMelatih}
                    onChange={() => setRiwayat(true)}
                    className="w-4 h-4 accent-[#b80012]"
                  />
                  <span className="text-sm font-medium text-[#0b1c30]">Ada</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="riwayatKlub"
                    checked={!pernahMelatih}
                    onChange={() => setRiwayat(false)}
                    className="w-4 h-4 accent-[#b80012]"
                  />
                  <span className="text-sm font-medium text-[#0b1c30]">
                    Tidak Ada
                  </span>
                </label>
              </div>
            </Field>

            <Field label="Nama Klub/Negara">
              <InputBox
                {...field('klubNegaraSebelumnya')}
                placeholder={
                  pernahMelatih ? 'Nama klub/negara' : 'Tidak ada riwayat'
                }
                disabled={!pernahMelatih}
              />
            </Field>

            <div className="pt-2">
              <SectionLabel>SERTIFIKASI</SectionLabel>
            </div>

            <div className="flex flex-col gap-2">
              {COACH_CERTIFICATIONS.map((cert) => (
                <CertRow
                  key={cert.field}
                  label={cert.label}
                  field={cert.field}
                  files={files}
                  existing={existing}
                  onFileChange={onFileChange}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 self-stretch bg-[#f8f9ff] p-4 md:p-6 border-t border-[#e7bdb8] rounded-b-lg">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-[260px] h-12 rounded border-2 border-brand font-bold text-base text-brand hover:bg-red-50 transition-colors"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onPreview}
          className="flex-1 w-full h-12 flex items-center justify-center gap-2 bg-brand rounded font-bold text-base text-white hover:bg-brand-dark transition-colors"
        >
          <Eye className="w-[22px] h-[15px]" />
          View Data
        </button>
      </div>
    </div>
  );
}