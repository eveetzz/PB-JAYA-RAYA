export const PERMISSIONS = {
  // --- KHUSUS PELATIH FISIK ---
  "fisik:medical-data:read": { jenis: "pelatih_fisik" },
  "fisik:conditioning:manage": { jenis: "pelatih_fisik" },

  // --- KHUSUS PELATIH TEKNIK ---
  "teknik:match-analysis:read": { jenis: "pelatih_teknik" },
  "teknik:tactics:manage": { jenis: "pelatih_teknik" },

  // --- BISA KEDUANYA (Rangkap Jabatan Aman) ---
  "pelatih:dashboard:view": { jenis: ["pelatih_teknik", "pelatih_fisik"] },
  "pelatih:profile:update": { jenis: ["pelatih_teknik", "pelatih_fisik"] },

  // --- ADMIN/MANAJEMEN ---
  "admin:pelatih:manage": { role: ["Admin", "Manajemen"] },
  "admin:pelatih:delete": { role: ["Admin"] },

  // --- USER MANAGEMENT ---
  "admin:user-management:manage": { role: ["Admin"] },
  "admin:user-management:assign-roles": { role: ["Admin", "Manajemen"] },

  // --- ATHLETE MANAGEMENT ---
  "admin:athlete:manage": { role: ["Admin", "Manajemen"] },
  "admin:athlete:delete": { role: ["Admin"] },
};
