# Milestone 04–06: Modul Pelatih/Official (Backend + Frontend)

## 1. Goal / Objective
Membangun modul data master Pelatih dan Official secara end-to-end: backend (master sektor, CRUD Pelatih/Official, import Excel dengan dry-run, endpoint daftar gabungan), frontend (daftar gabungan dengan filter tipe, form manual, halaman detail, import Excel), serta sidebar role-aware yang menampilkan data diri sendiri untuk akun Atlet, Pelatih, dan Official.

Dokumen ini menggabungkan tiga milestone yang dirujuk di `docs/milestones/README.md`:

| ID | Nama Milestone | Cakupan |
|---|---|---|
| `MS-04` | Bulk Import Excel (Pelatih, Official) | Importer + template Excel + validasi dry-run untuk Pelatih dan Official |
| `MS-05` | Manajemen Sektor, Penjadwalan & Latihan | Bagian **Manajemen Sektor** selesai (tabel, seed, endpoint, dropdown form). Bagian **Penjadwalan & Latihan** belum dikerjakan |
| `MS-06` | Modul Data Master Frontend (Pelatih, Official) | Halaman list gabungan, form manual, detail, import Excel, sidebar role-aware |

---

## 2. Status
- **Backend Status**: ✅ Selesai (MS-04, MS-05 bagian Manajemen Sektor)
- **Frontend Status**: ✅ Selesai (MS-06)
- **Verifikasi**: `npm run lint` dan `npm run build` di `frontend/` bersih; `node --check` bersih untuk file backend yang diubah. Uji runtime: login, daftar gabungan + filter tipe, create Pelatih/Official, detail, edit (termasuk relasi sektor), import dry-run Pelatih & Official, delete, dan matrix akses detail (data sendiri `200`, data orang lain `403`). Data uji dihapus setelah verifikasi.

---

## 3. Scope & Feature List

### A. Database & Master Sektor
- Tabel `MSektor` (`uidSektor`, `namaSektor`, `kategori` enum `KategoriSektor` default `Teknik`, soft delete) dan `RPelatihSektor` (relasi Pelatih↔Sektor dengan `startDate`/`endDate` plus soft delete).
- Script seed `backend/src/seed/seedSektor.js`, dijalankan lewat `npm run seed:sektor` dari folder `backend/`. Seed bersifat idempoten: sektor yang sudah ada dilewati. Isi awal 6 sektor: Tunggal Putra, Tunggal Putri, Ganda Putra, Ganda Putri, Ganda Campuran (kategori `Teknik`), dan Fisik (kategori `Fisik`).
- `setJenisFromSektor` dipakai saat menyimpan Pelatih agar jenis pelatih turunan dari sektor terpilih tetap sinkron.

### B. Backend — Sektor (`/sektor`)
- `GET /sektor` (jwt `protect()`) mengembalikan daftar sektor aktif. Dipakai form Pelatih untuk dropdown multi-pilih dan dipakai server saat resolusi kolom `sektor` pada import Excel.

### C. Backend — Pelatih (`/coach`)
- `GET /coach` — `protect("coach:dashboard:view")` (perilaku permission asli dipertahankan). Query `search` (nama/NIK), `status` (`Aktif`/`Nonaktif`), `page`, `limit`, `sortBy`, `sortOrder`. Response `{ data, meta, summary }` dengan `summary: { total, aktif, incomplete }`.
- `GET /coach/detail/:id` — `protect()`. Role `Pelatih` hanya boleh membuka detail miliknya; uid milik orang lain ditolak `403`.
- `POST /coach/import-data` — `protect("admin:coach:manage")`, multipart. Field berkas: `foto` + 7 berkas sertifikasi (`fileSertifikasiKota`, `fileSertifikasiProvinsi`, `fileSertifikasiNasional`, `fileSertifikasiBwf1`, `fileSertifikasiBwf2`, `fileSertifikasiSarjanaOlahraga`, `fileSertifikasiMasterOlahraga`).
- `PUT /coach/edit/:id` — `protect("admin:coach:manage")`, multipart. Berkas lama dipertahankan bila tidak diganti. Relasi sektor lama ditutup (`endDate` + `deletedAt`), lalu relasi baru dibuat.
- `DELETE /coach/delete/:id` — `protect("admin:coach:delete")`. Soft delete Pelatih, ubah `statusPelatih` menjadi `Nonaktif`, dan nonaktifkan `MUser` terkait.
- `POST /coach/import-excel` — `protect("admin:coach:manage")`, multipart `file` + `dryRun`. `dryRun=true` (default) hanya memvalidasi; `dryRun=false` menyimpan data.
- `GET /coach/import-template` — unduh `template-import-pelatih.xlsx` berisi sheet `Data Pelatih` + sheet `Petunjuk`.
- Validasi Joi (`backend/src/modules/coach/coach.validation.js`): `nik`, `namaLengkap`, `jenisKelamin` (`L`/`P`), `tanggalLahir` (ISO), `tahunBergabung` (1900 sampai tahun berjalan), `kewarganegaraan` (default `Indonesia`), `pernahMelatihSebelumnya`, `klubNegaraSebelumnya`, `statusPelatih` (`Aktif`/`Nonaktif`), dan `uidSektor` (wajib, minimal satu sektor).

### D. Backend — Official (`/official`)
- `GET /official` — `protect("admin:official:manage")`. Query dan bentuk response sama seperti modul Pelatih: `search`, `status`, `page`, `limit`, `sortBy`, `sortOrder`, `summary: { total, aktif, incomplete }`.
- `GET /official/detail/:id` — `protect()`. Role `Official` hanya boleh membuka detail miliknya; uid milik orang lain ditolak `403`.
- `POST /official/import-data` dan `PUT /official/edit/:id` — `protect("admin:official:manage")`, multipart `foto`. Berkas lama dipertahankan bila foto tidak diunggah ulang.
- `DELETE /official/delete/:id` — `protect("admin:official:delete")`. Soft delete + `statusOfficial` menjadi `Nonaktif` + nonaktifkan `MUser` terkait.
- `POST /official/import-excel` dan `GET /official/import-template` — pola sama dengan Pelatih, memakai template `template-import-official.xlsx`.
- Validasi Joi (`backend/src/modules/official/official.validation.js`): `nik`, `namaLengkap`, `nomorTelp`, `tempatLahir`, `tanggalLahir` (ISO), `jenisKelamin`, `statusOfficial`.

### E. Backend — Daftar Gabungan (`/pelatih-official`)
- `GET /pelatih-official` — `protect()`. Query `tipe` (`Pelatih`/`Official`, kosong = gabungan), `search`, `page`, `limit`.
- Response dibungkus `successResponse`, sehingga payload terbaca di `res.data.data` dengan bentuk `{ data, meta, summary }`.
- `summary` memuat `totalPelatih`, `totalOfficial`, `total`, `incompletePelatih`, `incompleteOfficial`.
- Setiap baris sudah dinormalisasi: field `tipe`, `status`, `incomplete`, `uid`, `nik`, `namaLengkap`, foto, dan sektor (untuk Pelatih).
- Repository: `backend/src/modules/pelatih-official/` (repository, service, controller, routes). Rute di-mount di `backend/src/server.js`.

### F. Frontend — Daftar Gabungan (`/pelatih-official`)
- Halaman: `frontend/src/features/coach-official/pages/CoachOfficialListPage.jsx`.
- Dua kartu ringkasan (`CoachOfficialSummaryCards`): **TOTAL PELATIH** dan **TOTAL OFFICIAL**. Gaya mengikuti `UserSummaryCards`: default putih polos, warna brand hanya saat kartu aktif, isi kartu hanya baris Total (tanpa metrik tambahan).
- Filter tipe memakai query URL `?tipe=`. Tanpa parameter, kartu **Pelatih** aktif secara default. Klik kartu aktif lagi memindahkan ke `?tipe=Semua`, yaitu kondisi tanpa filter (list gabungan, tombol tambah menampilkan 4 pilihan). Nilai `Semua` ikut dibawa ke halaman form dan detail lewat `location.state`.
- Grid kartu `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, jadi 3 kartu per baris di desktop.
- `CoachOfficialCard`: foto/avatar, dot status (hijau `Aktif`, merah `Nonaktif`), nama, NIK, sektor utama, penanda dokumen belum lengkap. Border `border-brand/20 border-l-4` dengan garis kiri merah hanya untuk data belum lengkap; bingkai foto 1px (`border-line` saat Aktif, `border-brand/40` saat Nonaktif). Hover hanya menambah elevation/shadow, sama seperti modul Atlet. Tinggi kartu seragam (`h-full`) berapa pun status kelengkapan dokumen.
- Pencarian (debounce) dan load more berbasis halaman. Tombol tambah membuka `AddChoiceModal`: Input Manual Pelatih, Import Excel Pelatih, Input Manual Official, Import Excel Official.
- Role `Pelatih` dan `Official` yang membuka `/pelatih-official` otomatis di-redirect ke halaman data dirinya sendiri.

### G. Frontend — Form Manual (`/pelatih-official/tambah/{pelatih|official}`, `.../:id/edit`)
- Komponen: `CoachForm.jsx`, `OfficialForm.jsx`, dan primitif bersama `FormPrimitives.jsx`.
- Layout mobile-first dan fluid: form mengisi lebar penuh di desktop tanpa batas `max-w`. Form Pelatih memakai 2 kolom, form Official 1 kolom.
- Footer form berisi tombol **Batal** dan **View Data**.
- Sektor dipilih lewat dropdown relasi (data dari `GET /sektor`), bukan input teks bebas. Nilai dikirim sebagai `uidSektor` berformat JSON string array; Joi menormalisasinya menjadi array uid.
- Preview memakai komponen ringkasan yang sama dengan halaman detail (`CoachProfileSummary` / `OfficialProfileSummary`) supaya tampilan tidak menyimpang.
- Route tambah dan edit dijaga `ProtectedRoute allowedRoles={['Admin', 'Manajemen']}`.

### H. Frontend — Detail (`/pelatih-official/pelatih/:id`, `/pelatih-official/official/:id`)
- Komponen: `CoachDetailPage.jsx` dan `OfficialDetailPage.jsx`.
- Layout 5 kolom: 3 kolom konten + 2 kolom overview.
- Preview foto diperkecil: `w-32 h-40 sm:w-40 sm:h-52`, mengikuti ukuran foto profil atlet.
- Tombol **Edit Profile** hanya untuk role Admin dan Manajemen.
- Tombol kembali untuk data sendiri mengarah ke `/dashboard` (label "Kembali ke Dashboard"); untuk data milik orang lain kembali ke daftar dengan filter yang sama.
- Panel dokumen menampilkan tautan berkas tersimpan atau "Belum ada".

### I. Frontend — Import Excel
- `ImportModal.jsx`: drag & drop `.xlsx`/`.xls` (maks 5MB), unduh template, alur **Cek Data (Dry Run)** lalu **Import Sekarang**.
- Ringkasan dry-run: `totalRows`, `validRows`, `invalidRows`, daftar `errors` per baris. Tombol import hanya aktif bila `invalidRows = 0`.
- Commit ditolak `422` bila masih ada baris error. Penyimpanan baris valid berjalan berurutan dan menyimpan `created` pada response.
- Import Pelatih resolve kolom `sektor` (nama sektor) menjadi `uidSektor` di server; sektor yang tidak dikenal dilaporkan sebagai error baris. Import Official tidak memakai kolom sektor.

### J. Sidebar & RBAC (Revisi Terbaru)
- `frontend/src/components/common/Sidebar.jsx` memakai `resolveItem(item)` yang mengembalikan `{ label, path }` sesuai role.
- Role Atlet, Pelatih, dan Official melihat menu **Informasi Saya** yang langsung membuka profil sendiri: `/atlet/:uidAtlet`, `/pelatih-official/pelatih/:uidPelatih`, atau `/pelatih-official/official/:uidOfficial`.
- Role Admin dan Manajemen tetap melihat label dan path modul sebelumnya (`Data Atlet`, `Data Pelatih/Official`).
- `auth.middleware.js` meneruskan `uidOfficial` dari token ke `req.user`, supaya sidebar dan pembatasan akses punya sumber data yang sama.
- Default kartu filter: modul Pelatih/Official memakai `Pelatih`, User Management memakai `Atlet`. Pada modul Pelatih/Official, default bertahan, meskipun kartu aktif bisa diklik lagi untuk menghapus filter lewat sentinel `?tipe=Semua`.

### K. Default Filter Kartu Ringkasan
- `frontend/src/features/user-management/pages/UserManagementPage.jsx`: `selectedRole` diinisialisasi `ROLES.ATLET`, sehingga kartu Atlet aktif secara default saat halaman User Management dibuka.
- `frontend/src/features/coach-official/constants.js`: nilai baru `TIPE_ALL = 'Semua'` sebagai penanda URL tanpa filter tipe.

---

## 4. Key Architectural Decisions
1. **Sektor memakai tabel relasi, bukan free text**: `MSektor` + `RPelatihSektor` dengan masa berlaku (`startDate`/`endDate`) dan soft delete, sehingga riwayat sektor Pelatih tetap tertelusur.
2. **Edit menutup relasi lama, lalu membuat relasi baru**: relasi sektor tidak ditimpa langsung, sehingga histori tetap utuh.
3. **`uidSektor` dikirim sebagai JSON string array**: multipart FormData tidak mendukung array; Joi menerima string JSON maupun array (dipakai importer) lalu menormalkan ke array uid.
4. **Import resolve sektor di server**: importer memetakan nama sektor ke `uidSektor` sebelum menyimpan, supaya validasi data tetap berada di backend.
5. **Satu endpoint daftar gabungan**: `GET /pelatih-official` menggantikan dua endpoint terpisah untuk tampilan modul frontend, dengan `tipe` sebagai filter opsional.
6. **Filter bertahan lewat URL + `location.state`**: query `?tipe=` menyimpan state filter yang dapat dibagikan; `location.state` membawa filter saat berpindah ke form atau detail.
7. **Permission `coach:dashboard:view` dipertahankan** pada `GET /coach` agar tidak mengubah perilaku lama, sementara endpoint gabungan memakai `protect()` biasa.
8. **Pagar data diri di backend, bukan hanya di frontend**: `GET /coach/detail/:id` dan `GET /official/detail/:id` menolak `403` bila role Pelatih/Official meminta uid milik orang lain. Redirect frontend tetap dipertahankan untuk UX.
9. **Status incomplete dihitung dari berkas**: Pelatih belum lengkap bila foto atau salah satu dari 7 berkas sertifikasi kosong; Official belum lengkap bila foto kosong.
10. **Kartu filter default satu**: modul Pelatih/Official memakai sentinel `?tipe=Semua` agar "klik lagi untuk menghapus filter" tetap bekerja meski ada nilai default.

---

## 5. Verifikasi yang Dijalankan
- `npm run lint` dan `npm run build` pada `frontend/`: bersih.
- `node --check` untuk `coach.controller.js`, `official.controller.js`, dan `auth.middleware.js`: bersih.
- Uji API (akun uji sementara, lalu dihapus): login, list gabungan, filter `tipe=Pelatih` dan `tipe=Official`, create Pelatih, create Official, detail, edit (relasi sektor), import dry-run Pelatih, import dry-run Official, delete.
- Matrix akses detail:

| Sesi | Detail sendiri | Detail orang lain |
|---|---|---|
| Pelatih | `200` | `403` |
| Official | `200` | `403` |
| Admin | `200` | `200` |

---

## 6. Sisa Pekerjaan & Catatan
- **MS-05 belum selesai penuh**: bagian **Penjadwalan & Latihan** belum ada. Status MS-05 di README ditandai In Progress.
- **File unggahan belum di-ignore**: repository ini belum punya `.gitignore`, sehingga `backend/uploads/` (atlet, pelatih, official) masih muncul sebagai file untracked.
- **Perubahan belum di-commit**: seluruh pekerjaan MS-04..MS-06 masih berupa perubahan lokal di working tree.
