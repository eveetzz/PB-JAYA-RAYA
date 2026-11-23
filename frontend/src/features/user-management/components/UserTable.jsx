import { ChevronRight } from 'lucide-react';
import Badge from '../../../components/common/Badge';
import { STATUS_AKUN } from '../../../constants/role';

export default function UserTable({
  users,
  loading,
  onDetail,
  onCreateAccount,
}) {
  if (!loading && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <span className="text-sm font-medium text-muted">
          Tidak ada data yang cocok.
        </span>
        <span className="text-xs text-muted">
          Ubah kata kunci pencarian atau filter yang dipilih.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Desktop header */}
      <div className="hidden md:flex items-center bg-surface border-b border-line px-6 py-3">
        <div className="w-[38%] px-2">
          <span className="text-xs font-semibold underline text-muted">NAMA</span>
        </div>
        <div className="w-[18%] px-2">
          <span className="text-xs font-semibold underline text-muted">ROLE</span>
        </div>
        <div className="w-[24%] px-2">
          <span className="text-xs font-semibold underline text-muted">
            STATUS AKUN
          </span>
        </div>
        <div className="w-[20%] px-2 text-right">
          <span className="text-xs font-semibold underline text-muted">AKSI</span>
        </div>
      </div>

      {users.map((u) => {
        const nama = u.namaLengkap || 'Tanpa Nama';
        const inisial = nama.charAt(0).toUpperCase();
        const isBelumAkun = !u.hasAccount;
        const badgeVariant = isBelumAkun
          ? 'pending'
          : u.statusAkun === STATUS_AKUN.AKTIF
            ? 'aktif'
            : 'nonaktif';
        const statusText = isBelumAkun ? 'Belum Punya Akun' : u.statusAkun;

        return (
          <div
            key={u.key}
            className="flex flex-col md:flex-row md:items-center border-b border-line last:border-b-0 px-4 md:px-6 py-3 md:py-0 hover:bg-gray-50"
          >
            {/* Nama + email */}
            <div className="md:w-[38%] flex items-center gap-3 px-2 py-2 md:py-4 min-w-0">
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-brand rounded-xl text-white font-bold text-sm">
                {inisial}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-ink truncate">
                  {nama}
                </span>
                {u.email && (
                  <span className="text-xs text-muted truncate">{u.email}</span>
                )}
              </div>
            </div>

            {/* Role */}
            <div className="md:w-[18%] px-2 py-1 md:py-4">
              <span className="text-xs text-muted md:hidden mr-1">Role:</span>
              <span className="text-sm text-muted">{u.role}</span>
            </div>

            {/* Status */}
            <div className="md:w-[24%] px-2 py-1 md:py-4">
              <Badge variant={badgeVariant}>{statusText}</Badge>
            </div>

            {/* Aksi */}
            <div className="md:w-[20%] px-2 py-1 md:py-4 flex md:justify-end">
              {isBelumAkun ? (
                <button
                  onClick={() => onCreateAccount(u)}
                  className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                >
                  Buat Akun
                  <ChevronRight className="w-3 h-3" />
                </button>
              ) : (
                <button
                  onClick={() => onDetail(u)}
                  className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
                >
                  Detail
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
