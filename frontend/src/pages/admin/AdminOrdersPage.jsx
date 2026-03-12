import { useState, useEffect } from 'react';
import { FiShoppingBag } from 'react-icons/fi';
import { adminService } from '../../services';
import { formatPrice } from '../../utils/helpers';
import Loader from '../../components/Loader';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getAllOrders();
        setOrders(res.data?.orders || res.data || []);
      } catch { setOrders([]); }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading orders..." />;

  const statusConfig = {
    PENDING: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-400' },
    ACCEPTED: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-400' },
    SHIPPED: { bg: 'bg-violet-50 dark:bg-violet-950', text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-400' },
    DELIVERED: { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-400' },
    REJECTED: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-400' },
  };

  const paymentBadge = {
    SUCCESS: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    FAILED: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
    PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">All Orders</h1>
        <p className="text-gray-500 mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in-up fill-mode-both delay-100">
        {orders.length === 0 ? (
          <div className="py-16 text-center">
            <FiShoppingBag size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Crop</th>
                  <th className="px-6 py-4">Buyer</th>
                  <th className="px-6 py-4">Farmer</th>
                  <th className="px-6 py-4">Qty</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map(o => {
                  const sc = statusConfig[o.status] || statusConfig.PENDING;
                  const pb = paymentBadge[o.payment?.status] || paymentBadge.PENDING;
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">#{o.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{o.crop?.cropName || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.buyer?.name || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.crop?.farmer?.name || '-'}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.quantity} kg</td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{formatPrice(o.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {o.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${pb}`}>
                          {o.payment?.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
