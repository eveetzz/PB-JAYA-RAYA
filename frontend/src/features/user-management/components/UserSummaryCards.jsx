import { User, Whistle, UserGroup } from "lucide-react";

const CARDS = [
  { role: "Atlet", label: "ATLET", Icon: User },
  { role: "Pelatih", label: "PELATIH", Icon: Whistle },
  { role: "Official", label: "OFFICIAL", Icon: UserGroup },
];

export default function UserSummaryCards({ summary, selectedRole, onSelect }) {
  const getData = (role) => {
    const key = role.toLowerCase();
    return summary?.[key] ?? { total: 0, punyaAkun: 0, belumAkun: 0 };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {CARDS.map((card) => {
        const data = getData(card.role);
        const isActive = selectedRole === card.role;
        const { Icon } = card;

        return (
          <button
            key={card.role}
            type="button"
            onClick={() => onSelect(isActive ? null : card.role)}
            className={`flex flex-col gap-4 w-full p-6 rounded-lg border text-left transition-all duration-300 ${
              isActive
                ? "bg-brand border-brand-dark text-white shadow-lg scale-[1.02]"
                : "bg-white border-[#dce9ff] text-[#0b1c30] hover:border-brand/40 hover:shadow-sm"
            }`}
          >
            {/* Header: Label + Icon */}
            <div className="flex justify-between items-start self-stretch">
              <span
                className={`font-semibold text-[20px] leading-[16px] ${
                  isActive ? "text-white" : "text-[#5f5e5e]"
                }`}
              >
                {card.label}
              </span>
              <div
                className={`flex items-center justify-center w-10 h-10 rounded ${
                  isActive ? "bg-white/20" : "bg-[#eff4ff]"
                }`}
              >
                <Icon
                  className={`w-[30px] h-5 ${
                    isActive ? "text-white" : "text-[#b80012]"
                  }`}
                />
              </div>
            </div>

            {/* Total */}
            <div className="flex items-end gap-2 self-stretch">
              <span
                className={`font-bold text-[36px] leading-[32px] ${
                  isActive ? "text-white" : "text-[#0b1c30]"
                }`}
              >
                {data.total}
              </span>
              <span
                className={`font-medium text-xs pb-1 ${
                  isActive ? "text-white/80" : "text-[#5f5e5e]"
                }`}
              >
                Total
              </span>
            </div>

            {/* Divider */}
            <div
              className={`border-t ${
                isActive ? "border-white/20" : "border-[#e5eeff]"
              }`}
            />

            {/* Status akun */}
            <div className="flex gap-4 self-stretch">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span
                  className={`font-medium text-xs ${
                    isActive ? "text-white/90" : "text-[#5f5e5e]"
                  }`}
                >
                  Punya Akun: {data.punyaAkun}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-[#ba1a1a] rounded-full" />
                <span
                  className={`font-medium text-xs ${
                    isActive ? "text-white/90" : "text-[#5f5e5e]"
                  }`}
                >
                  Belum Akun: {data.belumAkun}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
