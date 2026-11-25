import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import SearchInput from "../../../components/common/SearchInput";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import AthleteCard from "../components/AthleteCard";
import AddAthleteChoiceModal from "../components/AddAthleteChoiceModal";
import AthleteImportModal from "../components/AthleteImportModal";
import { athleteApi } from "../api/athlete.api";
import { useAuth } from "../../../context/AuthContext";
import { ROLES } from "../../../constants/role";

const PAGE_SIZE = 6;

export default function AthleteListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Backend: edit = Admin+Manajemen, delete = Admin saja.
  const role = user?.role;
  const canEdit = role === ROLES.ADMIN || role === ROLES.MANAJEMEN;
  const canDelete = role === ROLES.ADMIN;

  const [athletes, setAthletes] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, totalItems: 0 });
  const [summary, setSummary] = useState({ total: 0, aktif: 0, incomplete: 0 });

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(null);

  const [choiceOpen, setChoiceOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleting, setDeleting] = useState(null); // atlet yang akan dihapus
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Debounce input pencarian agar tidak memanggil API tiap ketikan.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  // Reset daftar setiap filter/refresh berubah, lalu muat halaman terkait.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const isFirstPage = page === 1;
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);
      setError("");

      try {
        const params = { page, limit: PAGE_SIZE };
        if (search) params.search = search;

        const res = await athleteApi.fetchAthletes(params);
        if (cancelled) return;

        const payload = res.data.data || {};
        const rows = payload.data || [];

        setAthletes((prev) => (isFirstPage ? rows : [...prev, ...rows]));
        setMeta(
          payload.meta || { page: 1, totalPages: 1, totalItems: rows.length },
        );
        setSummary(payload.summary || { total: 0, aktif: 0, incomplete: 0 });
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || "Gagal memuat data atlet.");
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
  }, [search, page, refreshKey]);

  const refresh = () => setRefreshKey((key) => key + 1);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const hasMore = meta.page < meta.totalPages;

  // Role Atlet: menu "Data Atlet" langsung menampilkan profil mereka sendiri,
  // bukan daftar semua atlet. Redirect dilakukan setelah semua hooks.
  const isRoleAtlet = role === ROLES.ATLET;
  const atletSelfUid = isRoleAtlet ? user?.uidAtlet : undefined;
  if (isRoleAtlet && atletSelfUid) {
    return <Navigate to={`/atlet/${atletSelfUid}`} replace />;
  }

  const handleLoadMore = () => setPage((current) => current + 1);

  const handleDeleteRequest = (athlete) => {
    setDeleting(athlete);
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setDeleteLoading(true);
    setError("");
    try {
      await athleteApi.deleteAthlete(deleting.uidAtlet);
      showNotice("success", `Data ${deleting.namaLengkap} berhasil dihapus.`);
      setDeleting(null);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus data atlet.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-surface px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-1 self-start text-brand font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali
        </button>

        <div className="flex flex-row items-center md:items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-[32px] font-bold leading-tight text-ink">
              Data Atlet
            </h1>
            <p className="text-xs sm:text-sm text-muted">
              Data atlet yang terdaftar
            </p>
          </div>

          <div className="flex-shrink-0 flex justify-center items-center bg-[#d3e4fe] px-4 py-2 md:px-8 md:py-3 rounded-lg border border-line">
            <div className="flex flex-col items-center">
              <span className="font-medium text-[10px] md:text-xs text-muted whitespace-nowrap">
                TOTAL ATLET
              </span>
              <span className="font-bold text-xl md:text-[32px] leading-tight md:leading-10 text-brand">
                {summary.total}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifikasi */}
      {notice && (
        <div
          className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <span>{notice.message}</span>
          <button onClick={() => setNotice(null)} aria-label="Tutup notifikasi">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toolbar: pencarian + tambah */}
      {!isRoleAtlet && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="CARI NAMA ATAU ID ATLET..."
              value={searchInput}
              onChange={setSearchInput}
            />
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setChoiceOpen(true)}
              className="flex items-center justify-center gap-2 h-12 px-6 bg-brand hover:bg-brand-dark text-white rounded font-semibold text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Atlet
            </button>
          )}
        </div>
      )}

      {/* Daftar atlet */}
      <div className="flex flex-col gap-4">
        {isRoleAtlet ? (
          <div className="py-16 text-center text-sm text-muted bg-white rounded-lg border border-line">
            Akun ini belum terhubung dengan data atlet. Hubungi administrator.
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted bg-white rounded-lg border border-line">
            <Loader2 className="w-5 h-5 animate-spin" />
            Memuat data atlet...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600 bg-white rounded-lg border border-line">
            {error}
          </div>
        ) : athletes.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted bg-white rounded-lg border border-line">
            Belum ada data atlet{search ? ` untuk pencarian "${search}"` : ""}.
          </div>
        ) : (
          <>
            {athletes.map((athlete) => (
              <AthleteCard
                key={athlete.uidAtlet}
                athlete={athlete}
                canEdit={canEdit}
                canDelete={canDelete}
                onView={(item) => navigate(`/atlet/${item.uidAtlet}`)}
                onEdit={(item) => navigate(`/atlet/${item.uidAtlet}/edit`)}
                onDelete={handleDeleteRequest}
              />
            ))}

            {hasMore && (
              <div className="flex justify-center py-1.5">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center justify-center gap-2 bg-white px-12 py-4 rounded-lg border border-line font-semibold text-sm text-brand hover:bg-brand-light disabled:opacity-60"
                >
                  {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                  Tampilkan Lebih Banyak
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal pilihan cara input */}
      <AddAthleteChoiceModal
        open={choiceOpen}
        onClose={() => setChoiceOpen(false)}
        onManual={() => {
          setChoiceOpen(false);
          navigate("/atlet/tambah");
        }}
        onExcel={() => {
          setChoiceOpen(false);
          setImportOpen(true);
        }}
      />

      <AthleteImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => {
          showNotice("success", "Data atlet berhasil diimport.");
          setPage(1);
          refresh();
        }}
      />

      {/* Konfirmasi hapus (soft delete) */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        title="Hapus Data Atlet"
        message={`Yakin ingin menghapus data "${deleting?.namaLengkap}"? Data akan dinonaktifkan, akun login atlet terkait ikut dinonaktifkan, dan tidak dapat dikembalikan.`}
        confirmLabel="Hapus"
      />
    </div>
  );
}
