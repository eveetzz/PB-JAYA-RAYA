import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Login gagal, periksa email dan password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7 w-full">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-1 text-sm font-semibold text-ink md:text-[18px]">
          <Mail className="w-3.5 h-3.5" />
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan email"
          required
          className="w-full bg-brand-light rounded border border-[#e7bdb8] px-4 py-2.5 text-base text-ink placeholder:text-[#926f6a] focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <label className="flex items-center gap-1 text-sm font-semibold text-ink md:text-[18px]">
          <Lock className="w-3.5 h-3.5" />
          Password
        </label>
        <div className="flex items-center bg-brand-light rounded border border-[#e7bdb8]">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-transparent px-4 py-2.5 text-base text-ink placeholder:text-[#926f6a] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="px-4 py-2 text-muted"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-brand hover:bg-brand-dark text-white font-semibold py-4 rounded-lg transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
        Login
      </button>
    </form>
  );
}
