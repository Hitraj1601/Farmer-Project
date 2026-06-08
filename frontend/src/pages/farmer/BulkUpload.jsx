import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiUploadCloud, FiDownload, FiCheckCircle, FiAlertCircle, FiFile, FiX, FiArrowRight } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import { cropService } from '../../services';
import toast from 'react-hot-toast';

const TEMPLATE_HEADERS = ['cropName', 'quantity', 'pricePerKg', 'location', 'category', 'stockAlertThreshold'];
const TEMPLATE_EXAMPLE = [
  ['Wheat', 500, 25.50, 'Pune, Maharashtra', 'Grains', 50],
  ['Tomato', 200, 18, 'Nashik, Maharashtra', 'Vegetables', 30],
  ['Banana', 300, 35, 'Jalgaon, Maharashtra', 'Fruits', 0],
];

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_EXAMPLE]);
  ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Crops');
  XLSX.writeFile(wb, 'FarmConnect_Crop_Template.xlsx');
}

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const parseFile = useCallback((f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      toast.error('Only CSV or Excel (.xlsx/.xls) files allowed');
      return;
    }
    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        setPreview(rows.slice(0, 10)); // Show max 10 rows in preview
      } catch {
        toast.error('Could not parse file. Please check the format.');
        setFile(null);
        setPreview([]);
      }
    };
    reader.readAsBinaryString(f);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) parseFile(f);
  }, [parseFile]);

  const handleFileInput = (e) => {
    const f = e.target.files?.[0];
    if (f) parseFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await cropService.bulkUpload(formData);
      setResult(res.data);
      if (res.data.summary.created > 0) {
        toast.success(`${res.data.summary.created} crops uploaded successfully!`);
      }
      if (res.data.summary.failed > 0) {
        toast.error(`${res.data.summary.failed} rows had errors`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const previewHeaders = preview.length > 0 ? Object.keys(preview[0]) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FiUploadCloud className="text-white" size={20} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Bulk Crop Upload</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-1 ml-13">
          Upload a CSV or Excel file to add multiple crops at once
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-2 space-y-6">

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`card border-2 border-dashed transition-all duration-300 cursor-pointer
              ${dragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]'
                : file
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20'
              }`}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileInput}
            />

            {file ? (
              <div className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                  <FiFile className="text-emerald-600 dark:text-emerald-400" size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB · {preview.length} rows detected</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
                  <FiUploadCloud className="text-blue-500" size={28} />
                </div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">Drop your file here, or click to browse</p>
                <p className="text-sm text-gray-400 mt-1">Supports CSV, XLSX, XLS · Max 5 MB</p>
              </div>
            )}
          </div>

          {/* Preview table */}
          {preview.length > 0 && (
            <div className="card overflow-hidden animate-fade-in-up fill-mode-both">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">Preview ({preview.length} of {preview.length} rows)</h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">First 10 rows</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">#</th>
                      {previewHeaders.map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {preview.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                        {previewHeaders.map(h => (
                          <td key={h} className="px-4 py-2.5 text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                            {String(row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Upload button */}
          {file && !result && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <FiUploadCloud size={18} />
                  Upload {preview.length} Crops
                </>
              )}
            </button>
          )}

          {/* Results */}
          {result && (
            <div className="card animate-fade-in-up fill-mode-both">
              <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3">Upload Results</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-2xl font-extrabold text-gray-700 dark:text-gray-300">{result.summary.total}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Total Rows</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40">
                    <p className="text-2xl font-extrabold text-emerald-600">{result.summary.created}</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Created</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-950/40">
                    <p className="text-2xl font-extrabold text-red-500">{result.summary.failed}</p>
                    <p className="text-xs text-red-500 mt-0.5">Failed</p>
                  </div>
                </div>
              </div>

              {/* Created rows */}
              {result.created?.length > 0 && (
                <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                  <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm mb-2 flex items-center gap-1.5">
                    <FiCheckCircle size={15} /> Successfully Created
                  </h4>
                  <div className="space-y-1.5">
                    {result.created.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-sm">
                        <FiCheckCircle className="text-emerald-500 flex-shrink-0" size={13} />
                        <span className="text-gray-600 dark:text-gray-300">Row {c.row}: <strong>{c.cropName}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error rows */}
              {result.errors?.length > 0 && (
                <div className="p-5">
                  <h4 className="font-semibold text-red-600 dark:text-red-400 text-sm mb-2 flex items-center gap-1.5">
                    <FiAlertCircle size={15} /> Errors
                  </h4>
                  <div className="space-y-1.5">
                    {result.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={13} />
                        <span className="text-gray-600 dark:text-gray-300">Row {e.row}: {e.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-5 pb-5 flex gap-3">
                <button onClick={clearFile} className="btn-secondary flex-1">Upload Another File</button>
                <Link to="/dashboard/my-crops" className="btn-primary flex-1 flex items-center justify-center gap-2">
                  View My Crops <FiArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right panel — instructions + template */}
        <div className="space-y-4">
          {/* Download template */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <FiDownload size={16} className="text-blue-500" /> Download Template
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Use our Excel template to get the correct column headers and example data.
            </p>
            <button
              onClick={downloadTemplate}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all duration-200"
            >
              <FiDownload size={15} /> Download Excel Template
            </button>
          </div>

          {/* Required columns */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Required Columns</h3>
            <div className="space-y-2">
              {[
                { name: 'cropName', desc: 'Name of the crop', required: true },
                { name: 'quantity', desc: 'Available quantity in kg', required: true },
                { name: 'pricePerKg', desc: 'Price per kilogram (Rs.)', required: true },
                { name: 'location', desc: 'City, State', required: true },
                { name: 'category', desc: 'Grains, Vegetables, etc.', required: false },
                { name: 'stockAlertThreshold', desc: 'Alert when stock falls below', required: false },
              ].map((col) => (
                <div key={col.name} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded ${col.required ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    {col.required ? 'REQ' : 'OPT'}
                  </span>
                  <div>
                    <p className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200">{col.name}</p>
                    <p className="text-xs text-gray-400">{col.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-100 dark:border-amber-800/30">
            <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2">Tips</h3>
            <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1.5 list-disc list-inside">
              <li>First row must be the header row</li>
              <li>Rows with errors are skipped; valid rows are still created</li>
              <li>Max 5 MB file size</li>
              <li>Quantity and price must be positive numbers</li>
              <li>Category must match: Grains, Vegetables, Fruits, Spices, Pulses, Oilseeds, Dairy, Others</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
