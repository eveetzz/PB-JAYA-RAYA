export const PERMISSIONS = {
  // --- COACH SPECIFIC ---
  "coach:medical-data:read": { jenis: "pelatih_fisik" },
  "coach:conditioning:manage": { jenis: "pelatih_fisik" },
  "coach:match-analysis:read": { jenis: "pelatih_teknik" },
  "coach:tactics:manage": { jenis: "pelatih_teknik" },

  // --- GENERAL COACH ---
  "coach:dashboard:view": { jenis: ["pelatih_teknik", "pelatih_fisik"] },
  "coach:profile:update": { jenis: ["pelatih_teknik", "pelatih_fisik"] },

  // --- ADMIN/MANAGEMENT ---
  "admin:coach:manage": { role: ["Admin", "Manajemen"] },
  "admin:coach:delete": { role: ["Admin"] },
  
  "admin:athlete:manage": { role: ["Admin", "Manajemen"] },
  "admin:athlete:delete": { role: ["Admin"] },

  "admin:official:manage": { role: ["Admin", "Manajemen"] },
  "admin:official:delete": { role: ["Admin"] },

  "admin:user:manage": { role: ["Admin"] },
  "admin:user:assign-roles": { role: ["Admin", "Manajemen"] },
};
