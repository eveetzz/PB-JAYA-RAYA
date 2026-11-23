import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) {
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between bg-surface p-4 border-t border-line rounded-b-lg">
      <span className="text-sm text-muted">
        Menampilkan {start}-{end} dari {totalItems} User
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-sm border border-line text-muted disabled:opacity-50"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-sm text-xs font-medium ${
              page === currentPage
                ? 'bg-brand text-white'
                : 'border border-line text-ink hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-sm border border-line text-muted disabled:opacity-50"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
