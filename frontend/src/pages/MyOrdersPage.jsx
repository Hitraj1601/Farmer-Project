import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiStar, FiMapPin, FiDownload, FiPackage, FiArrowRight, FiCamera } from 'react-icons/fi';
import { orderService, paymentService, reviewService } from '../services';
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
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [cancellationOrder, setCancellationOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

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
    let publicKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!publicKey || publicKey === 'your_razorpay_key_id') {
      try {
        const config = await paymentService.getConfig();
        publicKey = config.data?.razorpayKeyId;
      } catch {
        publicKey = null;
      }
    }

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
      const formData = new FormData();
      formData.append('farmerId', reviewModal.farmerId);
      if (reviewModal.cropId) formData.append('cropId', reviewModal.cropId);
      formData.append('rating', reviewForm.rating);
      if (reviewForm.comment) formData.append('comment', reviewForm.comment);
      if (reviewImage) formData.append('image', reviewImage);

      await reviewService.create(formData);
      toast.success('Review submitted!');
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: '' });
      setReviewImage(null);
      setReviewImagePreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  const handleCancelOrder = async () => {
    if (!cancellationOrder) return;
    if (!cancellationReason.trim() || cancellationReason.trim().length < 3) {
      toast.error('Please provide a reason (at least 3 characters)');
      return;
    }

    setCancelling(true);
    try {
      await orderService.cancel(cancellationOrder.id, cancellationReason);
      toast.success('Order cancelled successfully');
      setCancellationOrder(null);
      setCancellationReason('');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Loader text="Loading your orders..." />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ─── Enterprise Header ─── */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6 mb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              My Orders
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Track delivery progress, payments, and view order invoices.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/35 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50 self-start md:self-auto">
            <FiPackage size={14} />
            {orders.length} order{orders.length !== 1 ? 's' : ''} total
          </div>
        </div>
      </header>

      {/* ─── Content Area ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-16 text-center animate-fade-in-up fill-mode-both">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-950 dark:to-teal-900 rounded-3xl flex items-center justify-center mb-6">
              <FiShoppingBag size={40} className="text-emerald-400" />
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
                      {['PENDING', 'ACCEPTED'].includes(order.status) && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setCancellationOrder(order)}
                        >
                          Cancel
                        </Button>
                      )}
                      {['ACCEPTED', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={async () => {
                            try {
                              const { generateInvoice } = await import('../utils/generateInvoice');
                              generateInvoice(order);
                            } catch {
                              toast.error('Could not generate invoice');
                            }
                          }}
                        >
                          <FiDownload size={14} className="mr-1" /> Invoice
                        </Button>
                      )}
                      {order.status === 'DELIVERED' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setReviewModal({
                            farmerId: order.crop?.farmer?.id || order.crop?.farmerId,
                            cropId: order.cropId,
                            cropName: order.crop?.cropName,
                          })}
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
      <Modal isOpen={!!reviewModal} onClose={() => { setReviewModal(null); setReviewImage(null); setReviewImagePreview(null); }} title="Write a Review">
        <div className="space-y-5">
          {reviewModal?.cropName && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-3 py-2 rounded-xl">
              Reviewing: {reviewModal.cropName}
            </p>
          )}
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
              placeholder="Share your experience with this crop..."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Photo (optional)</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 cursor-pointer hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                <FiCamera size={16} />
                <span className="text-sm font-medium">Upload Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setReviewImage(file);
                    setReviewImagePreview(URL.createObjectURL(file));
                  }
                }} />
              </label>
              {reviewImagePreview && (
                <div className="relative">
                  <img src={reviewImagePreview} alt="Review" className="w-14 h-14 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
                  <button
                    onClick={() => { setReviewImage(null); setReviewImagePreview(null); }}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
          <Button onClick={handleReview} loading={submitting} className="w-full rounded-2xl">
            Submit Review
          </Button>
        </div>
      </Modal>

      {/* ─── Cancellation Modal ─── */}
      <Modal
        isOpen={!!cancellationOrder}
        onClose={() => {
          setCancellationOrder(null);
          setCancellationReason('');
        }}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Why are you cancelling this order?
            </label>
            <textarea
              className="form-input w-full min-h-[100px] text-sm resize-none rounded-xl"
              placeholder="Provide a cancellation reason (at least 3 characters)..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              disabled={cancelling}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setCancellationOrder(null);
                setCancellationReason('');
              }}
              disabled={cancelling}
            >
              Back
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelOrder}
              loading={cancelling}
              disabled={cancellationReason.trim().length < 3}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
