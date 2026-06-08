import { useState, useEffect } from 'react';
import { FiPackage, FiDollarSign, FiTrendingUp, FiShoppingBag, FiArrowUpRight } from 'react-icons/fi';
import { cropService, orderService } from '../../services';
import StatsCard from '../../components/StatsCard';
import StockAlertBanner from '../../components/StockAlertBanner';
import Loader from '../../components/Loader';
import { formatPrice } from '../../utils/helpers';

export default function FarmerDashboard() {
  const [stats, setStats] = useState({ crops: 0, orders: 0, revenue: 0, pending: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [cropsRes, ordersRes] = await Promise.all([
          cropService.getMyCrops(),
          orderService.getMyOrders(),
        ]);
        const crops = cropsRes.data;
        const orders = ordersRes.data;
        const revenue = orders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + o.totalPrice, 0);
        const pending = orders.filter(o => o.status === 'PENDING').length;
        setStats({ crops: crops.length, orders: orders.length, revenue, pending });
        setRecentOrders(orders.slice(0, 5));
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading dashboard..." />;

  const statusColor = {
    PENDING: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    ACCEPTED: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
    SHIPPED: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
    DELIVERED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    REJECTED: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your farming business</p>
      </div>

      {/* Stock Alert Banner */}
      <StockAlertBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-in-up fill-mode-both delay-100">
          <StatsCard icon={FiPackage} title="My Crops" value={stats.crops} color="blue" />
        </div>
        <div className="animate-fade-in-up fill-mode-both delay-200">
          <StatsCard icon={FiShoppingBag} title="Total Orders" value={stats.orders} color="green" />
        </div>
        <div className="animate-fade-in-up fill-mode-both delay-300">
          <StatsCard icon={FiDollarSign} title="Revenue" value={`₹${stats.revenue.toLocaleString()}`} color="purple" />
        </div>
        <div className="animate-fade-in-up fill-mode-both delay-400">
          <StatsCard icon={FiTrendingUp} title="Pending" value={stats.pending} color="yellow" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in-up fill-mode-both delay-500">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white">Recent Orders</h2>
          <span className="text-xs font-medium text-gray-400">{recentOrders.length} latest</span>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">
            <FiShoppingBag size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No orders received yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Order ID</th>
                  <th className="px-6 py-3">Crop</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">#{o.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{o.crop?.cropName}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{o.quantity} kg</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{formatPrice(o.totalPrice)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${statusColor[o.status] || 'bg-gray-50 text-gray-600'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
