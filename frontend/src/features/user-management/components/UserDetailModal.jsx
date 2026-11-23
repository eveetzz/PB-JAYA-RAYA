import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Badge from '../../../components/common/Badge';
import { STATUS_AKUN } from '../../../constants/role';

export default function UserDetailModal({
  open,
  onClose,
  user,
  onSaveEmail,
  onToggleStatus,
}) {
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [status, setStatus] = useState(user?.statusAkun || STATUS_AKUN.AKTIF);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const currentIsAktif = user.statusAkun === STATUS_AKUN.AKTIF;

  const rows = [
    { label: 'NAMA LENGKAP', value: user.namaLengkap || '-' },
    {
      label: 'EMAIL',
      value: (
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!editing}
          className={`w-full rounded-lg border px-3 py-2 text-[15px] font-medium ${
            editing
              ? 'border-brand text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand/20'
              : 'border-transparent bg-transparent text-gray-900'
          } disabled:cursor-default`}
        />
      ),
    },
    { label: 'ROLE', value: user.role || '-' },
    {
      label: 'STATUS AKUN',
      value: editing ? (
        <div className="flex flex-col gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-brand bg-white px-3 py-2 text-[15px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            <option value={STATUS_AKUN.AKTIF}>Aktif</option>
            <option value={STATUS_AKUN.NONAKTIF}>Nonaktif</option>
          </select>
          {status === STATUS_AKUN.NONAKTIF && (
            <span className="text-[11px] leading-4 text-red-700">
              Menonaktifkan akun mencabut akses login pengguna (soft delete).
              Data personil tetap tersimpan.
            </span>
          )}
        </div>
      ) : (
        <Badge variant={currentIsAktif ? 'aktif' : 'nonaktif'}>
          {user.statusAkun}
        </Badge>
      ),
    },
  ];

  const resetEdit = () => {
    setEditing(false);
    setEmail(user.email || '');
    setStatus(user.statusAkun || STATUS_AKUN.AKTIF);
    setError('');
  };

  const handleSave = async () => {
    setError('');
    setSubmitting(true);
    try {
      const nextEmail = email.trim();

      if (nextEmail && nextEmail !== user.email) {
        await onSaveEmail(user.uidUser, nextEmail);
      }

      if (status !== user.statusAkun) {
        await onToggleStatus(user.uidUser, status);
      }

      resetEdit();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          'Gagal menyimpan perubahan akun',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detail Akun"
      footer={
        editing ? (
          <>
            <button
              onClick={resetEdit}
              className="px-6 py-2.5 rounded-full border-2 border-muted text-muted font-semibold text-sm hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-dark disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Simpan
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full border-2 border-muted text-muted font-semibold text-sm hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2.5 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-dark"
            >
              Edit Akun
            </button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col bg-white rounded-lg border border-[#882222] overflow-hidden"
            >
              <div className="bg-[#f1efef] px-3.5 py-1.5 border-b border-[#882222]">
                <span className="text-[11px] font-bold underline text-gray-600">
                  {row.label}
                </span>
              </div>
              <div className="px-3.5 py-2.5">
                {typeof row.value === 'string' ? (
                  <span className="text-[15px] font-medium text-gray-900">
                    {row.value}
                  </span>
                ) : (
                  row.value
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}