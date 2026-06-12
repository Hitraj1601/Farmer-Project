import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiShoppingCart, FiChevronRight, FiMinus, FiPlus, FiUser, FiPhone, FiShield, FiTruck, FiCheckCircle } from 'react-icons/fi';
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
        const publicKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

        if (!publicKey) {
          toast.error('Razorpay public key missing in frontend environment. Complete payment from My Orders.');
          navigate('/my-orders');
          return;
        }

        const options = {
          key: publicKey,
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
        if (window.Razorpay) {
          new window.Razorpay(options).open();
        } else {
          toast.error('Payment SDK not loaded. Order placed, complete payment from My Orders.');
          navigate('/my-orders');
        }
      } catch (err) {
        toast.error((err.message || 'Payment initiation failed') + ' Order is placed. Complete payment from My Orders.');
        navigate('/my-orders');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <Loader text="Loading crop details..." />;
  if (!crop) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl p-16 text-center max-w-md mx-auto">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Crop not found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">This crop may have been removed or doesn&apos;t exist.</p>
        <Link to="/marketplace" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 transition-all">
          Back to Marketplace
        </Link>
      </div>
    </div>
  );

  const totalPrice = quantity * crop.pricePerKg;
  const stockPercent = Math.min(100, (crop.quantity / 100) * 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 py-4 animate-fade-in fill-mode-both">
            <Link to="/marketplace" className="hover:text-emerald-600 transition-colors font-medium">Marketplace</Link>
            <FiChevronRight size={14} />
            <span className="text-gray-900 dark:text-white font-bold">{crop.cropName}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Image */}
          <div className="animate-fade-in-up fill-mode-both">
            <div className="relative rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-2xl shadow-gray-300/30 dark:shadow-black/30 border border-gray-200/50 dark:border-gray-700/50">
              <img
                src={getImageUrl(crop.imageUrl)}
                alt={crop.cropName}
                className="w-full h-80 lg:h-[520px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              {crop.category && (
                <span className="absolute top-5 left-5 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider shadow-lg border border-white/30 dark:border-gray-700/30">
                  {crop.category}
                </span>
              )}
              {crop.quantity <= 10 && (
                <span className="absolute top-5 right-5 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl animate-pulse shadow-lg shadow-red-500/30">
                  🔥 Low Stock
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="animate-fade-in-up fill-mode-both delay-100">
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white leading-tight">{crop.cropName}</h1>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-500">
                <FiMapPin size={16} className="text-emerald-500" />
                <span className="text-sm font-medium">{crop.location}</span>
              </div>
              {reviews && (
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-xl">
                  <FiStar className="text-amber-400 fill-amber-400" size={14} />
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{reviews.averageRating}</span>
                  <span className="text-xs text-amber-500/70">({reviews.totalReviews})</span>
                </div>
              )}
            </div>

            {/* Price Card */}
            <div className="mt-8 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/30 dark:via-green-950/30 dark:to-teal-950/30 rounded-3xl p-7 border border-emerald-100 dark:border-emerald-900/50 shadow-lg shadow-emerald-500/[0.05]">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl lg:text-5xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(crop.pricePerKg)}</span>
                <span className="text-gray-500 font-medium">per kg</span>
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Available Stock</span>
                  <span className="font-bold text-gray-900 dark:text-white">{crop.quantity} kg</span>
                </div>
                <div className="w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-400 h-3 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Farmer Card */}
            {crop.farmer && (
              <div className="mt-5 flex items-center gap-4 p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg shadow-emerald-500/20">
                  {crop.farmer.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiUser size={14} className="text-gray-400" /> {crop.farmer.name}
                  </p>
                  {crop.farmer.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                      <FiPhone size={13} className="text-gray-400" /> {crop.farmer.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Trust badges */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { icon: FiShield, text: 'Verified', color: 'emerald' },
                { icon: FiTruck, text: 'Fast Delivery', color: 'blue' },
                { icon: FiCheckCircle, text: 'Quality Assured', color: 'violet' },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-3 border border-gray-100 dark:border-gray-700">
                  <badge.icon size={14} className={`text-${badge.color}-500`} />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{badge.text}</span>
                </div>
              ))}
            </div>

            {/* Order section */}
            {user?.role !== 'FARMER' && (
              <div className="mt-8 space-y-5">
                <div className="flex items-center gap-5">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Quantity (kg):</span>
                  <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
                      <FiMinus size={16} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={crop.quantity}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(crop.quantity, Number(e.target.value))))}
                      className="w-16 text-center border-x-2 border-gray-200 dark:border-gray-700 py-3 text-sm font-bold focus:outline-none dark:bg-gray-900 dark:text-white"
                    />
                    <button onClick={() => setQuantity(Math.min(crop.quantity, quantity + 1))} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <span className="font-bold text-gray-700 dark:text-gray-300">Total Price</span>
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(totalPrice)}</span>
                </div>

                <Button onClick={handleOrder} loading={ordering} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base">
                  <FiShoppingCart size={20} />
                  {ordering ? 'Placing Order...' : 'Place Order & Pay'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {reviews && reviews.reviews?.length > 0 && (
          <div className="mt-20 animate-fade-in-up fill-mode-both delay-200">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <FiStar className="text-white" size={18} />
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Farmer Reviews</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.reviews.map((rev) => (
                <div key={rev.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-amber-500/20">
                      {(rev.buyer?.name || 'B')[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{rev.buyer?.name || 'Buyer'}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <FiStar key={i} size={11} className={i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'} />
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
    </div>
  );
}
