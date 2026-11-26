import { UserCog, Users } from 'lucide-react';
import { STAFF_TIPE } from '../constants';

const CARDS = [
  { tipe: STAFF_TIPE.PELATIH, label: 'PELATIH', Icon: Users },
  { tipe: STAFF_TIPE.OFFICIAL, label: 'OFFICIAL', Icon: UserCog },
];

// Kartu ringkasan mengikuti gaya UserSummaryCards:
// default polos (putih), berwarna brand hanya saat tipe terpilih.
export default function CoachOfficialSummaryCards({
  summary,
  selectedTipe,
  onSelect,
}) {
  const getTotal = (tipe) =>
    tipe === STAFF_TIPE.PELATIH
      ? (summary?.totalPelatih ?? 0)
      : (summary?.totalOfficial ?? 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {CARDS.map((card) => {
        const isActive = selectedTipe === card.tipe;
        const { Icon } = card;

        return (
          <button
            key={card.tipe}
            type="button"
            onClick={() => onSelect(isActive ? null : card.tipe)}
            aria-pressed={isActive}
            className={`flex flex-col gap-4 w-full p-6 rounded-lg border text-left transition-all duration-300 ${
              isActive
                ? 'bg-brand border-brand-dark text-white shadow-lg scale-[1.02]'
                : 'bg-white border-[#dce9ff] text-[#0b1c30] hover:border-brand/40 hover:shadow-sm'
            }`}
          >
            {/* Header: Label + Icon */}
            <div className="flex justify-between items-start self-stretch">
              <span
                className={`font-semibold text-[20px] leading-[16px] ${
                  isActive ? 'text-white' : 'text-[#5f5e5e]'
                }`}
              >
                {card.label}
              </span>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded ${
                  isActive ? 'bg-white/20' : 'bg-[#eff4ff]'
                }`}
              >
                <Icon
                  className={`w-[30px] h-5 ${
                    isActive ? 'text-white' : 'text-[#b80012]'
                  }`}
                />
              </div>
            </div>

            {/* Total */}
            <div className="flex items-end gap-2 self-stretch">
              <span
                className={`font-bold text-[36px] leading-[32px] ${
                  isActive ? 'text-white' : 'text-[#0b1c30]'
                }`}
              >
                {getTotal(card.tipe)}
              </span>
              <span
                className={`font-medium text-xs pb-1 ${
                  isActive ? 'text-white/80' : 'text-[#5f5e5e]'
                }`}
              >
                Total
              </span>
            </div>

            {/* Divider */}
            <div
              className={`border-t ${
                isActive ? 'border-white/20' : 'border-[#e5eeff]'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
