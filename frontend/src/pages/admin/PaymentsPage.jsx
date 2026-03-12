import { useState, useEffect } from 'react';
import { FiCreditCard } from 'react-icons/fi';
import { adminService } from '../../services';
import { formatPrice, formatDate } from '../../utils/helpers';
import Loader from '../../components/Loader';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getAllOrders();
        const allOrders = res.data?.orders || res.data || [];
        const paid = allOrders.filter(o => o.payment);
        setPayments(paid);
      } catch { setPayments([]); }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading payments..." />;

  const statusBadge = {
    SUCCESS: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    FAILED: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
    PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Payments</h1>
        <p className="text-gray-500 mt-1">{payments.length} payment record{payments.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden animate-fade-in-up fill-mode-both delay-100">
        {payments.length === 0 ? (
          <div className="py-16 text-center">
            <FiCreditCard size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">No payment records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4">Payment ID</th>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {payments.map(o => {
                  const sb = statusBadge[o.payment?.status] || statusBadge.PENDING;
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">{o.payment?.razorpayPaymentId || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-500">#{o.id.slice(0, 8)}</span>
                        {o.crop?.cropName && <span className="ml-2 text-gray-700 dark:text-gray-300">{o.crop.cropName}</span>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{formatPrice(o.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${sb}`}>
                          {o.payment?.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(o.createdAt)}</td>
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
