import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Pencil } from 'lucide-react';
import AthleteProfileSummary from '../components/AthleteProfileSummary';
import { athleteApi } from '../api/athlete.api';
import { resolveFileUrl } from '../constants';
import { useAuth } from '../../../context/AuthContext';

const TABS = [
  { key: 'biodata', label: 'Biodata', enabled: true },
  { key: 'pertandingan', label: 'Lap Pertandingan', enabled: false },
  { key: 'tes-fisik', label: 'Hasil Tes Fisik', enabled: false },
  { key: 'ranking', label: 'Ranking', enabled: false },
];

export default function AthleteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;
  const canManage =
    role === 'Admin' || role === 'Manajemen';
  // Role Atlet hanya melihat profil sendiri; "Kembali" diarahkan ke dashboard
  // agar tidak masuk loop: list -> redirect detail -> list.
  const backPath = role === 'Atlet' ? '/dashboard' : '/atlet';

  const [athlete, setAthlete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('biodata');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await athleteApi.fetchAthleteById(id);
        if (cancelled) return;
        setAthlete(res.data.data);
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Gagal memuat detail atlet.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
        Memuat detail atlet...
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="bg-surface px-4 md:px-6 py-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || 'Data atlet tidak ditemukan.'}
        </div>
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="mt-4 flex items-center gap-1 text-brand font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Data Atlet
        </button>
      </div>
    );
  }

  // Detail menampilkan berkas yang sudah tersimpan di database.
  const getFile = (field) => {
    const saved = athlete[field];
    if (!saved) return null;
    return { url: resolveFileUrl(saved), name: saved, picked: false };
  };

  const fotoUrl = resolveFileUrl(athlete.foto);

  return (
    <div className="w-full flex flex-col gap-6 bg-surface px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate(backPath)}
          className="flex items-center gap-1 self-start text-brand font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl border-2 border-brand bg-white">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt={athlete.namaLengkap}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-brand">
                  {athlete.namaLengkap?.charAt(0) || 'A'}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xl md:text-2xl text-ink">
                {athlete.namaLengkap}
              </span>
              <span className="text-sm text-muted">
                {athlete.idPbsi} • {athlete.provinsi}
              </span>
            </div>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => navigate(`/atlet/${athlete.uidAtlet}/edit`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded border border-brand text-surface bg-brand font-bold text-sm hover:bg-brand-dark"
            >
              <Pencil className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 overflow-x-auto border-b border-line">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            disabled={!tab.enabled}
            onClick={() => tab.enabled && setActiveTab(tab.key)}
            className={`pb-3 whitespace-nowrap font-semibold text-sm border-b-2 transition-colors ${
              activeTab === tab.key && tab.enabled
                ? 'border-brand text-brand'
                : 'border-transparent text-muted'
            } ${!tab.enabled ? 'opacity-40 cursor-not-allowed' : 'hover:text-brand'}`}
            title={!tab.enabled ? 'Segera hadir' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'biodata' && (
        <AthleteProfileSummary athlete={athlete} getFile={getFile} />
      )}
    </div>
  );
}