import { AlertTriangle, Loader2, X } from 'lucide-react';

// Dialog konfirmasi reusable. Presentational murni; aksi diserahkan ke parent.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Konfirmasi',
  message = '',
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  danger = true,
  loading = false,
  icon: Icon = AlertTriangle,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <span className="text-lg font-bold text-gray-900">{title}</span>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-40"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            <span
              className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                danger ? 'bg-red-50' : 'bg-brand-light'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-brand'}`}
              />
            </span>
            <span className="text-sm text-gray-700 leading-relaxed">
              {message}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pt-2 pb-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 rounded-full border-2 border-muted text-muted font-semibold text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm text-white disabled:opacity-60 ${
              danger
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-brand hover:bg-brand-dark'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}