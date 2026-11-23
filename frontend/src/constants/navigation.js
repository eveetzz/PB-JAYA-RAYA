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
import { ROLES } from './role';

// Mapping hak akses menu per role (sesuai workflow).
// Menu yang tidak termasuk role user akan di-hide di sidebar.
export const NAV_SECTIONS = [
  {
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        roles: [ROLES.ADMIN, ROLES.MANAJEMEN, ROLES.ATLET, ROLES.PELATIH, ROLES.OFFICIAL],
      },
      {
        label: 'Data Atlet',
        path: '/atlet',
        icon: Users,
        roles: [ROLES.ADMIN, ROLES.MANAJEMEN, ROLES.ATLET, ROLES.PELATIH, ROLES.OFFICIAL],
      },
      {
        label: 'Data Pelatih/Official',
        path: '/pelatih-official',
        icon: UserCog,
        roles: [ROLES.ADMIN, ROLES.MANAJEMEN, ROLES.PELATIH, ROLES.OFFICIAL],
      },
      {
        label: 'Modul Tes',
        path: '/modul-tes',
        icon: ClipboardList,
        roles: [ROLES.ADMIN, ROLES.MANAJEMEN, ROLES.PELATIH],
      },
      {
        label: 'Laporan Tes',
        path: '/laporan-tes',
        icon: FileBarChart,
        roles: [ROLES.ADMIN, ROLES.MANAJEMEN, ROLES.PELATIH],
      },
      {
        label: 'Daftar Pertandingan',
        path: '/pertandingan',
        icon: Swords,
        roles: [ROLES.ADMIN, ROLES.MANAJEMEN, ROLES.PELATIH, ROLES.OFFICIAL],
      },
      {
        label: 'Laporan Seluruh Pertandingan',
        path: '/laporan-pertandingan',
        icon: FileBarChart,
        roles: [ROLES.ADMIN, ROLES.MANAJEMEN],
      },
      {
        label: 'Ranking',
        path: '/ranking',
        icon: Trophy,
        roles: [ROLES.ADMIN, ROLES.MANAJEMEN, ROLES.ATLET, ROLES.PELATIH, ROLES.OFFICIAL],
      },
    ],
  },
  {
    sectionLabel: 'MANAJEMEN SISTEM',
    items: [
      {
        label: 'Konfigurasi Role Akses',
        path: '/manajemen-user',
        icon: ShieldCheck,
        roles: [ROLES.ADMIN],
      },
    ],
  },
];

export const FOOTER_NAV = [
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    roles: [ROLES.ADMIN, ROLES.MANAJEMEN, ROLES.ATLET, ROLES.PELATIH, ROLES.OFFICIAL],
  },
];

export const LOGOUT_NAV = {
  label: 'Logout',
  icon: LogOut,
};
