# Milestone 2: Frontend Authentication & User Management

## 1. Goal / Objective
Membangun antarmuka **React + Vite + Tailwind** yang mobile-first (tablet-oriented) untuk modul Login dan Manajemen User, mengonsumsi API dari MS-01 dengan autentikasi berbasis HttpOnly Cookie, serta menetapkan fondasi arsitektur frontend untuk modul-modul berikutnya.

---

## 2. Status
- **Backend Status**: ✅ Selesai (penyesuaian endpoint pendukung)
- **Frontend Status**: ✅ Selesai (Login + User Management)
- **Verifikasi**: `npm run lint` & `npm run build` bersih; uji runtime login, list user, dan round-trip soft delete berhasil

---

## 3. Scope & Feature List

### A. Fondasi Frontend
- **Tooling**: Vite + React + Tailwind CSS v4 (`@tailwindcss/vite`), token tema di `index.css`.
- **Struktur Feature-Based**: `src/features/<fitur>/{api,components,pages}`, `components/common`, `layouts`, `context`, `constants`, `routes`, `services`.
- **Proxy Dev**: Vite `/api` → `http://localhost:5001` dengan rewrite penghapus prefix `/api`.
- **Axios Instance**: `withCredentials: true` + interceptor global error `401` → redirect `/login`.

### B. Authentication (`/login`)
- `LoginForm.jsx`: login via **email** + password, toggle show/hide password, pesan error dari backend.
- `AuthContext.jsx`: bootstrap sesi via `GET /auth/me`, expose `user`, `login`, `logout`.
- `ProtectedRoute.jsx`: guard route berdasarkan status login dan `allowedRoles`.
- **Redirect Default**: `/` → `/dashboard`; tanpa cookie valid → `/login`.

### C. User Management (`/dashboard/users`)
- **Summary Cards sebagai Filter Role**: klik kartu = filter aktif (gaya penuh `bg-brand` + teks putih), klik lagi = bersihkan filter.
- **Tabs**: Semua User / Belum Punya Akun.
- **Server-Side**: pencarian, filter role, dan pagination dikirim sebagai query params; backend mengembalikan `data`, `meta`, `summary`.
- **Tabel Responsif**: multi-kolom di desktop, susunan kartu vertikal di mobile. Kolom `NAMA + email` / `ROLE` / `STATUS` / `AKSI`. **UID tidak ditampilkan**.
- **Status Akun**: hanya `AKTIF` / `NONAKTIF`, plus state terpisah `Belum Punya Akun`.
- **Modal Detail Akun**: menampilkan Nama Lengkap, Email, Role, Status Akun. Mode view: tombol **Batal** + **Edit Akun**. Toggle status hanya di dalam form edit.
- **Modal Buat Akun (personil)**: email saja (tanpa UID/password), role otomatis dari tipe personil, menampilkan password sementara hasil generate.
- **Modal Tambah User (manual)**: email + role (Admin/Manajemen) + **password opsional**; kosong = password sementara otomatis `PBJR@<hex>`.

### D. Sidebar & RBAC
- `Sidebar.jsx` global di `components/common/`, dipakai semua modul.
- Menu disembunyikan otomatis berdasarkan array `roles` di `constants/navigation.js`.
- Responsif: drawer overlay di mobile, sticky `w-[244px]` di desktop.

### E. Penyesuaian Backend Pendukung
- `GET /user`: menggabungkan master personil + `MUser` sehingga baris `Belum Punya Akun` muncul; filtering/pagination/summary dihitung server-side.
- `PATCH /user/:uidUser/email`: ubah email akun.
- `PATCH /user/:uidUser/status`: soft delete `MUser` (`statusAkun` + `deletedAt`/`deletedBy`), tanpa mengubah `statusAtlet` / `statusPelatih` / `statusOfficial`.
- `POST /user/register`: `password` opsional → generate password sementara bila kosong.
- `fetchUser` / `findByEmail` / `findByUidUser` tidak memfilter `deletedAt` agar akun Nonaktif tetap terdaftar dan bisa diaktifkan kembali.
- `GET /auth/me`: mengembalikan `401` + menghapus cookie untuk akun Nonaktif.

### F. Dokumentasi
- `CODING_CONVENTIONS.md`: section **Frontend Standards** (arsitektur, penamaan, auth, UI/UX, data fetching), catatan **pengecualian soft delete**, dan aturan **Soft Delete Akun**.

---

## 4. Key Architectural Decisions
1. **Cookie-Based Auth**: JWT hanya di HttpOnly Cookie; dilarang menyimpan token di `localStorage`/`sessionStorage`.
2. **RBAC Dua Lapis**: menu disembunyikan di UI, route dijaga `ProtectedRoute` di level router.
3. **Backend-Driven Data**: pencarian, filter role, dan pagination diproses server; frontend hanya merender.
4. **Layered API**: komponen tidak memanggil Axios langsung, selalu via `api/<fitur>.api.js`.
5. **Komponen Reusable Tanpa Logika Bisnis**: `Modal`, `Badge`, `Pagination`, `SearchInput`, `Sidebar` di `components/common/`.
6. **Soft Delete pada `MUser`**: menonaktifkan akun hanya mencabut akses login, status master tidak berubah.
7. **Distribusi Kredensial Manual**: password sementara dikembalikan di payload response untuk diblast Admin.
