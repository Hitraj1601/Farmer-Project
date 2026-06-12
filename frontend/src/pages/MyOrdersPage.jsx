import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiStar, FiMapPin, FiDownload, FiPackage, FiArrowRight } from 'react-icons/fi';
import { orderService, paymentService, reviewService } from '../services';
import { generateInvoice } from '../utils/generateInvoice';
import OrderCard from '../components/OrderCard';
import OrderTrackingTimeline from '../components/OrderTrackingTimeline';
import Loader from '../components/Loader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handlePay = async (orderId, cropName) => {
    const publicKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    // If Razorpay public key is not configured, go straight to free payment
    if (!publicKey || publicKey === 'your_razorpay_key_id') {
      try {
        await paymentService.processFree(orderId);
        toast.success('Order confirmed! (Payment gateway not configured — using demo mode)');
        fetchOrders();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not process payment');
      }
      return;
    }

    try {
      let razorpayOrderId, amount, currency;

      try {
        const res = await paymentService.createOrder(orderId);
        razorpayOrderId = res.data.razorpayOrderId;
        amount = res.data.amount;
        currency = res.data.currency;
      } catch (err) {
        const status = err.response?.status;
        // 502 = gateway error (invalid/missing keys), 503 = not configured
        if (status === 502 || status === 503) {
          toast('Razorpay gateway not configured. Using demo payment mode.', { icon: 'ℹ️' });
          await paymentService.processFree(orderId);
          toast.success('Order confirmed in demo mode!');
          fetchOrders();
          return;
        }
        throw err;
      }

      if (!window.Razorpay) {
        toast.error('Payment SDK not loaded. Refresh and try again.');
        return;
      }

      const options = {
        key: publicKey,
        amount,
        currency,
        name: 'FarmConnect',
        description: `Payment for ${cropName}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await paymentService.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            fetchOrders();
          } catch {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#059669' },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not initiate payment');
    }
  };

  const handleReview = async () => {
    setSubmitting(true);
    try {
      await reviewService.create({ farmerId: reviewModal.farmerId, ...reviewForm });
      toast.success('Review submitted!');
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch {
      toast.error('Failed to submit review');
    }
    setSubmitting(false);
  };

  if (loading) return <Loader text="Loading your orders..." />;

  return (
    <div className="min-h-screen">
      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 pt-8 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl rounded-full text-sm text-blue-400 mb-6 animate-fade-in fill-mode-both">
              <FiPackage size={14} />
              {orders.length} order{orders.length !== 1 ? 's' : ''}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight animate-fade-in-up fill-mode-both">
              My{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Orders
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed animate-fade-in-up fill-mode-both delay-200">
              Track and manage all your orders in one place
            </p>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 30 C 360 60 1080 0 1440 30 L 1440 60 L 0 60 Z" className="fill-gray-50 dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* ─── Content ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16 relative z-10">
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-16 text-center animate-fade-in-up fill-mode-both">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-950 dark:to-indigo-900 rounded-3xl flex items-center justify-center mb-6">
              <FiShoppingBag size={40} className="text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Start browsing the marketplace to place your first order
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Browse Marketplace <FiArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order, i) => (
              <div
                key={order.id}
                className="animate-fade-in-up fill-mode-both"
                style={{ animationDelay: `${Math.min(i * 0.1, 0.5)}s` }}
              >
                <OrderCard
                  order={order}
                  actions={
                    <div className="flex gap-2 flex-wrap">
                      {order.status !== 'REJECTED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setTrackingOrderId(order.id)}
                        >
                          <FiMapPin size={14} className="mr-1" /> Track
                        </Button>
                      )}
                      {order.status === 'PENDING' && order.payment?.status !== 'SUCCESS' && (
                        <Button size="sm" onClick={() => handlePay(order.id, order.crop?.cropName)}>
                          Pay Now
                        </Button>
                      )}
                      {['ACCEPTED', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            try { generateInvoice(order); }
                            catch { toast.error('Could not generate invoice'); }
                          }}
                        >
                          <FiDownload size={14} className="mr-1" /> Invoice
                        </Button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setReviewModal({ farmerId: order.crop?.farmer?.id || order.crop?.farmerId })}
                        >
                          <FiStar size={14} className="mr-1" /> Review
                        </Button>
                      )}
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Tracking Modal */}
      <Modal isOpen={!!trackingOrderId} onClose={() => setTrackingOrderId(null)} title="Order Tracking" size="lg">
        {trackingOrderId && (
          <OrderTrackingTimeline
            orderId={trackingOrderId}
            onClose={() => setTrackingOrderId(null)}
          />
        )}
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Write a Review">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className={`text-3xl transition-all duration-200 hover:scale-125 ${star <= reviewForm.rating ? 'text-amber-400 drop-shadow-lg' : 'text-gray-200 dark:text-gray-700'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Comment</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="input-field h-28 resize-none rounded-2xl"
              placeholder="Share your experience with this farmer..."
            />
          </div>
          <Button onClick={handleReview} loading={submitting} className="w-full rounded-2xl">
            Submit Review
          </Button>
        </div>
      </Modal>
    </div>
  );
}
