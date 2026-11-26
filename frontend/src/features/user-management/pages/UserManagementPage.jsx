import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import UserSummaryCards from "../components/UserSummaryCards";
import UserTable from "../components/UserTable";
import UserDetailModal from "../components/UserDetailModal";
import CreateUserModal from "../components/CreateUserModal";
import ManualUserModal from "../components/ManualUserModal";
import SearchInput from "../../../components/common/SearchInput";
import Pagination from "../../../components/common/Pagination";
import { userManagementApi } from "../api/user-management.api";
import { ROLES } from "../../../constants/role";

const TABS = [
  { key: "semua", label: "Semua User" },
  { key: "punya", label: "Sudah Punya Akun" },
  { key: "belum", label: "Belum Punya Akun" },
];

const ITEMS_PER_PAGE = 7;

const EMPTY_SUMMARY = {
  atlet: { total: 0, punyaAkun: 0, belumAkun: 0 },
  pelatih: { total: 0, punyaAkun: 0, belumAkun: 0 },
  official: { total: 0, punyaAkun: 0, belumAkun: 0 },
};

export default function UserManagementPage() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [meta, setMeta] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("semua");
  const [selectedRole, setSelectedRole] = useState(ROLES.ATLET);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [detailUser, setDetailUser] = useState(null);
  const [createUser, setCreateUser] = useState(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [notice, setNotice] = useState(null);

  // Fetch data setiap filter / halaman berubah
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page,
          limit: ITEMS_PER_PAGE,
        };
        if (selectedRole) params.role = selectedRole;
        if (activeTab === "punya") params.status = "punya";
        if (activeTab === "belum") params.status = "belum";
        if (search.trim()) params.search = search.trim();

        const res = await userManagementApi.fetchUsers(params);
        if (cancelled) return;

        setRows(res.data.data || []);
        setSummary(res.data.summary || EMPTY_SUMMARY);
        setMeta(
          res.data.meta || {
            page: 1,
            limit: ITEMS_PER_PAGE,
            total: 0,
            totalPages: 1,
          },
        );
      } catch (err) {
        if (cancelled) return;
        setError(err.response?.data?.message || "Gagal memuat data pengguna");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, selectedRole, search, page, refreshKey]);

  const refresh = () => setRefreshKey((key) => key + 1);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleSaveEmail = async (uidUser, email) => {
    await userManagementApi.updateEmail(uidUser, email);
    showNotice("success", "Email akun berhasil diperbarui.");
    refresh();
  };

  const handleToggleStatus = async (uidUser, statusAkun) => {
    await userManagementApi.updateStatus(uidUser, statusAkun);
    showNotice("success", `Status akun diubah menjadi ${statusAkun}.`);
    refresh();
  };

  const handleCreateAccount = async ({ uid, email, role }) => {
    const res = await userManagementApi.addRoles([{ uid, email }], role);
    refresh();
    return res.data;
  };

  const handleManualCreate = async ({ email, role, password }) => {
    const res = await userManagementApi.registerUser({ email, role, password });
    refresh();
    return res.data;
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-surface px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-[32px] font-bold leading-tight text-ink">
            Manajemen User
          </h1>
          <span className="text-sm text-muted">
            Kelola akun Atlet, Pelatih, dan Official PB Jaya Raya
          </span>
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

      {/* Summary cards sebagai filter role */}
      <UserSummaryCards
        summary={summary}
        selectedRole={selectedRole}
        onSelect={handleRoleSelect}
      />

      {/* Tabel */}
      <div className="flex flex-col bg-white rounded-lg border border-line">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 bg-surface p-4 border-b border-line">
          <div className="flex bg-brand-light p-1 rounded overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-white text-brand"
                    : "text-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:ml-auto w-full md:w-auto">
            <div className="flex-1 md:w-[240px]">
              <SearchInput
                placeholder="Cari nama / email / NIK."
                value={search}
                onChange={handleSearchChange}
              />
            </div>
            <button
              onClick={() => setManualOpen(true)}
              className="w-10 h-10 flex items-center justify-center bg-brand hover:bg-brand-dark text-white rounded-lg transition-colors"
              aria-label="Tambah User"
              title="Tambah User"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Konten */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted">
            <Loader2 className="w-5 h-5 animate-spin" />
            Memuat data pengguna...
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">{error}</div>
        ) : (
          <>
            <UserTable
              users={rows}
              loading={loading}
              onDetail={setDetailUser}
              onCreateAccount={setCreateUser}
            />

            {meta.total > 0 && (
              <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                totalItems={meta.total}
                itemsPerPage={meta.limit}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <UserDetailModal
        key={detailUser?.key || "detail-empty"}
        open={!!detailUser}
        user={detailUser}
        onClose={() => setDetailUser(null)}
        onSaveEmail={handleSaveEmail}
        onToggleStatus={handleToggleStatus}
      />

      <CreateUserModal
        key={createUser?.key || "create-empty"}
        open={!!createUser}
        user={createUser}
        onClose={() => {
          setCreateUser(null);
          refresh();
        }}
        onSubmit={handleCreateAccount}
      />

      <ManualUserModal
        open={manualOpen}
        onClose={() => {
          setManualOpen(false);
          refresh();
        }}
        onSubmit={handleManualCreate}
      />
    </div>
  );
}
