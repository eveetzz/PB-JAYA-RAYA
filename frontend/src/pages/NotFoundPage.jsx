import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
      <h1 className="text-5xl font-bold text-brand">404</h1>
      <p className="text-muted">Halaman tidak ditemukan.</p>
      <Link to="/dashboard" className="text-brand font-semibold hover:underline">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}
