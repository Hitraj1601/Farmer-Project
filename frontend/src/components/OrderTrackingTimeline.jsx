import { useState, useEffect } from 'react';
import {
  FiMapPin,
  FiClock,
  FiCheck,
  FiTruck,
  FiPackage,
  FiX,
  FiRefreshCw,
  FiNavigation,
} from 'react-icons/fi';
import { analyticsService } from '../services/index';
import Loader from './Loader';
import Button from './Button';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

const STATUS_CONFIG = {
  PENDING: { icon: FiClock, color: 'amber', label: 'Order Placed' },
  ACCEPTED: { icon: FiCheck, color: 'blue', label: 'Accepted' },
  SHIPPED: { icon: FiTruck, color: 'violet', label: 'In Transit' },
  DELIVERED: { icon: FiPackage, color: 'emerald', label: 'Delivered' },
  REJECTED: { icon: FiX, color: 'red', label: 'Rejected' },
};

const COLOR_MAP = {
  amber: { bg: 'bg-amber-500', ring: 'ring-amber-200 dark:ring-amber-800', line: 'bg-amber-200 dark:bg-amber-800', badge: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400' },
  blue: { bg: 'bg-blue-500', ring: 'ring-blue-200 dark:ring-blue-800', line: 'bg-blue-200 dark:bg-blue-800', badge: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400' },
  violet: { bg: 'bg-violet-500', ring: 'ring-violet-200 dark:ring-violet-800', line: 'bg-violet-200 dark:bg-violet-800', badge: 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400' },
  emerald: { bg: 'bg-emerald-500', ring: 'ring-emerald-200 dark:ring-emerald-800', line: 'bg-emerald-200 dark:bg-emerald-800', badge: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' },
  red: { bg: 'bg-red-500', ring: 'ring-red-200 dark:ring-red-800', line: 'bg-red-200 dark:bg-red-800', badge: 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400' },
};

export default function OrderTrackingTimeline({ orderId, isFarmer = false, onClose }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const fetchTracking = async () => {
    try {
      const res = await analyticsService.getOrderTracking(orderId);
      setTracking(res.data);
    } catch {
      toast.error('Failed to load tracking');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (orderId) fetchTracking();
  }, [orderId]);

  const handleSimulateLocation = async () => {
    setSimulating(true);
    try {
      await analyticsService.simulateLocation(orderId);
      toast.success('Location updated!');
      await fetchTracking();
    } catch (err) {
      toast.error(err.message || 'Cannot simulate location');
    }
    setSimulating(false);
  };

  if (loading) return <Loader text="Loading tracking..." />;
  if (!tracking) return null;

  const statusSteps = ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED'];
  const currentIdx = statusSteps.indexOf(tracking.currentStatus);
  const isRejected = tracking.currentStatus === 'REJECTED';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Order Tracking</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {tracking.cropName} &middot; <span className="font-mono text-xs">#{orderId?.slice(0, 8)}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isFarmer && tracking.currentStatus === 'SHIPPED' && (
              <Button size="sm" onClick={handleSimulateLocation} loading={simulating} className="gap-1.5">
                <FiNavigation size={14} /> Update Location
              </Button>
            )}
            {onClose && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <FiX size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Status progress bar */}
        {!isRejected && (
          <div className="flex items-center gap-2 mt-4">
            {statusSteps.map((step, i) => {
              const sc = STATUS_CONFIG[step];
              const isComplete = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold transition-all duration-500 ${
                    isComplete ? 'bg-emerald-500 scale-100' : 'bg-gray-200 dark:bg-gray-700 scale-90'
                  } ${isCurrent ? 'ring-4 ring-emerald-200 dark:ring-emerald-800' : ''}`}>
                    {isComplete ? <FiCheck size={14} /> : i + 1}
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded-full transition-all duration-500 ${
                      i < currentIdx ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Step labels */}
        {!isRejected && (
          <div className="flex mt-1">
            {statusSteps.map((step, i) => (
              <div key={step} className={`flex-1 text-center text-[10px] font-medium ${
                i <= currentIdx ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'
              }`}>
                {STATUS_CONFIG[step].label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="px-6 py-5">
        <div className="relative">
          {tracking.timeline?.map((entry, i) => {
            const sc = STATUS_CONFIG[entry.status] || STATUS_CONFIG.PENDING;
            const cm = COLOR_MAP[sc.color] || COLOR_MAP.amber;
            const Icon = sc.icon;
            const isLast = i === tracking.timeline.length - 1;
            const time = new Date(entry.timestamp);

            return (
              <div key={entry.id || i} className="relative flex gap-4 pb-6 last:pb-0">
                {/* Timeline line */}
                {!isLast && (
                  <div className={`absolute left-[15px] top-10 w-0.5 h-[calc(100%-2.5rem)] ${cm.line}`} />
                )}

                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full ${cm.bg} ring-4 ${cm.ring} flex items-center justify-center text-white`}>
                  <Icon size={14} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${cm.badge}`}>
                      {entry.status}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {time.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at{' '}
                      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">{entry.note}</p>
                  )}
                  {entry.location && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                      <FiMapPin size={11} /> {entry.location}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {(!tracking.timeline || tracking.timeline.length === 0) && (
          <div className="text-center py-8">
            <FiMapPin size={32} className="mx-auto mb-3 text-gray-200 dark:text-gray-700" />
            <p className="text-sm text-gray-400">No tracking information available</p>
          </div>
        )}
      </div>

      {/* Info bar */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-4 text-xs text-gray-400">
        {tracking.farmerName && <span>Farmer: <strong className="text-gray-600 dark:text-gray-300">{tracking.farmerName}</strong></span>}
        {tracking.farmLocation && <span>From: <strong className="text-gray-600 dark:text-gray-300">{tracking.farmLocation}</strong></span>}
      </div>
    </div>
  );
}
