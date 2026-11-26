import { FileSpreadsheet, PencilLine } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { STAFF_TIPE } from '../constants';

const OPTIONS = [
  {
    key: 'manual',
    Icon: PencilLine,
    title: 'Input Manual',
    description: 'Isi biodata satu per satu melalui formulir.',
  },
  {
    key: 'excel',
    Icon: FileSpreadsheet,
    title: 'Import Excel',
    description: 'Unggah file Excel untuk menambah banyak data sekaligus.',
  },
];

function ChoiceButton({ Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full flex items-start gap-3.5 p-4 sm:p-5 rounded-xl border border-line bg-white text-left hover:border-brand hover:bg-brand-light/40 hover:shadow-sm transition-all"
    >
      <span className="flex items-center justify-center w-11 h-11 rounded-lg bg-brand-light text-brand flex-shrink-0 group-hover:bg-brand group-hover:text-white transition-colors">
        <Icon className="w-5 h-5" />
      </span>
      <span className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="font-bold text-base text-ink leading-snug group-hover:text-brand transition-colors">
          {title}
        </span>
        <span className="text-xs sm:text-sm text-muted leading-relaxed">
          {description}
        </span>
      </span>
    </button>
  );
}

export default function AddChoiceModal({
  open,
  onClose,
  tipe,
  onManual,
  onExcel,
}) {
  const types = tipe ? [tipe] : [STAFF_TIPE.PELATIH, STAFF_TIPE.OFFICIAL];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tipe ? `Tambah Data ${tipe}` : 'Tambah Data'}
    >
      <div className="flex flex-col gap-5">
        {types.map((type) => (
          <div key={type} className="flex flex-col gap-3">
            {!tipe && (
              <span className="text-xs font-bold uppercase tracking-wide text-muted">
                {type}
              </span>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
              {OPTIONS.map(({ key, Icon, title, description }) => (
                <ChoiceButton
                  key={`${type}-${key}`}
                  Icon={Icon}
                  title={title}
                  description={description}
                  onClick={() =>
                    key === 'manual' ? onManual(type) : onExcel(type)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}