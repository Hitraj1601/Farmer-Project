import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiShoppingCart, FiChevronRight, FiMinus, FiPlus, FiUser, FiPhone } from 'react-icons/fi';
import { cropService, orderService, reviewService, paymentService } from '../services';
import { useAuth } from '../context/AuthContext';
import { formatPrice, getImageUrl } from '../utils/helpers';
import Loader from '../components/Loader';
import Button from '../components/Button';
import toast from 'react-hot-toast';

export default function CropDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await cropService.getById(id);
        setCrop(res.data);
        if (res.data.farmerId) {
          const rev = await reviewService.getFarmerReviews(res.data.farmerId);
          setReviews(rev.data);
        }
      } catch {
        toast.error('Crop not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleOrder = async () => {
    if (!isAuthenticated) return navigate('/login');
    setOrdering(true);
    try {
      const res = await orderService.create({ cropId: id, quantity: parseFloat(quantity) });
      const order = res.data;

      try {
        const payRes = await paymentService.createOrder(order.id);
        const { razorpayOrderId, amount, currency } = payRes.data;
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount,
          currency,
          name: 'FarmConnect',
          description: `Order for ${crop.cropName}`,
          order_id: razorpayOrderId,
          handler: async (response) => {
            try {
              await paymentService.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success('Order placed and payment successful!');
            } catch {
              toast.error('Payment verification failed');
            }
          },
          prefill: { name: user?.name, email: user?.email },
          theme: { color: '#059669' },
        };
        if (window.Razorpay) new window.Razorpay(options).open();
        else toast.success('Order placed! Complete payment from My Orders.');
      } catch {
        toast.success('Order placed! Complete payment from My Orders.');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <Loader text="Loading crop details..." />;
  if (!crop) return (
    <div className="empty-state mt-20">
      <h3>Crop not found</h3>
      <p>This crop may have been removed or doesn&apos;t exist.</p>
      <Link to="/marketplace" className="btn-primary mt-4 inline-block">Back to Marketplace</Link>
    </div>
  );

  const totalPrice = quantity * crop.pricePerKg;
  const stockPercent = Math.min(100, (crop.quantity / 100) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 animate-fade-in fill-mode-both">
        <Link to="/marketplace" className="hover:text-emerald-600 transition-colors">Marketplace</Link>
        <FiChevronRight size={14} />
        <span className="text-gray-900 dark:text-white font-medium">{crop.cropName}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="animate-fade-in-up fill-mode-both">
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-xl shadow-black/[0.06]">
            <img
              src={getImageUrl(crop.imageUrl)}
              alt={crop.cropName}
              className="w-full h-80 lg:h-[480px] object-cover"
            />
            {crop.category && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300">
                {crop.category}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="animate-fade-in-up fill-mode-both delay-100">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{crop.cropName}</h1>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <FiMapPin size={15} />
              <span className="text-sm">{crop.location}</span>
            </div>
            {reviews && (
              <div className="flex items-center gap-1.5">
                <FiStar className="text-amber-400 fill-amber-400" size={15} />
                <span className="text-sm font-semibold">{reviews.averageRating}</span>
                <span className="text-sm text-gray-400">({reviews.totalReviews})</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-6 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-900">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-emerald-600">{formatPrice(crop.pricePerKg)}</span>
              <span className="text-gray-500">per kg</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-gray-600 dark:text-gray-400">Available Stock</span>
                <span className="font-semibold text-gray-900 dark:text-white">{crop.quantity} kg</span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all" style={{ width: `${stockPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Farmer */}
          {crop.farmer && (
            <div className="mt-5 flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {crop.farmer.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <FiUser size={14} className="text-gray-400" /> {crop.farmer.name}
                </p>
                {crop.farmer.phone && (
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <FiPhone size={13} className="text-gray-400" /> {crop.farmer.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Order section */}
          {user?.role !== 'FARMER' && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity (kg):</span>
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
                    <FiMinus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={crop.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(crop.quantity, Number(e.target.value))))}
                    className="w-16 text-center border-x border-gray-200 dark:border-gray-700 py-2.5 text-sm font-semibold focus:outline-none dark:bg-gray-900 dark:text-white"
                  />
                  <button onClick={() => setQuantity(Math.min(crop.quantity, quantity + 1))} className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
                    <FiPlus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                <span className="font-medium text-gray-700 dark:text-gray-300">Total Price</span>
                <span className="text-2xl font-extrabold text-emerald-600">{formatPrice(totalPrice)}</span>
              </div>

              <Button onClick={handleOrder} loading={ordering} className="w-full flex items-center justify-center gap-2 py-3.5">
                <FiShoppingCart size={18} />
                {ordering ? 'Placing Order...' : 'Place Order & Pay'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews && reviews.reviews?.length > 0 && (
        <div className="mt-16 animate-fade-in-up fill-mode-both delay-200">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">Farmer Reviews</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.reviews.map((rev) => (
              <div key={rev.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                    {(rev.buyer?.name || 'B')[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{rev.buyer?.name || 'Buyer'}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FiStar key={i} size={12} className={i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                </div>
                {rev.comment && <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{rev.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
