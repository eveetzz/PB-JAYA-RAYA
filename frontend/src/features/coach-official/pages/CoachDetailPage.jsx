import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Loader2, Pencil } from "lucide-react";
import CoachProfileSummary from "../components/CoachProfileSummary";
import { coachOfficialApi } from "../api/coach-official.api";
import { resolveFileUrl } from "../constants";
import { useAuth } from "../../../context/AuthContext";
import { ROLES } from "../../../constants/role";

export default function CoachDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const canManage =
    user?.role === ROLES.ADMIN || user?.role === ROLES.MANAJEMEN;
  const filterTipe = location.state?.tipe;
  const hasFilterState = Boolean(location.state && "tipe" in location.state);
  const backPath = hasFilterState
    ? filterTipe
      ? `/pelatih-official?tipe=${filterTipe}`
      : "/pelatih-official"
    : "/pelatih-official?tipe=Pelatih";

  // Data sendiri: tombol kembali arahkan ke dashboard, bukan ke daftar.
  const isSelf = user?.role === ROLES.PELATIH && user?.uidPelatih === id;
  const backTarget = isSelf ? "/dashboard" : backPath;
  const backLabel = isSelf ? "Kembali ke Dashboard" : "Kembali ke Daftar";

  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await coachOfficialApi.fetchCoach(id);
        if (cancelled) return;
        setCoach(res.data.data);
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || "Gagal memuat detail pelatih.");
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
        Memuat detail pelatih...
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="p-4 md:p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Data pelatih tidak ditemukan."}
        </div>
        <button
          type="button"
          onClick={() => navigate(backTarget)}
          className="mt-4 flex items-center gap-1 text-[#b80012] font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          {isSelf ? "Kembali ke Dashboard" : "Kembali ke Data Pelatih"}
        </button>
      </div>
    );
  }

  const getFile = (field) => {
    const saved = coach[field];
    if (!saved) return null;
    return { url: resolveFileUrl(saved), name: saved, picked: false };
  };

  return (
    <div className="flex flex-col gap-6 w-full bg-surface px-4 md:px-6 py-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(backTarget)}
          className="text-[#b80012] hover:opacity-70 transition-opacity"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Eye className="w-5 h-5 text-[#b80012]" />
        <span className="font-semibold text-2xl text-[#0b1c30]">
          View Data Pelatih
        </span>
      </div>

      <div className="border-b border-[#e7bdb8]">
        <div className="flex flex-col items-center px-6 py-3 border-b-2 border-[#b80012] w-fit">
          <span className="font-semibold text-sm text-[#b80012]">Biodata</span>
        </div>
      </div>

      <CoachProfileSummary coach={coach} getFile={getFile} />

      <div className="flex flex-col sm:flex-row sm:justify-end items-center gap-4 pt-4 border-t border-[#e7bdb8]">
        {canManage && (
          <button
            type="button"
            onClick={() =>
              navigate(`/pelatih-official/pelatih/${coach.uidPelatih}/edit`, {
                state: location.state,
              })
            }
            className="w-full sm:w-[150px] h-12 rounded border-2 border-[#b80012] font-bold text-[13px] text-[#b80012] hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Edit Profile
          </button> 
        )}
        <button
          type="button"
          onClick={() => navigate(backTarget)}
          className="w-full sm:w-[150px] h-12 rounded border-2 border-transparent bg-[#b80012] font-bold text-[13px] text-white hover:bg-[#9a0010] transition-colors flex items-center justify-center"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
}
