import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Loader2, Plus, X } from 'lucide-react';
import SearchInput from '../../../components/common/SearchInput';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import CoachOfficialSummaryCards from '../components/CoachOfficialSummaryCards';
import CoachOfficialCard from '../components/CoachOfficialCard';
import AddChoiceModal from '../components/AddChoiceModal';
import ImportModal from '../components/ImportModal';
import { coachOfficialApi } from '../api/coach-official.api';
import { STAFF_TIPE, TIPE_ALL } from '../constants';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../constants/role';

const PAGE_SIZE = 6;

const isTipeValid = (value) =>
  value === STAFF_TIPE.PELATIH ||
  value === STAFF_TIPE.OFFICIAL ||
  value === TIPE_ALL;

export default function CoachOfficialListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTipe = searchParams.get('tipe');
  // Tanpa ?tipe, default-nya kartu Pelatih yang terpilih.
  const selectedTipe = isTipeValid(rawTipe) ? rawTipe : STAFF_TIPE.PELATIH;
  // Tipe yang dikirim ke API. "Semua" berarti gabungan tanpa filter.
  const filterTipe = selectedTipe === TIPE_ALL ? null : selectedTipe;

  const role = user?.role;
  const canEdit = role === ROLES.ADMIN || role === ROLES.MANAJEMEN;
  const canDelete = role === ROLES.ADMIN;

  const [people, setPeople] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [summary, setSummary] = useState({
    totalPelatih: 0,
    totalOfficial: 0,
  });

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  const [choiceOpen, setChoiceOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importTipe, setImportTipe] = useState(STAFF_TIPE.PELATIH);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const isFirstPage = page === 1;
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);
      setError('');

      try {
        const params = { page, limit: PAGE_SIZE };
        if (filterTipe) params.tipe = filterTipe;
        if (search) params.search = search;

        const res = await coachOfficialApi.fetchList(params);
        if (cancelled) return;

        const payload = res.data.data || {};
        const rows = payload.data || [];

        setPeople((prev) => (isFirstPage ? rows : [...prev, ...rows]));
        setMeta(
          payload.meta || { page: 1, totalPages: 1, totalItems: rows.length },
        );
        setSummary(
          payload.summary || { totalPelatih: 0, totalOfficial: 0 },
        );
      } catch (err) {
        if (cancelled) return;
        setError(
          err.response?.data?.message ||
            'Gagal memuat data pelatih dan official.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filterTipe, search, page, refreshKey]);

  const refresh = () => setRefreshKey((key) => key + 1);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const handleSelectTipe = (tipe) => {
    const next = new URLSearchParams(searchParams);
    // null = klik kartu aktif -> tanpa filter, ditandai lewat ?tipe=Semua.
    next.set('tipe', tipe || TIPE_ALL);
    setPage(1);
    setSearchParams(next);
  };

  const handleAdd = () => setChoiceOpen(true);

  const handleManual = (tipe) => {
    setChoiceOpen(false);
    const slug = tipe === STAFF_TIPE.OFFICIAL ? 'official' : 'pelatih';
    navigate(`/pelatih-official/tambah/${slug}`, {
      state: { tipe: selectedTipe },
    });
  };

  const handleExcel = (tipe) => {
    setChoiceOpen(false);
    setImportTipe(tipe);
    setImportOpen(true);
  };

  const handleView = (person) => {
    const slug = person.tipe === STAFF_TIPE.OFFICIAL ? 'official' : 'pelatih';
    navigate(`/pelatih-official/${slug}/${person.uid}`, {
      state: { tipe: selectedTipe },
    });
  };

  const handleEdit = (person) => {
    const slug = person.tipe === STAFF_TIPE.OFFICIAL ? 'official' : 'pelatih';
    navigate(`/pelatih-official/${slug}/${person.uid}/edit`, {
      state: { tipe: selectedTipe },
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setError('');
    try {
      if (deleting.tipe === STAFF_TIPE.OFFICIAL) {
        await coachOfficialApi.deleteOfficial(deleting.uid);
      } else {
        await coachOfficialApi.deleteCoach(deleting.uid);
      }
      showNotice('success', `Data ${deleting.namaLengkap} berhasil dihapus.`);
      setDeleting(null);
      refresh();
    } catch (err) {
      showNotice(
        'error',
        err.response?.data?.message || 'Gagal menghapus data.',
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const addLabel =
    selectedTipe === STAFF_TIPE.PELATIH
      ? 'Tambah Pelatih'
      : selectedTipe === STAFF_TIPE.OFFICIAL
        ? 'Tambah Official'
        : 'Tambah Data';

  const hasMore = meta.page < meta.totalPages;

  // Role Pelatih/Official: daftar gabungan disembunyikan, arahkan ke data diri.
  const selfProfilePath =
    role === ROLES.PELATIH && user?.uidPelatih
      ? `/pelatih-official/pelatih/${user.uidPelatih}`
      : role === ROLES.OFFICIAL && user?.uidOfficial
        ? `/pelatih-official/official/${user.uidOfficial}`
        : null;

  if (selfProfilePath) {
    return <Navigate to={selfProfilePath} replace />;
  }

  return (
    <div className="flex flex-col gap-6 w-full p-4 md:p-6 bg-surface">
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 self-start text-brand font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </button>
        <h1 className="font-bold text-2xl md:text-[32px] text-ink leading-tight">
          Data Pelatih &amp; Official
        </h1>
        <p className="text-sm text-muted">
          Kelola biodata pelatih dan official Jaya Raya.
        </p>
      </div>

      {notice && (
        <div
          className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            notice.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)} aria-label="Tutup notifikasi">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <CoachOfficialSummaryCards
        summary={summary}
        selectedTipe={selectedTipe}
        onSelect={handleSelectTipe}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 self-stretch">
        <div className="flex-1">
          <SearchInput
            placeholder="CARI NAMA ATAU NIK..."
            value={searchInput}
            onChange={setSearchInput}
          />
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={handleAdd}
            className="h-12 w-full sm:w-auto flex items-center justify-center gap-2 bg-brand px-6 rounded font-bold text-base text-white hover:bg-brand-dark transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {addLabel}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted bg-white rounded-lg border border-line">
          <Loader2 className="w-5 h-5 animate-spin" />
          Memuat data...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-red-600 bg-white rounded-lg border border-line">
          {error}
        </div>
      ) : people.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted bg-white rounded-lg border border-line">
          Belum ada data{search ? ` untuk pencarian "${search}"` : ''}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 self-stretch">
            {people.map((person) => (
              <CoachOfficialCard
                key={`${person.tipe}-${person.uid}`}
                person={person}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={setDeleting}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center self-stretch pb-16">
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={loadingMore}
                className="flex items-center gap-2 px-12 py-4 rounded border border-[#e7bdb8] hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                <span className="font-bold text-base text-[#b80012]">
                  Tampilkan Lebih Banyak
                </span>
                <ChevronDown className="w-3 h-[7px] text-[#b80012]" />
              </button>
            </div>
          )}
        </>
      )}

      <AddChoiceModal
        open={choiceOpen}
        onClose={() => setChoiceOpen(false)}
        tipe={selectedTipe === TIPE_ALL ? null : selectedTipe}
        onManual={handleManual}
        onExcel={handleExcel}
      />

      <ImportModal
        open={importOpen}
        tipe={importTipe}
        onClose={() => setImportOpen(false)}
        onImported={() => {
          showNotice(
            'success',
            `Data ${importTipe.toLowerCase()} berhasil diimport.`,
          );
          setPage(1);
          refresh();
        }}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Hapus Data"
        message={`Yakin ingin menghapus data "${deleting?.namaLengkap}"? Data akan dinonaktifkan, akun login terkait ikut dinonaktifkan, dan tidak dapat dikembalikan.`}
        confirmLabel="Hapus"
      />
    </div>
  );
}