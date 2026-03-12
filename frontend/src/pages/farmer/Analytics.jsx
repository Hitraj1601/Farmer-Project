import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FiBarChart2, FiPieChart } from 'react-icons/fi';
import { cropService, orderService } from '../../services/index';
import Loader from '../../components/Loader.jsx';

const COLORS = ['#059669', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [data, setData] = useState({ cropData: [], statusData: [] });
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

        const cropMap = {};
        orders.forEach(o => {
          const name = o.crop?.cropName || 'Unknown';
          cropMap[name] = (cropMap[name] || 0) + o.totalPrice;
        });
        const cropData = Object.entries(cropMap).map(([name, revenue]) => ({ name, revenue }));

        const statusMap = {};
        orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1; });
        const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

        setData({ cropData, statusData, totalCrops: crops.length, totalOrders: orders.length });
      } catch { /* silent */ }
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 mt-1">Insights into your farming business performance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue per crop */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in-up fill-mode-both delay-100">
          <div className="px-6 pt-6 pb-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
              <FiBarChart2 className="text-emerald-600" size={16} />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white">Revenue by Crop</h2>
          </div>
          <div className="px-2 pb-6">
            {data.cropData.length === 0 ? (
              <div className="py-16 text-center">
                <FiBarChart2 size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">No revenue data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.cropData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} />
                  <Tooltip
                    formatter={(v) => `₹${v.toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  />
                  <Bar dataKey="revenue" fill="#059669" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Orders by status */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in-up fill-mode-both delay-200">
          <div className="px-6 pt-6 pb-2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
              <FiPieChart className="text-violet-600" size={16} />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white">Orders by Status</h2>
          </div>
          <div className="px-2 pb-6">
            {data.statusData.length === 0 ? (
              <div className="py-16 text-center">
                <FiPieChart size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">No order data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.statusData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {data.statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
