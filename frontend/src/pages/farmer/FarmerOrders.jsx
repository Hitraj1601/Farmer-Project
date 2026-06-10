import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiTruck, FiPackage, FiShoppingBag, FiMapPin } from 'react-icons/fi';
import { orderService } from '../../services/index';
import { formatPrice } from '../../utils/helpers';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import OrderTrackingTimeline from '../../components/OrderTrackingTimeline';
import toast from 'react-hot-toast';

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.data);
    } catch { setOrders([]); }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await orderService.updateStatus(orderId, status);
      toast.success(`Order ${status.toLowerCase()}`);
      fetchOrders();
    } catch {
      toast.error('Failed to update order');
    }
  };

  if (loading) return <Loader text="Loading orders..." />;

  const statusConfig = {
    PENDING: { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-400' },
    ACCEPTED: { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-400' },
    SHIPPED: { bg: 'bg-violet-50 dark:bg-violet-950', text: 'text-violet-700 dark:text-violet-400', dot: 'bg-violet-400' },
    DELIVERED: { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-400' },
    REJECTED: { bg: 'bg-red-50 dark:bg-red-950', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-400' },
  };

  return (
    <div>
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-gray-500 mt-1">Manage incoming orders from buyers</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state animate-fade-in-up fill-mode-both delay-100">
          <div className="icon-area">
            <FiShoppingBag size={32} />
          </div>
          <h3>No orders received yet</h3>
          <p>Orders will appear here once buyers start purchasing your crops</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const sc = statusConfig[order.status] || statusConfig.PENDING;
            return (
              <div key={order.id} className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 hover:shadow-md transition-all duration-200 animate-fade-in-up fill-mode-both delay-${Math.min(i * 100, 500)}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{order.crop?.cropName}</h3>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>{order.quantity} kg</span>
                      <span>·</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(order.totalPrice)}</span>
                      {order.buyer && (
                        <>
                          <span>·</span>
                          <span>Buyer: {order.buyer.name}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      Payment: <span className={order.payment?.status === 'SUCCESS' ? 'text-emerald-600 font-medium' : 'text-gray-500'}>{order.payment?.status || 'Pending'}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {order.status !== 'REJECTED' && (
                      <Button variant="secondary" size="sm" onClick={() => setTrackingOrderId(order.id)} className="gap-1.5">
                        <FiMapPin size={14} /> Track
                      </Button>
                    )}
                    {order.status === 'PENDING' && (
                      <>
                        <Button size="sm" onClick={() => updateStatus(order.id, 'ACCEPTED')} className="gap-1.5">
                          <FiCheck size={14} /> Accept
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => updateStatus(order.id, 'REJECTED')} className="gap-1.5">
                          <FiX size={14} /> Reject
                        </Button>
                      </>
                    )}
                    {order.status === 'ACCEPTED' && (
                      <Button size="sm" onClick={() => updateStatus(order.id, 'SHIPPED')} className="gap-1.5">
                        <FiTruck size={14} /> Mark Shipped
                      </Button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <Button size="sm" onClick={() => updateStatus(order.id, 'DELIVERED')} className="gap-1.5">
                        <FiPackage size={14} /> Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Tracking Modal */}
      <Modal isOpen={!!trackingOrderId} onClose={() => setTrackingOrderId(null)} title="Order Tracking" size="lg">
        {trackingOrderId && (
          <OrderTrackingTimeline
            orderId={trackingOrderId}
            isFarmer={true}
            onClose={() => setTrackingOrderId(null)}
          />
        )}
      </Modal>
    </div>
  );
}
