import { Pencil, Trash2, UserRound } from 'lucide-react';
import { isAthleteIncomplete, resolveFileUrl } from '../constants';

// Card atlet: seluruh kartu dapat diklik untuk melihat detail.
// Tombol aksi (edit/delete) memakai stopPropagation agar tidak membuka detail.
export default function AthleteCard({
  athlete,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) {
  const incomplete = isAthleteIncomplete(athlete);
  const isAktif = athlete.statusAtlet === 'Aktif';
  const fotoUrl = resolveFileUrl(athlete.foto);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onView(athlete);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView(athlete)}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-4 self-stretch bg-white p-4 md:p-6 rounded-lg cursor-pointer transition-all duration-200
        border border-brand/20 border-l-4 ${
          incomplete
            ? 'border-l-[#ba1a1a]'
            : 'border-l-transparent'
        }
        hover:bg-gray-50 hover:shadow-sm
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40`}
    >
      {/* Foto + dot status */}
      <div className="relative shrink-0">
        <div
          className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center overflow-hidden rounded-xl border-1 ${
            isAktif ? 'border-line' : ' border-brand/40'
          }`}
        >
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={athlete.namaLengkap}
              className="w-full h-full object-cover"
            />
          ) : (
            <UserRound className="w-8 h-8 text-[#c8c6c5]" />
          )}
        </div>

        {/* Dot status akun */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
            isAktif ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={athlete.statusAtlet}
        />
      </div>

      {/* Identitas */}
      <div className="flex flex-col grow min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-lg md:text-xl text-ink truncate">
            {athlete.namaLengkap || '-'}
          </span>
          {/* {incomplete && (
            <span className="shrink-0 bg-[#ffdad6] px-2 py-0.5 rounded-sm font-medium text-xs text-[#93000a]">
              Incomplete
            </span>
          )} */}
        </div>

        <div className="flex items-center gap-3 flex-wrap text-sm font-semibold text-muted">
          <span>{athlete.idPbsi || '-'}</span>
          <span className="w-1 h-1 rounded-full bg-[#926f6a]" />
          <span>{athlete.provinsi || '-'}</span>
        </div>

        {incomplete && (
          <span className="pt-1 font-medium text-xs text-[#ba1a1a]">
            *belum melengkapi dokumen
          </span>
        )}
      </div>

      {/* Aksi: edit (Admin/Manajemen), delete (Admin saja) */}
      <div className="flex items-center gap-1 shrink-0">
        {canEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(athlete);
            }}
            className="p-2.5 rounded-xl text-muted hover:bg-brand-light hover:text-brand"
            aria-label={`Edit data ${athlete.namaLengkap}`}
            title="Edit data"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(athlete);
            }}
            className="p-2.5 rounded-xl text-muted hover:bg-red-50 hover:text-red-600"
            aria-label={`Hapus data ${athlete.namaLengkap}`}
            title="Hapus data"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}