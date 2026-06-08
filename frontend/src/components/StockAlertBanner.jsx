import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiX, FiAlertTriangle, FiChevronRight } from 'react-icons/fi';
import { cropService } from '../services';

export default function StockAlertBanner() {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await cropService.getStockAlerts();
        setAlerts(res.data || []);
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  if (loading || dismissed || alerts.length === 0) return null;

  return (
    <div className="mb-6 animate-fade-in-up fill-mode-both">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
              <FiBell className="text-amber-600 dark:text-amber-400" size={18} />
            </div>
            <div>
              <h3 className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                ⚠️ Low Stock Alert — {alerts.length} crop{alerts.length !== 1 ? 's' : ''} need attention
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                These crops are at or below your minimum stock threshold
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-500 dark:text-amber-400 transition-colors flex-shrink-0"
            aria-label="Dismiss alerts"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Alert list */}
        <div className="mt-3 space-y-2">
          {alerts.map((crop) => (
            <div
              key={crop.id}
              className="flex items-center justify-between bg-white/60 dark:bg-gray-900/40 rounded-xl px-3 py-2.5 gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <FiAlertTriangle className="text-amber-500 flex-shrink-0" size={15} />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{crop.cropName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-red-600 dark:text-red-400 font-bold">{crop.quantity} kg</span>
                    {' '}remaining · Alert at {crop.stockAlertThreshold} kg
                  </p>
                </div>
              </div>
              <Link
                to={`/dashboard/edit-crop/${crop.id}`}
                className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 whitespace-nowrap flex-shrink-0 transition-colors"
              >
                Update <FiChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
