import { useRef, useState } from 'react';
import { FileText, Pencil, Upload } from 'lucide-react';
import { resolveFileUrl } from '../constants';

// ==== Styles bersama ====
const inputClass =
  'w-full px-3 py-2 text-sm border border-line rounded bg-white text-ink placeholder:text-gray-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors disabled:bg-surface disabled:text-muted';

// ==== Sub-komponen (module scope agar tidak kehilangan fokus saat re-render) ====

function SectionTitle({ children }) {
  return (
    <h3 className="text-[13px] font-bold text-brand uppercase tracking-wide mb-3">
      {children}
    </h3>
  );
}

function FieldLabel({ label, required }) {
  return (
    <label className="block text-xs font-medium text-muted mb-1">
      {label} {required && <span className="text-brand">*</span>}
    </label>
  );
}

function TextInput({ type = 'text', placeholder = '', value, onChange, disabled }) {
  return (
    <input
      type={type}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={inputClass}
    />
  );
}

function TextArea({ placeholder = '', value, onChange, disabled }) {
  return (
    <textarea
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`${inputClass} min-h-[80px] resize-y`}
    />
  );
}

// Terima array objek { value, label } ATAU array string.
function SelectInput({ value, onChange, options = [], placeholder = 'Pilih...', disabled }) {
  const normalized =
    options.length && typeof options[0] === 'string'
      ? options.map((opt) => ({ value: opt, label: opt }))
      : options;

  return (
    <select
      value={value || ''}
      onChange={onChange}
      disabled={disabled}
      className={inputClass}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {normalized.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function FotoSection({ files, existing, onFileChange, disabled }) {
  const inputRef = useRef(null);
  // Object URL dibuat saat user memilih file, bukan di dalam effect.
  const [pickedPreview, setPickedPreview] = useState(null);

  const picked = files.foto;
  const savedUrl = resolveFileUrl(existing?.foto);
  const previewUrl = picked ? pickedPreview : savedUrl;

  const trigger = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className="border-2 border-dashed border-line rounded-lg p-6 flex flex-col items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const url = URL.createObjectURL(file);
            setPickedPreview(url);
            onFileChange('foto', file);
          }
          e.target.value = '';
        }}
      />

      {picked || savedUrl ? (
        <div className="flex flex-col items-center gap-2">
          <img
            src={previewUrl}
            alt="Pratinjau foto atlet"
            className="w-20 h-20 object-cover rounded-xl border-2 border-brand"
          />
          <span className="text-xs text-green-600 font-medium truncate max-w-[220px]">
            ✓ {picked ? picked.name : 'Foto tersimpan'}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <span className="text-3xl leading-none text-muted">👤</span>
          <span className="text-xs text-muted">Belum ada foto</span>
        </div>
      )}

      <button
        type="button"
        onClick={trigger}
        disabled={disabled}
        className="px-6 py-2 rounded bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
      >
        Upload Photo
      </button>
      <p className="text-xs text-muted">Hanya file JPG/PNG, maksimal 2MB</p>
    </div>
  );
}

// Row verifikasi dokumen (STTB, KK, NISN, Akte) — foto tidak termasuk di sini.
function DocumentRow({ doc, files, existing, onFileChange, disabled }) {
  const inputRef = useRef(null);
  const hasPicked = Boolean(files[doc.field]);
  const hasSaved = Boolean(existing?.[doc.field]);
  const savedUrl = resolveFileUrl(existing?.[doc.field]);

  const status = hasPicked
    ? files[doc.field].name
    : hasSaved
      ? 'File sudah diupload'
      : 'Belum pernah diupload';

  return (
    <div className="flex items-center justify-between gap-3 p-3 border border-line rounded">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileChange(doc.field, file);
          e.target.value = '';
        }}
      />

      <div className="flex items-center gap-2 min-w-0">
        <FileText className="w-5 h-5 text-muted flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-semibold text-ink">{doc.label}</span>
          <span className="text-[11px] text-muted truncate">{status}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {hasSaved && !hasPicked && (
          <a
            href={savedUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-brand hover:underline"
          >
            Lihat
          </a>
        )}
        <button
          type="button"
          onClick={() => !disabled && inputRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-1 px-3 py-1.5 rounded bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition-colors whitespace-nowrap disabled:opacity-60"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload File
        </button>
      </div>
    </div>
  );
}

// ==== Form utama ====
export default function AthleteForm({
  value,
  files,
  existing,
  onChange,
  onFileChange,
  jenisKelaminOptions,
  peganganRaketOptions,
  statusOptions,
  documents,
  disabled = false,
}) {
  // Dokumen yang ditampilkan di section Verifikasi (foto dipisah ke section sendiri).
  const docs = documents.filter((doc) => doc.kind !== 'foto');

  const field = (name) => ({
    value: value[name] || '',
    onChange: (e) => onChange(name, e.target.value),
  });

  return (
    <div className="bg-white rounded-lg border border-line overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-brand px-6 py-3">
        <span className="text-sm font-semibold text-white">
          Tambah / Edit Biodata
        </span>
        <Pencil className="w-4 h-4 text-white/80" />
      </div>

      {/* Body: 2 kolom di tablet/desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 p-4 md:p-6">
        {/* ===== KIRI ===== */}
        <div className="flex flex-col gap-6">
          {/* Identitas Atlet */}
          <section>
            <SectionTitle>Identitas Atlet</SectionTitle>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel label="NIK" required />
                  <TextInput {...field('nik')} placeholder="3273012345678901" disabled={disabled} />
                </div>
                <div>
                  <FieldLabel label="ID PBSI" required />
                  <TextInput {...field('idPbsi')} placeholder="ID-99383" disabled={disabled} />
                </div>
              </div>
              <div>
                <FieldLabel label="Nama Lengkap" required />
                <TextInput {...field('namaLengkap')} placeholder="Jonathan Smith" disabled={disabled} />
              </div>
              <div>
                <FieldLabel label="Nama Ibu Kandung" required />
                <TextInput {...field('namaIbu')} placeholder="Siti Maryam" disabled={disabled} />
              </div>
            </div>
          </section>

          {/* Data Kelahiran */}
          <section>
            <SectionTitle>Data Kelahiran</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Tempat Lahir" required />
                <TextInput {...field('tempatLahir')} placeholder="Jakarta" disabled={disabled} />
              </div>
              <div>
                <FieldLabel label="Tanggal Lahir" required />
                <TextInput type="date" {...field('tanggalLahir')} disabled={disabled} />
              </div>
            </div>
          </section>

          {/* Data Fisik */}
          <section>
            <SectionTitle>Data Fisik</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel label="Jenis Kelamin" required />
                <SelectInput
                  {...field('jenisKelamin')}
                  options={jenisKelaminOptions}
                  placeholder="Pilih jenis kelamin"
                  disabled={disabled}
                />
              </div>
              <div>
                <FieldLabel label="Pegangan Raket" required />
                <SelectInput
                  {...field('peganganRaket')}
                  options={peganganRaketOptions}
                  placeholder="Pilih pegangan raket"
                  disabled={disabled}
                />
              </div>
            </div>
          </section>

          {/* Alamat */}
          <section>
            <SectionTitle>Alamat</SectionTitle>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel label="Alamat" required />
                <TextArea {...field('alamat')} placeholder="Jl. Sudirman No. 12, Senayan" disabled={disabled} />
              </div>
              <div>
                <FieldLabel label="Provinsi Tempat Tinggal" required />
                <TextInput {...field('provinsi')} placeholder="DKI Jakarta" disabled={disabled} />
              </div>
            </div>
            </section> 
            <section>
            <SectionTitle>Foto Atlet</SectionTitle>
            <FotoSection
              value={value}
              files={files}
              existing={existing}
              onFileChange={onFileChange}
              disabled={disabled}
            />
          </section>
        </div>

        {/* ===== KANAN ===== */}
        <div className="flex flex-col gap-6">
          {/* Informasi Klub */}
          <section>
            <SectionTitle>Informasi Klub</SectionTitle>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel label="Klub Saat Ini" required />
                <TextInput {...field('klubSaatIni')} placeholder="PB Jaya Raya" disabled={disabled} />
              </div>
              <div>
                <FieldLabel label="Asal Klub Sebelumnya" />
                <TextInput {...field('asalKlubSebelumnya')} placeholder="PB Tangkas" disabled={disabled} />
              </div>
            </div>
          </section>

          {/* Tanggal Bergabung */}
          <section>
            <SectionTitle>Tanggal Bergabung</SectionTitle>
            <div className="flex flex-col gap-4">
              <div>
                <FieldLabel label="Gabung Satelit Pada" />
                <TextInput type="date" {...field('gabungSatelitPada')} disabled={disabled} />
              </div>
              <div>
                <FieldLabel label="Gabung Jaya Raya Pada" />
                <TextInput type="date" {...field('gabungJayaRayaPada')} disabled={disabled} />
              </div>
            </div>
          </section>

          {/* Status Atlet */}
          <section>
            <SectionTitle>Status Atlet</SectionTitle>
            <div>
              <SelectInput
                {...field('statusAtlet')}
                options={statusOptions}
                placeholder="Pilih status"
                disabled={disabled}
              />
            </div>
          </section>

          {/* Foto Atlet */}
          {/* <section>
            <SectionTitle>Foto Atlet</SectionTitle>
            <FotoSection
              value={value}
              files={files}
              existing={existing}
              onFileChange={onFileChange}
              disabled={disabled}
            />
          </section> */}

          {/* Verifikasi Dokumen */}
          <section>
            <SectionTitle>Verifikasi Dokumen</SectionTitle>
            <div className="flex flex-col gap-3">
              {docs.map((doc) => (
                <DocumentRow
                  key={doc.field}
                  doc={doc}
                  files={files}
                  existing={existing}
                  onFileChange={onFileChange}
                  disabled={disabled}
                />
              ))}
            </div>
            <p className="text-xs text-muted mt-2">
              Format PDF/JPG/PNG, maksimal 5MB per berkas. Dokumen dapat
              dilengkapi menyusul.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}