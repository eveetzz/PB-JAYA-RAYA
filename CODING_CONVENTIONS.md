# Coding Conventions & Standards

Dokumen ini berisi standar dan pakem pengembangan perangkat lunak untuk backend dan frontend aplikasi **PB Jaya Raya**. Setiap pengembang wajib mengikuti konvensi ini agar kode tetap terstruktur, konsisten, dan mudah dirawat.

---

## 1. Arsitektur Folder (Modular Layered Architecture)

Setiap modul di backend disusun secara terisolasi di bawah direktori `src/modules/<nama-modul>/` dengan pembagian layer yang jelas:

- **`<modul>.routes.js`**: Menangani routing Express, pemanggilan middleware otentikasi (`protect`), validasi (`validate`), dan unggah berkas (`localUpload`).
- **`<modul>.controller.js`**: Menangani HTTP Request/Response, penentuan status code HTTP, sertasi meneruskan data ke layer service.
- **`<modul>.service.js`**: Menangani seluruh aturan bisnis (business logic), validasi kondisi bisnis, dan kalkulasi data.
- **`<modul>.repository.js`**: Layer tunggal untuk interaksi dengan database melalui Prisma ORM (Query & Transaksi DB).
- **`<modul>.validation.js`**: Definisi skema validasi request menggunakan Joi.

### Folder Pendukung
- `src/config/`: Konfigurasi basis data, environment, dan pustaka pihak ketiga.
- `src/middlewares/`: Middleware global (`auth.middleware.js`, `error.middleware.js`, `validation.middleware.js`, `permissions.js`).
- `src/utils/`: Helper murni seperti `errorHandler.js` (`appError`), `fileUpload.js`, dan `authHelper.js`.
- `src/templates/`: Template konstanta HTTP status code & format umum.

---

## 2. Penamaan File, Variabel, dan Modul

- **Direktori Modul**: Gunakan `kebab-case` (contoh: `user-management`, `match-analysis`).
- **Nama File**: Gunakan `kebab-case` disertai suffix layernya (contoh: `athlete.controller.js`, `coach.repository.js`).
- **Fungsi & Variabel**: Gunakan `camelCase` deskriptif (contoh: `fetchAthletesController`, `assignSektorAthlete`, `findByNik`).
- **Pola Export**:
  - Gunakan *Named Exports* untuk fungsi service, repository, dan controller.
  - Gunakan *Default Export* untuk Express Router di file `routes.js`.

---

## 3. Konvensi Database & Prisma Schema

### Penamaan Model
- **Tabel Master**: Diawali dengan prefix `M` dan menggunakan `PascalCase` (contoh: `MUser`, `MAtlet`, `MPelatih`, `MOfficial`, `MSektor`).
- **Tabel Relasi / Histori**: Diawali dengan prefix `R` dan menggunakan `PascalCase` (contoh: `RPelatihJenis`, `RPelatihSektor`, `RAtletSektor`).

### Standard Kolom & Primary Key
- **Primary Key**: Menggunakan UUID v4 dalam format `VarChar(36)` dengan penamaan `uid<NamaEntity>` (contoh: `uidUser`, `uidAtlet`).
- **Audit Fields Wajib**:
  ```prisma
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime?
  createdBy String   @db.VarChar(36)
  updatedBy String   @db.VarChar(36)
  deletedBy String?  @db.VarChar(36)
  ```
- **Soft Delete**: Operasi penghapusan data **TIDAK BOLEH** menghapus baris secara permanen dari database (`DELETE`). Wajib memperbarui `deletedAt` dan `deletedBy`. Semua query pendaftaran/pembacaan wajib memfilter `deletedAt: null`.
  - **Pengecualian**: Query khusus halaman Manajemen User (`fetchUser`, `findByEmail`, `findByUidUser` pada `user-management.repository.js`) sengaja **tidak** memfilter `deletedAt`, karena akun Nonaktif harus tetap tampil agar dapat diaktifkan kembali, dan email akun Nonaktif tetap dianggap terpakai untuk mencegah duplikasi. Query otentikasi (`auth.repository.js`) juga tidak memfilter `deletedAt` agar login akun Nonaktif ditolak dengan pesan "Akun telah dinonaktifkan", bukan "Email atau Password salah".

---

## 4. Penanganan Error (Error Handling)

- **Standard Error Throwing**: Gunakan fungsi `appError(message, statusCode)` dari `src/utils/errorHandler.js`.
  ```javascript
  import { appError } from "../../utils/errorHandler.js";

  if (!data) {
    throw appError("Data tidak ditemukan", 404);
  }
  ```
- **Banned**: Dilarang menggunakan `http-errors` (`createError`) atau melempar error string polos tanpa HTTP status code.
- **Controller Error Handling**: Seluruh fungsi async di controller wajib membungkus logika dengan `try...catch` dan meneruskan error ke `next(error)` agar ditangani middleware global.

---

## 5. File Storage (Lokal)

- **Penyimpanan**: Semua berkas diunggah dan disimpan secara lokal pada direktori `backend/uploads/`.
- **Struktur Folder Upload**:
  - `uploads/atlet/foto` & `uploads/atlet/dokumen`
  - `uploads/pelatih/foto` & `uploads/pelatih/sertifikasi`
  - `uploads/official/foto`
- **Helper Upload**: Wajib menggunakan `localUpload` dari `src/utils/fileUpload.js`.
- **Database Path**: Simpan *relative path* berkas di database (contoh: `/uploads/atlet/foto/foto-123456789.png`).

---

## 6. Otentikasi & Aktivasi Akun

- **Dua Tahap Terpisah**:
  1. **Pendataan Master**: Input data Atlet, Pelatih, atau Official tanpa menyertakan email (pasif).
  2. **Aktivasi Akun / Registrasi User**: Admin mendaftarkan email & generate password sementara untuk dihubungkan ke `uidTarget`.
- **Otentikasi & Cookie**: Token JWT disimpan di dalam HTTP-only Cookie (`req.cookies.token`).
- **Otorisasi Permission**: Panggil `protect("permission:key")` sesuai pemetaan di `src/middlewares/permissions.js`.
- **Distribusi Kredensial**: Tidak menggunakan layanan pengiriman email otomatis (Resend/Brevo). Response API aktivasi akun akan mengembalikan kredensial sementara untuk diblast secara manual oleh admin.
- **Status Sinkron**: Jika entitas master dinonaktifkan (`statusAtlet` / `statusPelatih` / `statusOfficial` = "Nonaktif"), akun `MUser` terkait wajib otomatis dinonaktifkan (`statusAkun` = "Nonaktif").
- **Soft Delete Akun**: Menonaktifkan akun dari Manajemen User mengisi `MUser.deletedAt` + `deletedBy`; mengaktifkan kembali mengosongkan keduanya. Menonaktifkan akun hanya mencabut akses login — status master (`statusAtlet` / `statusPelatih` / `statusOfficial`) tidak diubah.
- **Pemutusan Sesi**: `/auth/me` mengembalikan `401` dan menghapus cookie bila akun Nonaktif / ter-soft-delete, sehingga sesi aktif langsung berakhir.

---

## 7. Frontend Standards (React + Vite)

### Arsitektur: Feature-Based (Domain-Driven)
- **`src/features/<fitur>/`**: Satu folder per domain bisnis (`auth`, `user-management`, dst), berisi `api/`, `components/`, dan `pages/`. Fitur baru wajib mengikuti pola ini, bukan menaruh semua komponen di folder global.
- **`src/components/common/`**: Hanya komponen UI reusable tanpa logika bisnis (`Badge`, `Modal`, `Pagination`, `SearchInput`, `Sidebar`).
- **`src/layouts/`**: Shell aplikasi (`AdminLayout`) yang membungkus sidebar, header mobile, dan konten.
- **`src/context/`**: State global (`AuthContext`).
- **`src/constants/`**: Data statis (`role.js`, `navigation.js`).
- **`src/routes/`**: Guard route (`ProtectedRoute`).
- **`src/services/api.js`**: Instance Axios tunggal.

### Penamaan Frontend
- **Komponen**: `PascalCase` (`UserSummaryCards.jsx`).
- **File API/konstanta**: `kebab-case` (`user-management.api.js`, `navigation.js`).
- **Hook & fungsi**: `camelCase` (`useAuth`, `handleSubmit`).
- **Handler event**: Prefix `handle` (`handleSaveEmail`).

### Autentikasi & Otorisasi
- **Cookie-Based**: JWT berada di HttpOnly Cookie. **Dilarang** menyimpan token di `localStorage` / `sessionStorage`. Axios wajib `withCredentials: true`.
- **Interceptor**: Error `401` memicu redirect ke `/login` (kecuali sedang di `/login`).
- **RBAC Dua Lapis**: Menu disembunyikan via `roles` di `navigation.js`, dan route dijaga `ProtectedRoute` berdasarkan `allowedRoles`.
- **Redirect Default**: `/` mengarah ke `/dashboard`. Tanpa sesi valid, `ProtectedRoute` melempar ke `/login`.

### Standar UI/UX
- **Mobile-First**: Class dasar untuk layar kecil, breakpoint `md:` / `lg:` untuk naik ke tablet/desktop.
- **Sidebar**: Drawer overlay di mobile, sticky `w-[244px]` di desktop.
- **Tabel**: Multi-kolom di desktop, berubah menjadi susunan kartu vertikal di mobile.
- **Aksesibilitas**: Target sentuh minimal 44px dan font input minimal 16px (mencegah auto-zoom iOS).

### Pengambilan Data
- **Server-Side**: Pencarian, filter, dan pagination dikirim sebagai query params; frontend tidak memfilter dataset besar di memori.
- **Kontrak Response**: `{ status, message, data, meta, summary }`.
- **Lapisan Pemanggilan**: Komponen tidak memanggil Axios langsung; gunakan modul `api/` milik fitur.
