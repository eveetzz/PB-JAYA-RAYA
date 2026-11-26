import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCog,
  ClipboardList,
  FileBarChart,
  Swords,
  Trophy,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  NAV_SECTIONS,
  FOOTER_NAV,
  LOGOUT_NAV,
} from "../../constants/navigation";
import { ROLES } from "../../constants/role";
import logoJaya from "../../assets/logo_jaya.png";

// Icon map statis untuk menu karena NAV_SECTIONS menyimpan referensi icon
const ICON_MAP = {
  LayoutDashboard,
  Users,
  UserCog,
  ClipboardList,
  FileBarChart,
  Swords,
  Trophy,
  ShieldCheck,
  Settings,
};

function getNavIcon(IconComponent) {
  if (typeof IconComponent === "string") {
    const Comp = ICON_MAP[IconComponent];
    return Comp ? <Comp className="w-[18px] h-[18px] text-muted" /> : null;
  }
  return <IconComponent className="w-[18px] h-[18px] text-muted" />;
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.role;

  // Role Atlet/Pelatih/Official: modul data diri memakai label "Informasi Saya"
  // dan langsung menuju profil mereka sendiri, bukan halaman daftar.
  const resolveItem = (item) => {
    if (item.path === "/atlet" && role === ROLES.ATLET && user?.uidAtlet) {
      return { label: "Informasi Saya", path: `/atlet/${user.uidAtlet}` };
    }

    if (
      item.path === "/pelatih-official" &&
      role === ROLES.PELATIH &&
      user?.uidPelatih
    ) {
      return {
        label: "Informasi Saya",
        path: `/pelatih-official/pelatih/${user.uidPelatih}`,
      };
    }

    if (
      item.path === "/pelatih-official" &&
      role === ROLES.OFFICIAL &&
      user?.uidOfficial
    ) {
      return {
        label: "Informasi Saya",
        path: `/pelatih-official/official/${user.uidOfficial}`,
      };
    }

    return { label: item.label, path: item.path };
  };

  const renderItem = (item) => {
    if (!item.roles.includes(role)) return null;
    const { label, path: target } = resolveItem(item);
    // Active juga saat berada di sub-route (mis. /atlet/:id, /atlet/tambah).
    const isActive =
      location.pathname === target ||
      location.pathname === item.path ||
      location.pathname.startsWith(`${item.path}/`);
    return (
      <NavLink
        key={item.path}
        to={target}
        onClick={onClose}
        className={`flex items-center gap-3.5 px-4 py-2 rounded transition-colors ${
          isActive
            ? "bg-[#d3e4fe] text-brand font-semibold"
            : "bg-white text-[#5f5e5e] hover:bg-gray-50"
        }`}
      >
        {getNavIcon(item.icon)}
        <span className="text-sm leading-4">{label}</span>
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white p-4 border-r border-[#e7bdb8]">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-4 pt-4 pb-8">
          <div className="w-12 h-12 flex items-center justify-center rounded overflow-hidden">
            <img
              src={logoJaya}
              alt="Logo Jaya Raya"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-bold text-brand">PB Jaya Raya</span>
            <span className="text-sm text-muted">{role || "User"}</span>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex flex-col gap-1">
          {NAV_SECTIONS[0].items.map(renderItem)}

          {NAV_SECTIONS[1]?.items.some((item) => item.roles.includes(role)) && (
            <div className="mt-4">
              <div className="px-4 pt-5 pb-2">
                <span className="text-xs font-bold text-[#585b5c]">
                  {NAV_SECTIONS[1].sectionLabel}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_SECTIONS[1].items.map(renderItem)}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer nav + logout */}
      <div className="flex flex-col gap-1 pt-4 border-t border-[#e7bdb8]">
        {FOOTER_NAV.map((item) =>
          item.roles.includes(role) ? renderItem(item) : null,
        )}
        <button
          onClick={logout}
          className="flex items-center gap-4 px-4 py-2 rounded text-brand hover:bg-red-50"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span className="text-sm font-semibold leading-4">
            {LOGOUT_NAV.label}
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden md:flex flex-col w-[244px] h-dvh sticky top-0 flex-shrink-0 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-10 w-[244px] h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
