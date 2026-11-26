import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import OfficialForm from '../components/OfficialForm';
import OfficialProfileSummary from '../components/OfficialProfileSummary';
import { coachOfficialApi } from '../api/coach-official.api';
import { dateInputValue, resolveFileUrl } from '../constants';

const EMPTY_FORM = {
  namaLengkap: '',
  nik: '',
  tanggalLahir: '',
  jenisKelamin: '',
  statusOfficial: 'Aktif',
  nomorTelp: '',
  tempatLahir: '',
};

export default function OfficialFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = Boolean(id);
  const filterTipe = location.state?.tipe;
  const hasFilterState = Boolean(location.state && 'tipe' in location.state);
  const backPath = hasFilterState
    ? filterTipe
      ? `/pelatih-official?tipe=${filterTipe}`
      : '/pelatih-official'
    : '/pelatih-official?tipe=Official';

  const [form, setForm] = useState(EMPTY_FORM);
  const [existing, setExisting] = useState(null);
  const [files, setFiles] = useState({});

  const [step, setStep] = useState('form');
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
        const res = await coachOfficialApi.fetchOfficial(id);
        if (cancelled) return;
        const data = res.data.data;
        setExisting(data);
        setForm({
          namaLengkap: data.namaLengkap || '',
          nik: data.nik || '',
          tanggalLahir: dateInputValue(data.tanggalLahir),
          jenisKelamin: data.jenisKelamin || '',
          statusOfficial: data.statusOfficial || 'Aktif',
          nomorTelp: data.nomorTelp || '',
          tempatLahir: data.tempatLahir || '',
        });
      } catch (err) {
        if (cancelled) return;
        setError(
          err.response?.data?.message || 'Gagal memuat data official.',
        );
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

  const missingFields = useMemo(() => {
    const required = {
      namaLengkap: 'Nama Lengkap',
      nik: 'NIK',
      tanggalLahir: 'Tanggal Lahir',
      jenisKelamin: 'Jenis Kelamin',
      nomorTelp: 'Nomor Telepon',
      tempatLahir: 'Tempat Lahir',
    };
    return Object.entries(required)
      .filter(([key]) => !String(form[key] ?? '').trim())
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
      formData.append(key, value ?? '');
    });
    if (files.foto) formData.append('foto', files.foto);
    return formData;
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const formData = buildFormData();
      if (isEdit) {
        await coachOfficialApi.updateOfficial(id, formData);
      } else {
        await coachOfficialApi.createOfficial(formData);
      }
      navigate(backPath);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          'Gagal menyimpan data official.',
      );
      setStep('form');
    } finally {
      setSaving(false);
    }
  };

  const getFile = (field) => {
    const picked = files[field];
    if (picked) {
      return { url: URL.createObjectURL(picked), name: picked.name, picked: true };
    }
    const saved = existing?.[field];
    if (saved) {
      return { url: resolveFileUrl(saved), name: saved, picked: false };
    }
    return null;
  };

  const previewOfficial = useMemo(
    () => ({
      ...form,
      status: form.statusOfficial,
      foto: files.foto ? 'preview' : existing?.foto,
    }),
    [form, files, existing],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        Memuat data official...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full bg-surface px-4 md:px-6 py-6">
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => (step === 'preview' ? setStep('form') : navigate(backPath))}
          className="flex items-center gap-1 self-start"
        >
          <ArrowLeft className="w-3 h-3 text-[#b80012]" />
          <span className="font-semibold text-sm text-[#b80012]">Kembali</span>
        </button>
        <span className="font-semibold text-2xl text-[#0b1c30] pt-1">
          Master Data Official
        </span>
        <span className="font-normal text-sm text-[#5f5e5e]">
          Kelola informasi biodata dan histori klub atlet secara terpusat
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 'form' ? (
        <OfficialForm
          value={form}
          files={files}
          existing={existing}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onCancel={() => navigate(backPath)}
          onPreview={handlePreview}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <OfficialProfileSummary official={previewOfficial} getFile={getFile} />

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-[#e7bdb8]">
            <button
              type="button"
              onClick={() => setStep('form')}
              className="w-full sm:w-[260px] h-12 rounded border-2 border-[#b80012] font-bold text-base text-[#b80012] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 w-full h-12 flex items-center justify-center gap-2 bg-[#b80012] rounded font-bold text-base text-white hover:bg-[#9a0010] transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}