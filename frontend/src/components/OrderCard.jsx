import { useState } from 'react';
import { formatPrice, formatDate, getStatusBadge, getImageUrl, formatAddress } from '../utils/helpers';
import { FiPackage, FiUser, FiCalendar, FiCreditCard, FiChevronDown, FiMapPin, FiBox, FiTruck } from 'react-icons/fi';

export default function OrderCard({ order, actions }) {
  const [expanded, setExpanded] = useState(false);
  const statusSteps = ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED'];
  const currentStep = statusSteps.indexOf(order.status);
  const isRejectedOrCancelled = ['REJECTED', 'CANCELLED'].includes(order.status);
  const hasItems = order.items && order.items.length > 0;
  const isMultiItem = hasItems && order.items.length > 1;

  // Build display name
  const displayName = isMultiItem
    ? `${order.items.length} items`
    : order.crop?.cropName || 'Crop';

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* ── Clickable Summary Row ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-4 sm:p-5 flex items-center gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-200"
      >
        {/* Order icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isRejectedOrCancelled
            ? 'bg-red-50 dark:bg-red-950/30'
            : currentStep >= 3
              ? 'bg-emerald-50 dark:bg-emerald-950/30'
              : 'bg-blue-50 dark:bg-blue-950/30'
        }`}>
          <FiPackage size={18} className={
            isRejectedOrCancelled
              ? 'text-red-500'
              : currentStep >= 3
                ? 'text-emerald-500'
                : 'text-blue-500'
          } />
        </div>

        {/* Order summary */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base truncate">{displayName}</h3>
            <span className={getStatusBadge(order.status)}>{order.status}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-gray-500">
            <span className="font-mono">#{order.id?.slice(0, 8)}</span>
            <span className="flex items-center gap-1">
              <FiCalendar size={10} />
              {formatDate(order.createdAt)}
            </span>
            {isMultiItem && (
              <span className="text-violet-500 dark:text-violet-400 font-medium">
                {order.items.length} items
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="text-right flex-shrink-0">
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatPrice(order.totalPrice)}</span>
          {!isMultiItem && order.quantity && (
            <span className="block text-[11px] text-gray-400 dark:text-gray-500 font-medium">{order.quantity} kg</span>
          )}
        </div>

        {/* Expand arrow */}
        <FiChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Mini Progress Bar (always visible) ── */}
      {!isRejectedOrCancelled && (
        <div className="px-5 pb-3 -mt-1">
          <div className="flex items-center gap-1">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex-1">
                <div className={`h-1 rounded-full transition-colors ${
                  i <= currentStep ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-800'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {statusSteps.map((step, i) => (
              <span key={step} className={`text-[9px] font-medium ${
                i <= currentStep ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-700'
              }`}>
                {step.charAt(0) + step.slice(1).toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Expanded Details ── */}
      <div className={`grid transition-all duration-400 ease-in-out ${
        expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      }`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-gray-100/80 dark:border-gray-800/60 pt-4 space-y-4">

            {/* Multi-item list */}
            {isMultiItem && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Order Items</span>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50/80 dark:bg-gray-800/40 rounded-xl border border-gray-100/60 dark:border-gray-700/40">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center flex-shrink-0">
                      <FiBox size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.crop?.cropName}</p>
                      <p className="text-xs text-gray-500">{item.quantity} kg × {formatPrice(item.pricePerKg)}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Detail grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {!isMultiItem && (
                <DetailItem label="Quantity" value={`${order.quantity} kg`} icon={FiBox} />
              )}
              <DetailItem label="Total" value={formatPrice(order.totalPrice)} icon={FiPackage} highlight />
              {order.crop?.farmer?.name && (
                <DetailItem label="Farmer" value={order.crop.farmer.name} icon={FiUser} />
              )}
              {order.buyer?.name && (
                <DetailItem label="Buyer" value={order.buyer.name} icon={FiUser} />
              )}
              {order.deliveryAddress && (
                <DetailItem label="Delivery" value={formatAddress(order.deliveryAddress)} icon={FiMapPin} />
              )}
              {order.payment && (
                <DetailItem
                  label="Payment"
                  value={order.payment.status}
                  icon={FiCreditCard}
                  highlight={order.payment.status === 'SUCCESS'}
                  warn={order.payment.status !== 'SUCCESS'}
                />
              )}
            </div>

            {/* Cancellation Reason Banner */}
            {order.status === 'CANCELLED' && order.cancelReason && (
              <div className="p-3 bg-red-50/80 dark:bg-red-950/20 rounded-xl border border-red-100/60 dark:border-red-900/30 text-xs text-red-700 dark:text-red-400">
                <span className="font-bold">Cancellation Reason:</span> {order.cancelReason}
              </div>
            )}

            {/* Actions */}
            {actions && (
              <div className="flex gap-2 flex-wrap pt-1">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Detail Item ─── */
function DetailItem({ label, value, icon: Icon, highlight, warn }) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-gray-50/60 dark:bg-gray-800/30 rounded-xl">
      {Icon && (
        <div className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 border border-gray-100/80 dark:border-gray-700/50 flex items-center justify-center flex-shrink-0">
          <Icon size={12} className="text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <div className="min-w-0">
        <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">{label}</span>
        <span className={`block text-sm font-semibold truncate ${
          highlight ? 'text-emerald-600 dark:text-emerald-400'
          : warn ? 'text-amber-600 dark:text-amber-400'
          : 'text-gray-700 dark:text-gray-300'
        }`}>{value}</span>
      </div>
    </div>
  );
}
