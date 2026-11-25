# Milestone 3: Input Data Atlet (Manual & Import Excel)

## 1. Goal / Objective
Membangun antarmuka dan API input data atlet dengan dua jalur: **input manual** per atlet dan **import massal via file Excel** dengan validasi *dry-run* sebelum penyimpanan. Data atlet ditampilkan dalam daftar yang mendukung pencarian, penanda dokumen belum lengkap, serta halaman detail.

---

## 2. Status
- **Backend Status**: ✅ Selesai
- **Frontend Status**: ✅ Selesai
- **Verifikasi**: `npm run lint` & `npm run build` bersih; uji runtime login, list, create multipart, edit multipart, soft delete, import dry-run, import commit, dan unduh template berhasil

---

## 3. Scope & Feature List

### A. Backend (`/athlete`)
- `GET /athlete`: query `search` (nama / ID PBSI), `status` (Aktif/Nonaktif), `page`, `limit`, `sortBy`, `sortOrder`. Response `{ data, meta, summary }`; `summary` berisi `total`, `aktif`, `incomplete`.
- `GET /athlete/:id`: detail atlet.
- `POST /athlete/import-data`: input manual multipart (foto + 4 dokumen).
- `PATCH /athlete/edit/:id`: perbarui biodata & berkas; berkas lama dipertahankan bila tidak diganti.
- `DELETE /athlete/delete/:id`: soft delete atlet + nonaktifkan `MUser` terkait.
- `POST /athlete/import-excel`: import massal. `dryRun=true` hanya memvalidasi; `dryRun=false` menyimpan secara atomik. Import ditolak (422) bila masih ada baris error.
- `GET /athlete/import-template`: unduh template `.xlsx` (sheet "Data Atlet" + sheet "Petunjuk").
- Validasi `statusAtlet` disinkronkan ke enum schema: `Aktif | Nonaktif`.

### B. Frontend — Halaman Daftar (`/atlet`)
- Header, tombol Kembali, kartu `TOTAL ATLET`, pencarian dengan debounce 400ms.
- Daftar kartu atlet: foto/avatar, dot status (hijau Aktif / merah Nonaktif), nama, `idPbsi`, provinsi.
- **Klik kartu** membuka detail (bukan ikon mata); aksi per data: **Edit** (Admin/Manajemen) dan **Delete** (Admin saja, soft delete dengan konfirmasi).
- Garis merah kiri permanen hanya saat dokumen belum lengkap (`Incomplete`); penanda = badge `Incomplete` + teks "*belum melengkapi dokumen". Tidak ada dot merah. Hover hanya menambah elevation/shadow.
- Tombol "Tampilkan Lebih Banyak" (load more berbasis halaman).
- Tombol "Tambah Atlet" membuka pilihan **Input Manual / Import Excel**; tampil untuk role **Admin & Manajemen** (selaras permission `admin:athlete:manage`).

### C. Frontend — Form Manual (`/atlet/tambah`, `/atlet/:id/edit`)
- Form biodata, histori klub, dan unggah foto + 4 dokumen.
- Validasi klien untuk kolom wajib sebelum lanjut.
- Fase **Preview** menampilkan ringkasan biodata dan tabel Verifikasi Dokumen; tombol `Edit Profile` kembali ke form tanpa kehilangan input, `Simpan` mengirim multipart.
- Edit mode memuat data lama dan mempertahankan berkas yang tidak diganti.

### D. Frontend — Detail (`/atlet/:id`)
- Header atlet + tombol `Edit Profile` (Admin/Manajemen).
- Tabs: `Biodata` aktif; `Lap Pertandingan`, `Hasil Tes Fisik`, `Ranking` **disabled** (placeholder).
- Panel Verifikasi Dokumen: tautan "Lihat" untuk berkas tersimpan, "Belum ada" untuk berkas kosong.
- Ringkasan profil memakai `AthleteProfileSummary` — komponen yang sama dengan fase Preview form.

### E. Frontend — Import Excel
- Modal drag & drop `.xlsx/.xls` (maks 5MB), unduh template.
- Alur: pilih file → **Cek Data (Dry Run)** → ringkasan total/valid/error + tabel error per baris → **Import Sekarang** hanya aktif bila `invalidRows = 0`.

### F. Frontend — Restyle & Komponen Bersama
- `AthleteForm` disusun ulang menjadi card dengan header merah dan grid 2 kolom; field bertingkat (orang tua/wali, histori klub) tetap eksis, hanya tata letak berubah.
- `AthleteProfileSummary` — satu komponen presentasional dipakai fase Preview form **dan** halaman detail; props `athlete` + `getFile(field)`; token warna tema, tanggal `id-ID`.
- `ConfirmDialog` di `components/common/` — dialog konfirmasi reusable, dipakai soft delete atlet.
- Semua sub-komponen form didefinisikan di module scope (bukan di dalam render) agar fokus input tidak hilang; ref memakai callback block-body (React 19).
- Revisi ini **hanya tata letak/komponen**, alur data dan endpoint tidak berubah.

### G. Routing & RBAC
- `/atlet`, `/atlet/:id` dapat diakses semua role login.
- `/atlet/tambah`, `/atlet/:id/edit` dijaga `ProtectedRoute allowedRoles={['Admin', 'Manajemen']}`.
- Tombol aksi kelola (tambah/edit) disembunyikan untuk role di luar Admin/Manajemen; delete hanya Admin.
- **Role Atlet**: menu "Data Atlet" langsung arahkan ke detail profil sendiri (`/atlet/{uidAtlet}`), bukan daftar semua atlet. Akun Atlet yang belum memiliki `uidAtlet` melihat panel "Akun belum terhubung dengan data atlet" (toolbar & tabel disembunyikan). Tombol "Kembali" di halaman detail mengarah ke `/dashboard` agar tidak terjadi loop redirect.
- **Sidebar active state**: menu aktif tidak lagi memakai exact match, tapi juga cocok untuk sub-route (`/atlet/:id`, `/atlet/tambah`). Untuk role Atlet, target menu "Data Atlet" langsung `/atlet/{uidAtlet}` sehingga klik tidak terasa mati (tidak memicu redirect balik ke halaman yang sama).

---

## 4. Key Architectural Decisions
1. **Status atlet mengikuti schema** (`Aktif | Nonaktif`); validasi Joi tidak lagi memakai status di luar enum.
2. **Relasi sektor atlet dibiarkan** (`RAtletSektor` sudah di-drop dari schema). Endpoint `assign-sektor` tidak dipakai frontend untuk menghindari runtime error.
3. **Satu endpoint pilihan ganda**: tombol Tambah Atlet membuka modal pilihan manual/Excel.
4. **Preview sebelum submit** adalah fase di halaman form yang sama (bukan route terpisah) agar state input tidak hilang.
5. **Tab non-biodata disabled** hingga modul pertandingan/tes/ranking tersedia.
6. **ID yang ditampilkan adalah `idPbsi`**, bukan `uidAtlet`.
7. **Dry-run wajib**: import Excel selalu divalidasi dulu; commit hanya jika tanpa error; penyimpanan atomik via transaksi.
8. **Parser Excel `exceljs`** (bukan `xlsx`) untuk menghindari paket dengan kerentanan tinggi.
9. **Dokumen tidak melalui Excel**; baris hasil import berstatus `Incomplete` sampai berkas dilengkapi lewat edit.
10. **Garis merah kiri = indikator `Incomplete` permanen**, bukan efek hover. Hover hanya elevation. Penanda ganda (dot) dihapus karena redundan dengan badge.
11. **RBAC frontend mencerminkan backend**: tambah/edit = Admin + Manajemen (`admin:athlete:manage`), delete = Admin saja (`admin:athlete:delete`). Route guard disamakan agar tidak muncul tombol yang berujung 403.
12. **Hapus data memakai `ConfirmDialog`** di `components/common/` supaya dialog konfirmasi dapat dipakai ulang lintas modul.
13. **Layout form/preview disatukan** lewat `AthleteProfileSummary`, sehingga tampilan Preview dan halaman detail tidak bisa menyimpang.
14. **Role Atlet = self-service data**: menu "Data Atlet" menampilkan profil atlet yang login. Pengaman dobel — backend memfilter `GET /athlete` hanya ke `uidAtlet` miliknya, `GET /athlete/:id` menolak id orang lain dengan 403, dan frontend redirect `/atlet` → `/atlet/{uidAtlet}`. Akun Atlet tanpa `uidAtlet` mendapat daftar kosong (bukan semua atlet) untuk mencegah kebocoran data.