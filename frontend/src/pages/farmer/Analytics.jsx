import { useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiDollarSign, FiPackage, FiShoppingBag } from 'react-icons/fi';
import { cropService, orderService } from '../../services/index';
import Loader from '../../components/Loader';
import { formatPrice } from '../../utils/helpers';

const ORDER_STATUSES = ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'REJECTED'];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cropsRes, ordersRes] = await Promise.all([
          cropService.getMyCrops(),
          orderService.getMyOrders(),
        ]);
        setCrops(cropsRes.data || []);
        setOrders(ordersRes.data || []);
      } catch {
        setCrops([]);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const metrics = useMemo(() => {
    const totalStockKg = crops.reduce((sum, crop) => sum + (Number(crop.quantity) || 0), 0);

    const successfulRevenue = orders.reduce((sum, order) => {
      if (order.payment?.status === 'SUCCESS') {
        return sum + (Number(order.totalPrice) || 0);
      }
      return sum;
    }, 0);

    const pendingPaymentAmount = orders.reduce((sum, order) => {
      if (order.payment?.status !== 'SUCCESS' && order.status !== 'REJECTED') {
        return sum + (Number(order.totalPrice) || 0);
      }
      return sum;
    }, 0);

    const deliveredOrders = orders.filter((order) => order.status === 'DELIVERED').length;

    return {
      totalCrops: crops.length,
      totalStockKg,
      totalOrders: orders.length,
      deliveredOrders,
      successfulRevenue,
      pendingPaymentAmount,
    };
  }, [crops, orders]);

  const orderStatusBreakdown = useMemo(() => {
    const base = ORDER_STATUSES.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {});

    orders.forEach((order) => {
      base[order.status] = (base[order.status] || 0) + 1;
    });

    return ORDER_STATUSES.map((status) => ({ status, count: base[status] || 0 }));
  }, [orders]);

  const categoryBreakdown = useMemo(() => {
    const map = {};
    crops.forEach((crop) => {
      const category = crop.category || 'Uncategorized';
      map[category] = (map[category] || 0) + 1;
    });

    return Object.entries(map)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [crops]);

  const topCrops = useMemo(() => {
    const map = {};

    orders.forEach((order) => {
      const cropName = order.crop?.cropName || 'Unknown Crop';
      if (!map[cropName]) {
        map[cropName] = { cropName, orders: 0, quantity: 0, revenue: 0 };
      }

      map[cropName].orders += 1;
      map[cropName].quantity += Number(order.quantity) || 0;
      if (order.payment?.status === 'SUCCESS') {
        map[cropName].revenue += Number(order.totalPrice) || 0;
      }
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  if (loading) return <Loader text="Loading analytics..." />;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Farm Analytics</h1>
        <p className="text-gray-500 mt-1">Simple view of crops, orders, revenue, and performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8 animate-fade-in-up fill-mode-both delay-100">
        <SummaryCard icon={FiPackage} label="Total Crops" value={metrics.totalCrops} />
        <SummaryCard icon={FiBarChart2} label="Current Stock" value={`${metrics.totalStockKg} kg`} />
        <SummaryCard icon={FiShoppingBag} label="Total Orders" value={metrics.totalOrders} />
        <SummaryCard icon={FiDollarSign} label="Revenue (Paid)" value={formatPrice(metrics.successfulRevenue)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Order Status</h2>
          <div className="space-y-3">
            {orderStatusBreakdown.map((item) => (
              <div key={item.status} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">{item.status}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
            Delivered Orders: <span className="font-semibold text-gray-900 dark:text-white">{metrics.deliveredOrders}</span>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Crop Categories</h2>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-gray-400">No crops available.</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{item.category}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Top Crops by Revenue</h2>
        {topCrops.length === 0 ? (
          <p className="text-sm text-gray-400">No orders available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="py-2 pr-4">Crop</th>
                  <th className="py-2 pr-4">Orders</th>
                  <th className="py-2 pr-4">Quantity Sold</th>
                  <th className="py-2">Revenue (Paid)</th>
                </tr>
              </thead>
              <tbody>
                {topCrops.map((item) => (
                  <tr key={item.cropName} className="border-b border-gray-50 dark:border-gray-800/60">
                    <td className="py-2 pr-4 font-medium text-gray-900 dark:text-white">{item.cropName}</td>
                    <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{item.orders}</td>
                    <td className="py-2 pr-4 text-gray-600 dark:text-gray-300">{item.quantity} kg</td>
                    <td className="py-2 font-semibold text-emerald-600 dark:text-emerald-400">{formatPrice(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400">
          Pending Payment Value: <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(metrics.pendingPaymentAmount)}</span>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
          <Icon size={18} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}
