import { lazy, Suspense, useEffect, useState } from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiPackage } from 'react-icons/fi';
import { adminService } from '../../services';
import StatsCard from '../../components/StatsCard';
import Loader from '../../components/Loader';

const RevenueChart = lazy(() => import('../../components/RevenueChart'));

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getAnalytics();
        setAnalytics(res.data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading admin dashboard..." />;

  const raw = analytics || {};
  const stats = {
    totalUsers: raw.users?.total || 0,
    totalCrops: raw.crops?.total || 0,
    totalOrders: raw.orders?.total || 0,
    totalRevenue: raw.revenue?.total || 0,
    revenueByMonth: raw.revenueByMonth || [],
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="animate-fade-in-up fill-mode-both delay-100">
          <StatsCard icon={FiUsers} title="Total Users" value={stats.totalUsers || 0} color="blue" />
        </div>
        <div className="animate-fade-in-up fill-mode-both delay-200">
          <StatsCard icon={FiPackage} title="Total Crops" value={stats.totalCrops || 0} color="green" />
        </div>
        <div className="animate-fade-in-up fill-mode-both delay-300">
          <StatsCard icon={FiShoppingBag} title="Total Orders" value={stats.totalOrders || 0} color="purple" />
        </div>
        <div className="animate-fade-in-up fill-mode-both delay-400">
          <StatsCard icon={FiDollarSign} title="Revenue" value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} color="yellow" />
        </div>
      </div>

      {stats.revenueByMonth && stats.revenueByMonth.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in-up fill-mode-both delay-500">
          <div className="px-6 pt-6 pb-2">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Monthly Revenue</h2>
            <p className="text-sm text-gray-400">Revenue trends over time</p>
          </div>
          <div className="px-2 pb-6 min-h-[340px]">
            <Suspense fallback={<Loader text="Loading chart..." />}>
              <RevenueChart data={stats.revenueByMonth} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
