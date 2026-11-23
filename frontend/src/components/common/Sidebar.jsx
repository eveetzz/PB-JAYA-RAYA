import { NavLink, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NAV_SECTIONS, FOOTER_NAV, LOGOUT_NAV } from '../../constants/navigation';

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
  if (typeof IconComponent === 'string') {
    const Comp = ICON_MAP[IconComponent];
    return Comp ? <Comp className="w-[18px] h-[18px] text-muted" /> : null;
  }
  return <IconComponent className="w-[18px] h-[18px] text-muted" />;
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const role = user?.role;

  const renderItem = (item) => {
    if (!item.roles.includes(role)) return null;
    const isActive = location.pathname === item.path;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onClose}
        className={`flex items-center gap-3.5 px-4 py-2 rounded transition-colors ${
          isActive
            ? 'bg-[#d3e4fe] text-brand font-semibold'
            : 'bg-white text-[#5f5e5e] hover:bg-gray-50'
        }`}
      >
        {getNavIcon(item.icon)}
        <span className="text-sm leading-4">{item.label}</span>
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-white p-4 border-r border-[#e7bdb8]">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-4 pt-4 pb-8">
          <div className="w-12 h-12 flex items-center justify-center bg-brand rounded">
            <span className="text-xl font-bold text-white">PB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-brand">PBJR Admin</span>
            <span className="text-sm text-muted">{role || 'User'}</span>
          </div>
        </div>

        {/* Main nav */}
        <nav className="flex flex-col gap-1">
          {NAV_SECTIONS[0].items.map(renderItem)}

          {NAV_SECTIONS[1] && (
            <div className="mt-4">
              <div className="px-4 pt-5 pb-2">
                <span className="text-xs font-bold underline text-[#585b5c]">
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
          item.roles.includes(role) ? renderItem(item) : null
        )}
        <button
          onClick={logout}
          className="flex items-center gap-4 px-4 py-2 rounded text-brand hover:bg-red-50"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span className="text-sm font-semibold leading-4">{LOGOUT_NAV.label}</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden md:flex w-[244px] h-screen sticky top-0 flex-shrink-0">
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
