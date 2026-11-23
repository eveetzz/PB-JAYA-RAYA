import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-40 flex items-center gap-3 bg-white px-4 py-3 border-b border-line">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded hover:bg-gray-50"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5 text-ink" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 flex items-center justify-center bg-brand rounded">
              <span className="text-sm font-bold text-white">PB</span>
            </div>
            <span className="font-bold text-brand">PBJR Admin</span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 min-w-0 bg-surface">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-center bg-surface px-6 py-6 border-t border-[#e7bdb8]">
          <span className="text-xs text-[#717375]">
            Secured by PB Jaya Raya Administrative Protocol
          </span>
        </footer>
      </div>
    </div>
  );
}
