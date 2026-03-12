import { useState, useEffect } from 'react';
import { FiUsers, FiShoppingBag, FiDollarSign, FiPackage } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '../../services';
import StatsCard from '../../components/StatsCard';
import Loader from '../../components/Loader';

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
          <div className="px-2 pb-6">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={stats.revenueByMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} />
                <Tooltip
                  formatter={(v) => `₹${v.toLocaleString()}`}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                />
                <Bar dataKey="revenue" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
