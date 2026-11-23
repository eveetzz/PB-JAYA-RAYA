import { useState } from 'react';
import { Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Modal from '../../../components/common/Modal';

const MANUAL_ROLES = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Manajemen', label: 'Manajemen' },
];

export default function ManualUserModal({ open, onClose, onSubmit }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Manajemen');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await onSubmit({
        email: email.trim(),
        role,
        password: password.trim() || undefined,
      });
      setResult(res);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0]?.message ||
          'Gagal membuat akun',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Tambah User"
      footer={
        result ? (
          <button
            onClick={onClose}
            className="px-9 py-2.5 rounded-full bg-brand text-white font-semibold text-base hover:bg-brand-dark"
          >
            Selesai
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 rounded-full border border-brand text-brand font-semibold text-base hover:bg-red-50"
            >
              Batal
            </button>
            <button
              type="submit"
              form="manual-user-form"
              disabled={loading}
              className="flex items-center gap-2 px-9 py-2.5 rounded-full bg-brand text-white font-semibold text-base hover:bg-brand-dark disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Tambah User
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
            Email <span className="font-medium">{email}</span> terdaftar dengan
            role <span className="font-medium">{role}</span>.
          </span>
          {result?.temporaryPassword ? (
            <div className="w-full rounded-lg bg-brand-light border border-line px-4 py-3">
              <span className="text-xs text-muted">Password sementara</span>
              <div className="text-lg font-bold tracking-wide text-ink">
                {result.temporaryPassword}
              </div>
              <span className="text-xs text-muted">
                Pengguna wajib mengganti password saat login pertama.
              </span>
            </div>
          ) : (
            <span className="text-xs text-muted">
              Password menggunakan nilai yang Anda isi. Pengguna wajib
              mengganti password saat login pertama.
            </span>
          )}
        </div>
      ) : (
        <form
          id="manual-user-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email"
              required
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-500 text-base text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">
              Password
            </label>
            <div className="flex items-center bg-white rounded-xl border border-gray-500 focus-within:ring-2 focus-within:ring-brand/30 focus-within:border-brand">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password (opsional)"
                minLength={5}
                className="w-full bg-transparent px-4 py-3 text-base text-black placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="px-4 py-3 text-gray-500"
                aria-label={
                  showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                }
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <span className="text-xs text-muted">
              Kosongkan untuk membuat password sementara otomatis. Minimal 5
              karakter.
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-900">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-gray-500 text-base text-black focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              {MANUAL_ROLES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted">
              Untuk role Atlet/Pelatih/Official, gunakan tombol “Buat Akun” pada
              baris data personil.
            </span>
          </div>
        </form>
      )}
    </Modal>
  );
}
