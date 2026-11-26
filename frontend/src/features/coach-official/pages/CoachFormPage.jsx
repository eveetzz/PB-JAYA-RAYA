import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import CoachForm from '../components/CoachForm';
import CoachProfileSummary from '../components/CoachProfileSummary';
import { coachOfficialApi } from '../api/coach-official.api';
import {
  COACH_CERTIFICATIONS,
  COACH_FILE_FIELDS,
  dateInputValue,
  resolveFileUrl,
} from '../constants';

const EMPTY_FORM = {
  namaLengkap: '',
  nik: '',
  jenisKelamin: '',
  tanggalLahir: '',
  kewarganegaraan: 'Indonesia',
  tahunBergabung: '',
  statusPelatih: 'Aktif',
  uidSektor: '',
  pernahMelatihSebelumnya: false,
  klubNegaraSebelumnya: '',
};

export default function CoachFormPage() {
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
    : '/pelatih-official?tipe=Pelatih';

  const [form, setForm] = useState(EMPTY_FORM);
  const [existing, setExisting] = useState(null);
  const [files, setFiles] = useState({});
  const [sektorOptions, setSektorOptions] = useState([]);

  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const sektorRes = await coachOfficialApi.fetchSektors();
        if (cancelled) return;
        setSektorOptions(
          (sektorRes.data.data || []).map((sektor) => ({
            value: sektor.uidSektor,
            label: `${sektor.namaSektor} (${sektor.kategori})`,
          })),
        );

        if (isEdit) {
          const res = await coachOfficialApi.fetchCoach(id);
          if (cancelled) return;
          const data = res.data.data;
          setExisting(data);
          setForm({
            namaLengkap: data.namaLengkap || '',
            nik: data.nik || '',
            jenisKelamin: data.jenisKelamin || '',
            tanggalLahir: dateInputValue(data.tanggalLahir),
            kewarganegaraan: data.kewarganegaraan || 'Indonesia',
            tahunBergabung: data.tahunBergabung || '',
            statusPelatih: data.statusPelatih || 'Aktif',
            uidSektor:
              data.pelatihSektorList?.[0]?.sektor?.uidSektor || '',
            pernahMelatihSebelumnya: Boolean(data.pernahMelatihSebelumnya),
            klubNegaraSebelumnya: data.klubNegaraSebelumnya || '',
          });
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err.response?.data?.message || 'Gagal memuat data pelatih.',
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
      jenisKelamin: 'Jenis Kelamin',
      tanggalLahir: 'Tanggal Lahir',
      kewarganegaraan: 'Kewarganegaraan',
      tahunBergabung: 'Tahun Bergabung',
      uidSektor: 'Sektor',
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
      if (key === 'uidSektor') return;
      if (key === 'pernahMelatihSebelumnya') {
        formData.append(key, value ? 'true' : 'false');
        return;
      }
      formData.append(key, value ?? '');
    });

    formData.append('uidSektor', JSON.stringify(form.uidSektor ? [form.uidSektor] : []));

    COACH_FILE_FIELDS.forEach((field) => {
      if (files[field]) formData.append(field, files[field]);
    });

    return formData;
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const formData = buildFormData();
      if (isEdit) {
        await coachOfficialApi.updateCoach(id, formData);
      } else {
        await coachOfficialApi.createCoach(formData);
      }
      navigate(backPath);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          'Gagal menyimpan data pelatih.',
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

  const previewCoach = useMemo(() => {
    const selectedSektor = sektorOptions.find(
      (option) => option.value === form.uidSektor,
    );
    return {
      ...form,
      status: form.statusPelatih,
      sektor: selectedSektor ? [selectedSektor.label.split(' (')[0]] : [],
      foto: files.foto ? 'preview' : existing?.foto,
      ...COACH_CERTIFICATIONS.reduce((acc, cert) => {
        acc[cert.field] = files[cert.field]
          ? 'preview'
          : existing?.[cert.field];
        return acc;
      }, {}),
    };
  }, [form, files, existing, sektorOptions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        Memuat data pelatih...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full bg-surface px-4 md:px-6 py-6">
      <div className="flex flex-col self-stretch">
        <button
          type="button"
          onClick={() => (step === 'preview' ? setStep('form') : navigate(backPath))}
          className="flex items-center gap-1 self-start"
        >
          <ArrowLeft className="w-3 h-3 text-[#b80012]" />
          <span className="font-semibold text-sm text-[#b80012]">Kembali</span>
        </button>
        <div className="flex flex-col self-stretch pt-1">
          <span className="font-semibold text-2xl text-[#0b1c30]">
            Master Data Pelatih
          </span>
        </div>
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
        <CoachForm
          value={form}
          files={files}
          existing={existing}
          onChange={handleChange}
          onFileChange={handleFileChange}
          sektorOptions={sektorOptions}
          onCancel={() => navigate(backPath)}
          onPreview={handlePreview}
        />
      ) : (
        <div className="flex flex-col gap-6">
          <CoachProfileSummary coach={previewCoach} getFile={getFile} />

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