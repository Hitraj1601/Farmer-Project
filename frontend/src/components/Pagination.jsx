import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-3 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
      >
        <FiChevronLeft size={18} />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-11 h-11 rounded-[1rem] bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            1
          </button>
          {start > 2 && <span className="px-1.5 text-gray-300 dark:text-gray-600 select-none">•••</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-11 h-11 rounded-[1rem] text-sm font-bold transition-all duration-300 ${
            p === page
              ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
              : 'bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1.5 text-gray-300 dark:text-gray-600 select-none">•••</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-11 h-11 rounded-[1rem] bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-3 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
      >
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}
