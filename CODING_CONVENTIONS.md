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
- **Soft Delete**: Operasi penghapusan data **TIDAK BOHLEH** menghapus baris secara permanen dari database (`DELETE`). Wajib memperbarui `deletedAt` dan `deletedBy`. Semua query pendaftaran/pembacaan wajib memfilter `deletedAt: null`.

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
