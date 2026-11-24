import { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  UploadCloud,
  X,
} from 'lucide-react';
import Modal from '../../../components/common/Modal';
import { athleteApi } from '../api/athlete.api';

const IDLE = 'idle';
const CHECKED = 'checked';
const IMPORTED = 'imported';

export default function AthleteImportModal({ open, onClose, onImported }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [phase, setPhase] = useState(IDLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setFile(null);
    setResult(null);
    setPhase(IDLE);
    setError('');
    setLoading(false);
    setDragging(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const pickFile = (selected) => {
    if (!selected) return;
    setError('');
    setResult(null);
    setPhase(IDLE);
    setFile(selected);
  };

  const handleInputChange = (event) => {
    pickFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  };

  const buildFormData = (dryRun) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dryRun', dryRun ? 'true' : 'false');
    return formData;
  };

  const handleDryRun = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await athleteApi.importExcel(buildFormData(true));
      setResult(res.data.data);
      setPhase(CHECKED);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Gagal memeriksa file. Coba lagi.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await athleteApi.importExcel(buildFormData(false));
      setResult(res.data.data);
      setPhase(IMPORTED);
      onImported?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data atlet.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await athleteApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'template-import-atlet.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Gagal mengunduh template.');
    }
  };

  const canImport =
    phase === CHECKED && result?.validRows > 0 && result?.invalidRows === 0;

  const footer = (
    <>
      <button
        onClick={handleClose}
        className="px-6 py-2.5 rounded-full border-2 border-muted text-muted font-semibold text-sm hover:bg-gray-50"
      >
        {phase === IMPORTED ? 'Tutup' : 'Batal'}
      </button>

      {phase !== IMPORTED && (
        <button
          onClick={phase === CHECKED ? handleImport : handleDryRun}
          disabled={!file || loading || (phase === CHECKED && !canImport)}
          className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-brand text-white font-semibold text-sm hover:bg-brand-dark disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {phase === CHECKED ? 'Import Sekarang' : 'Cek Data'}
        </button>
      )}
    </>
  );

  return (
    <Modal open={open} onClose={handleClose} title="Import Data Atlet" footer={footer}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-muted">
            Unggah file Excel sesuai template. Data akan dicek terlebih dahulu
            sebelum disimpan.
          </p>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center cursor-pointer transition-colors ${
            dragging
              ? 'border-brand bg-brand-light'
              : 'border-gray-300 bg-surface hover:border-brand/60'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleInputChange}
            className="hidden"
          />
          {file ? (
            <>
              <FileSpreadsheet className="w-8 h-8 text-brand" />
              <span className="font-semibold text-ink break-all">{file.name}</span>
              <span className="text-xs text-muted">
                Klik atau seret file lain untuk mengganti
              </span>
            </>
          ) : (
            <>
              <UploadCloud className="w-8 h-8 text-muted" />
              <span className="font-semibold text-ink">
                Seret & lepas file Excel di sini
              </span>
              <span className="text-xs text-muted">
                atau klik untuk memilih file (.xlsx / .xls, maks 5MB)
              </span>
            </>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Hasil dry run */}
        {result && phase !== IDLE && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-surface border border-line p-3 text-center">
                <div className="text-xs text-muted">Total Baris</div>
                <div className="font-bold text-lg text-ink">{result.totalRows}</div>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                <div className="text-xs text-green-700">Valid</div>
                <div className="font-bold text-lg text-green-700">
                  {result.validRows}
                </div>
              </div>
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-center">
                <div className="text-xs text-red-700">Error</div>
                <div className="font-bold text-lg text-red-700">
                  {result.invalidRows}
                </div>
              </div>
            </div>

            {phase === IMPORTED && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                <CheckCircle2 className="w-4 h-4" />
                Berhasil mengimport {result.created ?? result.validRows} data
                atlet.
              </div>
            )}

            {result.errors?.length > 0 && (
              <div className="max-h-56 overflow-auto rounded-lg border border-red-200">
                <table className="w-full text-xs">
                  <thead className="bg-red-50 text-red-800 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Baris</th>
                      <th className="px-3 py-2 text-left font-semibold">Kolom</th>
                      <th className="px-3 py-2 text-left font-semibold">Masalah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err, index) => (
                      <tr
                        key={`${err.row}-${err.field}-${index}`}
                        className="border-t border-red-100"
                      >
                        <td className="px-3 py-2 text-ink">{err.row}</td>
                        <td className="px-3 py-2 text-ink">{err.field || '-'}</td>
                        <td className="px-3 py-2 text-red-700">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.errors?.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted">
                <X className="w-3.5 h-3.5" />
                Perbaiki file lalu cek ulang. Import hanya bisa dilakukan bila
                tidak ada error.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}