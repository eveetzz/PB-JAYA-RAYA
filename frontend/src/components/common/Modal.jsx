import { X } from 'lucide-react';

// Wrapper modal/dialog reusable, mobile-first: bottom sheet feel via centering + padding.
export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl border border-gray-100 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <span className="text-lg font-bold text-gray-900">{title}</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 pt-2 pb-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
