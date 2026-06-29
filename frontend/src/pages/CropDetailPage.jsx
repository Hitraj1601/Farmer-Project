import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiShoppingCart, FiChevronRight, FiMinus, FiPlus, FiUser, FiPhone, FiShield, FiTruck, FiCheckCircle, FiMessageSquare, FiCamera } from 'react-icons/fi';
import { cropService, orderService, reviewService, paymentService, chatService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice, getImageUrl } from '../utils/helpers';
import Loader from '../components/Loader';
import Button from '../components/Button';
import toast from 'react-hot-toast';

export default function CropDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [farmerReviews, setFarmerReviews] = useState(null);
  const [cropReviews, setCropReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [ordering, setOrdering] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewImage, setReviewImage] = useState(null);
  const [reviewImagePreview, setReviewImagePreview] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await cropService.getById(id);
        setCrop(res.data);

        // Fetch farmer reviews
        if (res.data.farmerId) {
          const rev = await reviewService.getFarmerReviews(res.data.farmerId);
          setFarmerReviews(rev.data);
        }

        // Fetch crop-level reviews
        try {
          const cropRev = await reviewService.getCropReviews(id);
          setCropReviews(cropRev.data);
        } catch { /* no crop reviews yet */ }

        // Check if buyer can review this crop (has delivered order)
        if (user?.role === 'BUYER') {
          try {
            const ordersRes = await orderService.getMyOrders();
            const delivered = ordersRes.data?.some(
              (o) => o.cropId === id && o.status === 'DELIVERED'
            );
            setCanReview(delivered);
          } catch { /* silent */ }
        }
      } catch {
        toast.error('Crop not found');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

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

        if (!publicKey || publicKey === 'your_razorpay_key_id') {
          await paymentService.processFree(order.id);
          toast.success('Order confirmed! (Demo mode)');
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
        const status = err.response?.status;
        if (status === 502 || status === 503) {
          await paymentService.processFree(order.id);
          toast.success('Order confirmed! (Demo mode)');
          navigate('/my-orders');
          return;
        }
        toast.error((err.message || 'Payment initiation failed') + ' Order placed. Complete payment from My Orders.');
        navigate('/my-orders');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setOrdering(false);
    }
  };

  const handleMessageFarmer = async () => {
    if (!isAuthenticated) return navigate('/login');
    setChatLoading(true);
    try {
      const res = await chatService.getOrCreateConversation(crop.farmerId, id);
      navigate(`/chat/${res.data.id}`);
    } catch {
      toast.error('Could not start conversation');
    } finally {
      setChatLoading(false);
    }
  };

  const handleReviewImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewImage(file);
      setReviewImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitReview = async () => {
    if (!crop?.farmerId) return;
    setSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append('farmerId', crop.farmerId);
      formData.append('cropId', id);
      formData.append('rating', reviewForm.rating);
      if (reviewForm.comment) formData.append('comment', reviewForm.comment);
      if (reviewImage) formData.append('image', reviewImage);

      await reviewService.create(formData);
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: '' });
      setReviewImage(null);
      setReviewImagePreview(null);

      // Refresh reviews
      const cropRev = await reviewService.getCropReviews(id);
      setCropReviews(cropRev.data);
      const farmerRev = await reviewService.getFarmerReviews(crop.farmerId);
      setFarmerReviews(farmerRev.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
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
  const allReviews = cropReviews?.reviews || farmerReviews?.reviews || [];

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
              {farmerReviews && (
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-1 rounded-xl">
                  <FiStar className="text-amber-400 fill-amber-400" size={14} />
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{farmerReviews.averageRating}</span>
                  <span className="text-xs text-amber-500/70">({farmerReviews.totalReviews})</span>
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

            {/* Farmer Card + Message Button */}
            {crop.farmer && (
              <div className="mt-5 flex items-center gap-3 p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg shadow-emerald-500/20">
                  {crop.farmer.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiUser size={14} className="text-gray-400" /> {crop.farmer.name}
                  </p>
                  {crop.farmer.phone && (
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                      <FiPhone size={13} className="text-gray-400" /> {crop.farmer.phone}
                    </p>
                  )}
                </div>
                {user?.role === 'BUYER' && (
                  <button
                    onClick={handleMessageFarmer}
                    disabled={chatLoading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <FiMessageSquare size={15} />
                    {chatLoading ? 'Opening...' : 'Message'}
                  </button>
                )}
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

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!isAuthenticated) return navigate('/login');
                      setAddingToCart(true);
                      await addToCart(id, parseFloat(quantity));
                      setAddingToCart(false);
                    }}
                    disabled={addingToCart || isInCart(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold transition-all duration-300 border-2 ${
                      isInCart(id)
                        ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 cursor-default'
                        : 'bg-white dark:bg-gray-900 border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-500/10'
                    }`}
                  >
                    <FiShoppingCart size={20} />
                    {addingToCart ? 'Adding...' : isInCart(id) ? '✓ In Cart' : 'Add to Cart'}
                  </button>
                  <Button onClick={handleOrder} loading={ordering} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-base">
                    {ordering ? 'Placing...' : 'Buy Now'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-20 animate-fade-in-up fill-mode-both delay-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <FiStar className="text-white" size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  {cropReviews?.totalReviews ? 'Crop Reviews' : 'Farmer Reviews'}
                </h2>
                {(cropReviews?.totalReviews || farmerReviews?.totalReviews) ? (
                  <p className="text-sm text-gray-500">
                    {cropReviews?.totalReviews || farmerReviews?.totalReviews} reviews · Average {cropReviews?.averageRating || farmerReviews?.averageRating} ⭐
                  </p>
                ) : null}
              </div>
            </div>
            {canReview && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 font-semibold text-sm hover:bg-amber-100 dark:hover:bg-amber-950 transition-colors"
              >
                <FiStar size={15} /> Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="mb-8 bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in-up fill-mode-both">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Write a Review for {crop.cropName}</h3>
              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`text-3xl transition-all duration-200 hover:scale-110 ${star <= reviewForm.rating ? 'text-amber-400' : 'text-gray-200 dark:text-gray-700'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Comment</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="input-field h-24 resize-none"
                    placeholder="Share your experience with this crop..."
                  />
                </div>

                {/* Photo upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Photo (optional)</label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 cursor-pointer hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                      <FiCamera size={16} />
                      <span className="text-sm font-medium">Upload Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleReviewImageChange} />
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

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSubmitReview} loading={submittingReview}>
                    Submit Review
                  </Button>
                  <button
                    onClick={() => { setShowReviewForm(false); setReviewImage(null); setReviewImagePreview(null); }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Review Cards */}
          {allReviews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {allReviews.map((rev) => (
                <div key={rev.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-amber-500/20">
                      {(rev.buyer?.name || 'B')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{rev.buyer?.name || 'Buyer'}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <FiStar key={i} size={11} className={i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'} />
                        ))}
                      </div>
                    </div>
                    {rev.crop && (
                      <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-medium">
                        {rev.crop.cropName}
                      </span>
                    )}
                  </div>
                  {rev.comment && <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{rev.comment}</p>}
                  {rev.imageUrl && (
                    <img
                      src={getImageUrl(rev.imageUrl)}
                      alt="Review"
                      className="mt-3 rounded-xl w-full max-h-40 object-cover border border-gray-100 dark:border-gray-700"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400 dark:text-gray-500">No reviews yet. Be the first to review!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
