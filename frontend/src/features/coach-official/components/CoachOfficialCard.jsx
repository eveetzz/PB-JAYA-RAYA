import { Pencil, Trash2 } from "lucide-react";
import { STAFF_TIPE, isStaffIncomplete, resolveFileUrl } from "../constants";

// Card pelatih/official: seluruh kartu dapat diklik untuk melihat detail.
// Tombol aksi (edit/delete) memakai stopPropagation agar tidak membuka detail.
// Hover mengikuti AthleteCard agar konsisten antar modul.
export default function CoachOfficialCard({
  person,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) {
  const incomplete = isStaffIncomplete(person);
  const isAktif = person.status === "Aktif";
  const fotoUrl = resolveFileUrl(person.foto);
  const secondary =
    person.tipe === STAFF_TIPE.OFFICIAL
      ? person.tempatLahir
      : person.sektorUtama || person.kewarganegaraan;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onView?.(person);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onView?.(person)}
      onKeyDown={handleKeyDown}
      className={`flex flex-col items-center h-full self-stretch bg-white p-4 md:p-6 rounded-lg border border-brand/20  cursor-pointer transition-all duration-200
        ${incomplete ? "border-l-[#ba1a1a] border-l-4" : "border-l-[##ba1a1a]"}
        hover:bg-gray-50 hover:shadow-sm
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40`}
    >
      {/* Foto + dot status */}
      <div className="relative mb-4">
        <div
          className={`w-24 h-24 flex items-center justify-center overflow-hidden rounded-xl border bg-[#f4f5f7] ${
            isAktif ? "border-line" : "border-brand/40"
          }`}
        >
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={person.namaLengkap}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-brand/30">
              {person.namaLengkap?.charAt(0) || "C"}
            </span>
          )}
        </div>

        {/* Dot status: hijau Aktif, merah Nonaktif */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${
            isAktif ? "bg-green-500" : "bg-red-500"
          }`}
          title={person.status || "-"}
        >
          <span className="sr-only">{person.status || "-"}</span>
        </span>
      </div>

      <h3 className="font-semibold text-lg md:text-xl text-center text-ink mb-1 break-words line-clamp-2 min-h-[3.5rem]">
        {person.namaLengkap || "-"}
      </h3>

      <p className="font-semibold text-sm text-center text-muted mb-1 break-words min-h-[20px]">
        {person.nik || "-"} • {secondary || "-"}
      </p>

      <span className="text-[11px] font-semibold text-muted mb-3">
        {person.tipe}
      </span>

      <span
        className={`font-medium text-xs text-[#ba1a1a] mb-2 min-h-[16px] ${
          incomplete ? "visible" : "invisible"
        }`}
        aria-hidden={!incomplete}
      >
        *belum melengkapi dokumen
      </span>

      <div className="flex justify-center gap-1 self-stretch pt-4 border-t border-[#e7bdb8] w-full">
        {canEdit && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit?.(person);
            }}
            className="p-2.5 rounded-xl text-muted hover:bg-brand-light hover:text-brand transition-colors"
            aria-label={`Edit data ${person.namaLengkap}`}
            title="Edit data"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete?.(person);
            }}
            className="p-2.5 rounded-xl text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label={`Hapus data ${person.namaLengkap}`}
            title="Hapus data"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
