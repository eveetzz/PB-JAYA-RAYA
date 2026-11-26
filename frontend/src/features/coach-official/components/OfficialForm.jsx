import { useRef, useState } from 'react';
import { Eye, Pencil, Upload } from 'lucide-react';
import {
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
} from './FormPrimitives';

function PhotoUpload({ files, existing, onFileChange }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const picked = files.foto;
  const savedUrl = resolveFileUrl(existing?.foto);
  const previewUrl = preview || savedUrl;

  return (
    <div className="flex flex-col justify-center items-center w-full self-stretch bg-white p-6 md:p-8 rounded border-2 border-dashed border-[#e7bdb8]">
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
          alt="Pratinjau foto official"
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

export default function OfficialForm({
  value,
  files,
  existing,
  onChange,
  onFileChange,
  onCancel,
  onPreview,
}) {
  const field = (name) => ({
    value: value[name] ?? '',
    onChange: (event) => onChange(name, event.target.value),
  });

  return (
    <div className="flex flex-col bg-white rounded-lg border border-[#e7bdb8]">
      <div className="flex justify-between items-center self-stretch bg-[#b80012] px-6 py-2 rounded-t-lg">
        <span className="font-bold text-base text-white">
          Tambah / Edit Biodata
        </span>
        <Pencil className="w-[18px] h-4 text-white" />
      </div>

      <div className="flex flex-col gap-6 p-6">
        <div className="pb-1 border-b border-[#e7bdb8]">
          <span className="font-bold text-base text-[#b80012]">Biodata Utama</span>
        </div>

        <div className="flex flex-col gap-4">
          <SectionLabel>IDENTITAS OFFICIAL</SectionLabel>

          <Field label="Nama Lengkap" required>
            <InputBox {...field('namaLengkap')} placeholder="Nama official" />
          </Field>

          <div className="flex flex-col sm:flex-row gap-4 self-stretch">
            <Field label="NIK" required>
              <InputBox {...field('nik')} placeholder="3201234567890001" />
            </Field>
            <Field label="Tanggal Tahun Lahir" required>
              <DateBox {...field('tanggalLahir')} />
            </Field>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 self-stretch">
            <Field label="Status" required>
              <SelectBox {...field('statusOfficial')} options={STATUS_OPTIONS} />
            </Field>
            <Field label="Jenis Kelamin" required>
              <SelectBox
                {...field('jenisKelamin')}
                options={JENIS_KELAMIN_OPTIONS}
              />
            </Field>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 self-stretch">
            <Field label="Nomor Telepon" required>
              <InputBox {...field('nomorTelp')} placeholder="081234567890" />
            </Field>
            <Field label="Tempat Lahir" required>
              <InputBox {...field('tempatLahir')} placeholder="Jakarta" />
            </Field>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <SectionLabel>FOTO OFFICIAL</SectionLabel>
          <PhotoUpload
            files={files}
            existing={existing}
            onFileChange={onFileChange}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 bg-[#f8f9ff] p-4 md:p-6 border-t border-[#e7bdb8] rounded-b-lg">
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