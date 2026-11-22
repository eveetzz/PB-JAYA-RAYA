# Milestone 1: User Management, Master Data Entry & Authentication

## 1. Goal / Objective
Membangun fondasi pendataan master entitas (Atlet, Pelatih, Official) dan manajemen akun pengguna (`MUser`) serta sistem autentikasi/otorisasi berbasis role dan permission.

---

## 2. Status
- **Backend Status**: ✅ Selesai (Completed)
- **Frontend Status**: ⏳ Menunggu Integrasi

---

## 3. Scope & Feature List

### A. Data Master Entry (Tanpa Email)
- **Atlet (`/athlete`)**:
  - `POST /athlete/import-data`: Pendaftaran atlet & unggah berkas lokal (Foto, STTB, KK, NISN, Akte).
  - `GET /athlete`: Menampilkan daftar atlet aktif.
  - `PUT /athlete/:id/assign-sektor`: Penetapan/pindah sektor atlet.
  - `PATCH /athlete/edit/:id`: Perbaruan data atlet & berkas.
  - `DELETE /athlete/delete/:id`: Soft delete atlet & otomatis nonaktifkan `MUser` terkait.

- **Pelatih (`/coach`)**:
  - `POST /coach/import-data`: Pendaftaran pelatih, penetapan jenis pelatih via sektor, & unggah sertifikasi.
  - `GET /coach`: Menampilkan daftar pelatih aktif.
  - `DELETE /coach/delete/:id`: Soft delete pelatih & otomatis nonaktifkan `MUser` terkait.

- **Official (`/official`)**:
  - `POST /official/import-data`: Pendaftaran official & unggah foto.
  - `GET /official`: Menampilkan daftar official.
  - `DELETE /official/delete/:id`: Soft delete official & otomatis nonaktifkan `MUser` terkait.

### B. User Management & Aktivasi Akun (`/user`)
- `POST /user/register`: Pendaftaran user manual oleh Admin.
- `POST /user/add-roles`: Aktivasi akun dari master data (Atlet/Pelatih/Official) dengan memasukkan email & menghasilkan kredensial sementara.
- `GET /user`: Menampilkan seluruh daftar user beserta relasi master data.

### C. Authentication & Authorization (`/auth`)
- `POST /auth/login`: Otentikasi user via email & password, verifikasi `statusAkun`, pembuatan token JWT via cookie.
- `GET /auth/me`: Pengecekan status sesi real-time & pengambil data profil lengkap.
- `POST /auth/logout`: Menghapus cookie JWT token.

---

## 4. Key Architectural Decisions
1. **Lokal Storage**: Seluruh berkas disimpan di `backend/uploads/` terpisah per folder entitas.
2. **Standard Error**: Menggunakan `appError(message, statusCode)` secara konsisten.
3. **Manual Credentials Blast**: Hasil aktivasi akun mengembalikan password sementara pada payload response API untuk diblast secara manual oleh Admin.
