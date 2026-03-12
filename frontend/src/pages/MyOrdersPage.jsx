import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiStar } from 'react-icons/fi';
import { orderService, paymentService, reviewService } from '../services';
import OrderCard from '../components/OrderCard';
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
    try {
      const res = await paymentService.createOrder(orderId);
      const { razorpayOrderId, amount, currency } = res.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
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
      if (window.Razorpay) new window.Razorpay(options).open();
    } catch {
      toast.error('Could not initiate payment');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Orders</h1>
        <p className="text-gray-500 mt-1">Track and manage all your orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state animate-fade-in-up fill-mode-both delay-100">
          <div className="icon-area">
            <FiShoppingBag size={32} />
          </div>
          <h3>No orders yet</h3>
          <p>Start browsing the marketplace to place your first order</p>
          <Link to="/marketplace" className="btn-primary mt-4 inline-block">Browse Marketplace</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <div key={order.id} className={`animate-fade-in-up fill-mode-both delay-${Math.min(i * 100, 500)}`}>
              <OrderCard
                order={order}
                actions={
                  <div className="flex gap-2">
                    {order.status === 'PENDING' && order.payment?.status !== 'SUCCESS' && (
                      <Button size="sm" onClick={() => handlePay(order.id, order.crop?.cropName)}>
                        Pay Now
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

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Write a Review">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                  className={`text-3xl transition-all duration-200 hover:scale-110 ${star <= reviewForm.rating ? 'text-amber-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Comment</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="input-field h-28 resize-none"
              placeholder="Share your experience with this farmer..."
            />
          </div>
          <Button onClick={handleReview} loading={submitting} className="w-full">
            Submit Review
          </Button>
        </div>
      </Modal>
    </div>
  );
}
