import { formatPrice, formatDate, getStatusBadge, getImageUrl } from '../utils/helpers';
import { FiPackage, FiUser, FiCalendar, FiCreditCard } from 'react-icons/fi';

export default function OrderCard({ order, actions }) {
  const statusSteps = ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED'];
  const currentStep = statusSteps.indexOf(order.status);
  const isRejected = order.status === 'REJECTED';
  const hasItems = order.items && order.items.length > 0;
  const isMultiItem = hasItems && order.items.length > 1;

  // Build display name
  const displayName = isMultiItem
    ? `${order.items.length} items`
    : order.crop?.cropName || 'Crop';

  return (
    <div className="card card-hover p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Left: Details */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
              <FiPackage className="text-emerald-600 dark:text-emerald-400" size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white truncate">{displayName}</h3>
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">#{order.id?.slice(0, 8)}</span>
            </div>
            <span className={getStatusBadge(order.status)}>{order.status}</span>
          </div>

          {/* Multi-item list */}
          {isMultiItem && (
            <div className="mb-3 space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  {item.crop?.imageUrl && (
                    <img
                      src={getImageUrl(item.crop.imageUrl)}
                      alt={item.crop?.cropName}
                      className="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                    />
                  )}
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

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            {!isMultiItem && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="text-gray-400 dark:text-gray-500 text-xs">Qty</span>
                <span className="font-medium">{order.quantity} kg</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <span className="text-gray-400 dark:text-gray-500 text-xs">Total</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatPrice(order.totalPrice)}</span>
            </div>
            {order.crop?.farmer?.name && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <FiUser size={12} className="text-gray-400 dark:text-gray-500" />
                <span className="text-sm truncate">{order.crop.farmer.name}</span>
              </div>
            )}
            {order.buyer?.name && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <FiUser size={12} className="text-gray-400 dark:text-gray-500" />
                <span className="text-sm truncate">{order.buyer.name}</span>
              </div>
            )}
          </div>

          {/* Progress bar (mini) */}
          {!isRejected && (
            <div className="mt-4 flex items-center gap-1">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`h-1.5 w-full rounded-full transition-colors ${
                    i <= currentStep ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-800'
                  }`} />
                </div>
              ))}
            </div>
          )}

          {/* Footer info */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <FiCalendar size={11} />
              {formatDate(order.createdAt)}
            </span>
            {order.payment && (
              <span className="flex items-center gap-1">
                <FiCreditCard size={11} />
                Payment: <span className={order.payment.status === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                  {order.payment.status}
                </span>
              </span>
            )}
            {isMultiItem && (
              <span className="text-violet-500 dark:text-violet-400 font-medium">
                {order.items.length} items
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        {actions && <div className="flex sm:flex-col gap-2 flex-shrink-0 sm:self-center">{actions}</div>}
      </div>
    </div>
  );
}
