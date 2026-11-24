import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import AthleteForm from '../components/AthleteForm';
import AthleteProfileSummary from '../components/AthleteProfileSummary';
import { athleteApi } from '../api/athlete.api';
import {
  ATHLETE_DOCUMENTS,
  JENIS_KELAMIN_OPTIONS,
  PEGANGAN_RAKET_OPTIONS,
  STATUS_ATLET_OPTIONS,
  resolveFileUrl,
} from '../constants';

const EMPTY_FORM = {
  namaLengkap: '',
  nik: '',
  idPbsi: '',
  namaIbu: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: '',
  peganganRaket: '',
  provinsi: '',
  statusAtlet: 'Aktif',
  alamat: '',
  klubSaatIni: '',
  asalKlubSebelumnya: '',
  gabungSatelitPada: '',
  gabungJayaRayaPada: '',
};

const dateInputValue = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

// Form tambah/edit atlet dengan fase preview sebelum simpan.
export default function AthleteFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [existing, setExisting] = useState(null);
  const [files, setFiles] = useState({});

  const [step, setStep] = useState('form'); // 'form' | 'preview'
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await athleteApi.fetchAthleteById(id);
        const data = res.data.data;
        if (cancelled) return;

        setExisting(data);
        setForm({
          namaLengkap: data.namaLengkap || '',
          nik: data.nik || '',
          idPbsi: data.idPbsi || '',
          namaIbu: data.namaIbu || '',
          tempatLahir: data.tempatLahir || '',
          tanggalLahir: dateInputValue(data.tanggalLahir),
          jenisKelamin: data.jenisKelamin || '',
          peganganRaket: data.peganganRaket || '',
          provinsi: data.provinsi || '',
          statusAtlet: data.statusAtlet || 'Aktif',
          alamat: data.alamat || '',
          klubSaatIni: data.klubSaatIni || '',
          asalKlubSebelumnya: data.asalKlubSebelumnya || '',
          gabungSatelitPada: dateInputValue(data.gabungSatelitPada),
          gabungJayaRayaPada: dateInputValue(data.gabungJayaRayaPada),
        });
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Gagal memuat data atlet.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  // Validasi ringan di sisi klien sebelum masuk fase preview.
  const missingFields = useMemo(() => {
    const required = {
      namaLengkap: 'Nama Lengkap',
      nik: 'NIK',
      idPbsi: 'ID PBSI',
      namaIbu: 'Nama Ibu',
      tempatLahir: 'Tempat Lahir',
      tanggalLahir: 'Tanggal Lahir',
      jenisKelamin: 'Jenis Kelamin',
      peganganRaket: 'Pegangan Raket',
      provinsi: 'Provinsi',
      alamat: 'Alamat',
      klubSaatIni: 'Klub Saat Ini',
    };
    return Object.entries(required)
      .filter(([key]) => !String(form[key] || '').trim())
      .map(([, label]) => label);
  }, [form]);

  const handlePreview = () => {
    setError('');
    if (missingFields.length) {
      setError(`Lengkapi data berikut: ${missingFields.join(', ')}.`);
      return;
    }
    setStep('preview');
  };

  const buildFormData = () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      // hanya kirim kolom yang boleh masuk body (file ditangani terpisah)
      if (key === 'statusAtlet' && !value) return;
      formData.append(key, value ?? '');
    });
    ATHLETE_DOCUMENTS.forEach((doc) => {
      if (files[doc.field]) formData.append(doc.field, files[doc.field]);
    });
    return formData;
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const formData = buildFormData();
      if (isEdit) {
        await athleteApi.updateAthlete(id, formData);
      } else {
        await athleteApi.createAthlete(formData);
      }
      navigate('/atlet');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          'Gagal menyimpan data atlet.',
      );
      setStep('form');
    } finally {
      setSaving(false);
    }
  };

  const previewAthlete = useMemo(
    () => ({
      ...form,
      foto: files.foto ? 'preview' : existing?.foto,
      fileSttbSd: files.fileSttbSd ? 'preview' : existing?.fileSttbSd,
      fileKk: files.fileKk ? 'preview' : existing?.fileKk,
      fileNisnOnline: files.fileNisnOnline ? 'preview' : existing?.fileNisnOnline,
      fileAkteKelahiran: files.fileAkteKelahiran
        ? 'preview'
        : existing?.fileAkteKelahiran,
    }),
    [form, files, existing],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        Memuat data atlet...
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 bg-surface px-4 md:px-6 py-6">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => (step === 'preview' ? setStep('form') : navigate('/atlet'))}
          className="flex items-center gap-1 self-start text-brand font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-[32px] font-bold leading-tight text-ink">
            Data Atlet
          </h1>
          <p className="text-sm md:text-base text-muted">
            {isEdit
              ? 'Perbarui biodata dan dokumen atlet.'
              : 'Lengkapi biodata dan dokumen atlet.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 'form' ? (
        <>
          <AthleteForm
            value={form}
            files={files}
            existing={existing}
            onChange={handleChange}
            onFileChange={handleFileChange}
            jenisKelaminOptions={JENIS_KELAMIN_OPTIONS}
            peganganRaketOptions={PEGANGAN_RAKET_OPTIONS}
            statusOptions={STATUS_ATLET_OPTIONS}
            documents={ATHLETE_DOCUMENTS}
          />

          <div className="flex flex-col sm:flex-row justify-end gap-4 bg-white rounded border border-line p-4 md:p-6">
            <button
              type="button"
              onClick={() => navigate('/atlet')}
              className="px-8 py-3 rounded border border-brand text-brand font-bold text-sm text-center hover:bg-red-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="px-8 py-3 rounded-lg bg-brand-dark text-white font-bold text-sm text-center hover:bg-brand"
            >
              View Data
            </button>
          </div>
        </>
      ) : (
        <PreviewPanel
          athlete={previewAthlete}
          files={files}
          existing={existing}
          onBack={() => setStep('form')}
          onSubmit={handleSubmit}
          saving={saving}
        />
      )}
    </div>
  );
}

function PreviewPanel({ athlete, files, existing, onBack, onSubmit, saving }) {
  // Builder berkas untuk AthleteProfileSummary:
  // file baru => object URL; file tersimpan => path diselesaikan; kosong => null.
  const getFile = (field) => {
    const picked = files?.[field];
    if (picked) {
      return { url: URL.createObjectURL(picked), name: picked.name, picked: true };
    }
    const saved = existing?.[field];
    if (saved) {
      return { url: resolveFileUrl(saved), name: saved, picked: false };
    }
    return null;
  };

  const previewAthlete = {
    ...athlete,
    foto: athlete.foto || existing?.foto,
    fileSttbSd: athlete.fileSttbSd || existing?.fileSttbSd,
    fileKk: athlete.fileKk || existing?.fileKk,
    fileNisnOnline: athlete.fileNisnOnline || existing?.fileNisnOnline,
    fileAkteKelahiran: athlete.fileAkteKelahiran || existing?.fileAkteKelahiran,
  };

  return (
    <div className="flex flex-col gap-6">
      <AthleteProfileSummary athlete={previewAthlete} getFile={getFile} />

      <div className="flex flex-col sm:flex-row justify-end gap-4 bg-white rounded border border-line p-4 md:p-6">
        <button
          type="button"
          onClick={onBack}
          className="px-8 py-3 rounded border border-brand text-brand font-bold text-sm text-center hover:bg-red-50"
        >
          Edit Profile
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-brand text-white font-bold text-sm text-center hover:bg-brand-dark disabled:opacity-60"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Simpan
        </button>
      </div>
    </div>
  );
}