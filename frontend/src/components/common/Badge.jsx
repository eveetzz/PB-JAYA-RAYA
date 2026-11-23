// Badge status akun / role
// variant: aktif (hijau), nonaktif (merah), pending (amber)
export default function Badge({ variant = 'aktif', children }) {
  const styles = {
    aktif: 'bg-green-100 border-green-500 text-green-700',
    nonaktif: 'bg-red-100 border-red-600 text-red-700',
    pending: 'bg-amber-100 border-amber-200 text-yellow-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
