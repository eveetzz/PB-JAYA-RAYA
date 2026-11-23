import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Modal from '../../../components/common/Modal';

export default function CreateUserModal({ open, onClose, user, onSubmit }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await onSubmit({
        uid: user.uid,
        email: email.trim(),
        role: user.role,
      });

      const failed = res?.data?.failed ?? [];
      const success = res?.data?.success ?? [];
      if (success.length === 0) {
        setError(failed[0]?.reason || 'Gagal membuat akun');
        return;
      }

      setResult(res);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          err.response?.data?.data?.failed?.[0]?.reason ||
          'Gagal membuat akun',
      );
    } finally {
      setLoading(false);
    }
  };

  const temporaryPassword =
    result?.data?.success?.[0]?.temporaryPassword ?? null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Buat Akun"
      footer={
        result ? (
          <button
            onClick={onClose}
            className="px-9 py-2.5 rounded-full bg-[#e11d22] text-white font-semibold text-base hover:bg-red-700"
          >
            Selesai
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 rounded-full border border-[#e11d22] text-[#e11d22] font-semibold text-base hover:bg-red-50"
            >
              Batal
            </button>
            <button
              type="submit"
              form="create-user-form"
              disabled={loading}
              className="flex items-center gap-2 px-9 py-2.5 rounded-full bg-[#e11d22] text-white font-semibold text-base hover:bg-red-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Buat Akun
            </button>
          </>
        )
      }
    >
      {result ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
          <span className="text-base font-semibold text-gray-900">
            Akun berhasil dibuat
          </span>
          <span className="text-sm text-muted">
            Email <span className="font-medium">{user.email || email}</span>{' '}
            sudah terdaftar.
          </span>
          {temporaryPassword && (
            <div className="w-full rounded-lg bg-brand-light border border-line px-4 py-3">
              <span className="text-xs text-muted">Password sementara</span>
              <div className="text-lg font-bold tracking-wide text-ink">
                {temporaryPassword}
              </div>
              <span className="text-xs text-muted">
                Pengguna wajib mengganti password saat login pertama.
              </span>
            </div>
          )}
        </div>
      ) : (
        <form
          id="create-user-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Nama</label>
              <input
                type="text"
                value={user.namaLengkap || ''}
                disabled
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-300 text-base text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-900">Role</label>
              <input
                type="text"
                value={user.role || ''}
                disabled
                className="w-full px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-300 text-base text-gray-900"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email untuk didaftarkan"
              required
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-500 text-base text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
            <span className="text-xs text-muted">
              Email ini akan digunakan untuk login dan menerima password
              sementara.
            </span>
          </div>
        </form>
      )}
    </Modal>
  );
}
