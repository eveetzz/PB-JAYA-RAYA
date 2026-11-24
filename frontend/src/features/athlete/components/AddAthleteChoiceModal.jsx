import { FileSpreadsheet, PencilLine } from "lucide-react";
import Modal from "../../../components/common/Modal";

// Pilihan cara input data atlet: manual atau import Excel.
export default function AddAthleteChoiceModal({
  open,
  onClose,
  onManual,
  onExcel,
}) {
  const options = [
    {
      key: "manual",
      Icon: PencilLine,
      title: "Input Manual",
      description: "Isi biodata atlet satu per satu melalui formulir.",
      onClick: onManual,
    },
    {
      key: "excel",
      Icon: FileSpreadsheet,
      title: "Import Excel",
      description: "Unggah file Excel untuk menambah banyak atlet sekaligus.",
      onClick: onExcel,
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Tambah Data Atlet">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
        {options.map(({ key, Icon, title, description, onClick }) => (
          <button
            key={key}
            type="button"
            onClick={onClick}
            className="group w-full h-full flex flex-row sm:flex-col items-start gap-3.5 sm:gap-3 p-4 sm:p-5 rounded-xl border border-line bg-white text-left hover:border-brand hover:bg-brand-light/40 hover:shadow-sm transition-all"
          >
            {/* Kotak Ikon */}
            <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-light text-brand flex-shrink-0 group-hover:bg-brand group-hover:text-white transition-colors">
              <Icon className="w-5 h-5" />
            </span>

            {/* Judul & Deskripsi */}
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="font-bold text-base text-ink leading-snug group-hover:text-brand transition-colors">
                {title}
              </span>
              <span className="text-xs sm:text-sm text-muted leading-relaxed">
                {description}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
