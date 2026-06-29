import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiShoppingCart, FiTrash2, FiMinus, FiPlus, FiArrowRight,
  FiPackage, FiMapPin, FiUser, FiAlertCircle, FiCheck
} from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services';
import { formatPrice, getImageUrl } from '../utils/helpers';
import Button from '../components/Button';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cartItems, cartTotal, cartCount, updateItem, removeItem, clearCart, checkout, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  // Group items by farmer
  const farmerGroups = {};
  cartItems.forEach((item) => {
    const fId = item.crop?.farmerId || 'unknown';
    if (!farmerGroups[fId]) {
      farmerGroups[fId] = {
        farmerId: fId,
        farmerName: item.crop?.farmer?.name || 'Unknown Farmer',
        items: [],
        subtotal: 0,
      };
    }
    farmerGroups[fId].items.push(item);
    farmerGroups[fId].subtotal += item.quantity * (item.crop?.pricePerKg || 0);
  });

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const orders = await checkout();
      if (!orders || orders.length === 0) {
        setCheckingOut(false);
        return;
      }

      // Process payment for each order
      const publicKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      const isDemo = !publicKey || publicKey === 'your_razorpay_key_id';

      for (const order of orders) {
        if (isDemo) {
          try {
            await paymentService.processFree(order.id);
          } catch {
            // Order created, payment can be done from My Orders
          }
        } else {
          try {
            const payRes = await paymentService.createOrder(order.id);
            const { razorpayOrderId, amount, currency } = payRes.data;

            if (window.Razorpay) {
              const options = {
                key: publicKey,
                amount,
                currency,
                name: 'FarmConnect',
                description: `Order with ${order.items?.length || 1} item(s)`,
                order_id: razorpayOrderId,
                handler: async (response) => {
                  try {
                    await paymentService.verify({
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_signature: response.razorpay_signature,
                    });
                  } catch {
                    // Payment can be retried from My Orders
                  }
                },
                prefill: { name: user?.name, email: user?.email },
                theme: { color: '#059669' },
              };
              new window.Razorpay(options).open();
            }
          } catch (err) {
            const status = err.response?.status;
            if (status === 502 || status === 503) {
              try { await paymentService.processFree(order.id); } catch { /* ignore */ }
            }
          }
        }
      }

      toast.success(`${orders.length} order(s) created! ${isDemo ? '(Demo mode)' : ''}`, { duration: 4000 });
      navigate('/my-orders');
    } catch {
      // Error already handled by checkout()
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <Loader text="Loading your cart..." />;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 pt-8 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 border border-violet-500/20 backdrop-blur-xl rounded-full text-sm text-violet-400 mb-6 animate-fade-in fill-mode-both">
              <FiShoppingCart size={14} />
              {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight animate-fade-in-up fill-mode-both">
              Shopping{' '}
              <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Cart
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed animate-fade-in-up fill-mode-both delay-200">
              Review your items and checkout when ready
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 30 C 360 60 1080 0 1440 30 L 1440 60 L 0 60 Z" className="fill-gray-50 dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16 relative z-10">
        {cartCount === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-16 text-center animate-fade-in-up fill-mode-both">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-100 to-purple-200 dark:from-violet-950 dark:to-purple-900 rounded-3xl flex items-center justify-center mb-6">
              <FiShoppingCart size={40} className="text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Browse the marketplace to find fresh produce from verified farmers
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Browse Marketplace <FiArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-5">
              {/* Clear cart button */}
              <div className="flex items-center justify-between animate-fade-in fill-mode-both">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {Object.keys(farmerGroups).length} farmer{Object.keys(farmerGroups).length !== 1 ? 's' : ''} · {cartCount} item{cartCount !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={clearCart}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-all"
                >
                  <FiTrash2 size={12} /> Clear Cart
                </button>
              </div>

              {/* Grouped by farmer */}
              {Object.values(farmerGroups).map((group, gi) => (
                <div
                  key={group.farmerId}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-lg shadow-gray-200/30 dark:shadow-black/20 overflow-hidden animate-fade-in-up fill-mode-both"
                  style={{ animationDelay: `${gi * 100}ms` }}
                >
                  {/* Farmer header */}
                  <div className="px-5 py-3.5 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-800/30 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
                      {group.farmerName?.[0]?.toUpperCase() || 'F'}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <FiUser size={12} className="text-gray-400" />
                        {group.farmerName}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {group.items.length} item{group.items.length !== 1 ? 's' : ''} · Subtotal: {formatPrice(group.subtotal)}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-100 dark:divide-gray-800/80">
                    {group.items.map((item) => (
                      <CartItemRow
                        key={item.id}
                        item={item}
                        onUpdate={updateItem}
                        onRemove={removeItem}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-6 sticky top-24 animate-fade-in-up fill-mode-both delay-200">
                <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5">Order Summary</h3>

                <div className="space-y-3 mb-5">
                  {Object.values(farmerGroups).map((group) => (
                    <div key={group.farmerId} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[60%]">
                        {group.farmerName} ({group.items.length})
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatPrice(group.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    {Object.keys(farmerGroups).length} separate order{Object.keys(farmerGroups).length !== 1 ? 's' : ''} will be created
                  </p>
                </div>

                {/* Info banner */}
                <div className="flex items-start gap-2.5 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/50 mb-5">
                  <FiAlertCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                    Each farmer will receive a separate order. You can track and pay for each order independently.
                  </p>
                </div>

                <Button
                  onClick={handleCheckout}
                  loading={checkingOut}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base"
                >
                  <FiCheck size={18} />
                  {checkingOut ? 'Processing...' : `Checkout (${cartCount} items)`}
                </Button>

                <Link
                  to="/marketplace"
                  className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors py-2"
                >
                  <FiArrowRight size={14} className="rotate-180" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Cart Item Row ─── */
function CartItemRow({ item, onUpdate, onRemove }) {
  const [updating, setUpdating] = useState(false);
  const crop = item.crop;
  const subtotal = item.quantity * (crop?.pricePerKg || 0);

  const handleQtyChange = async (newQty) => {
    if (newQty < 1 || newQty > (crop?.quantity || 999)) return;
    setUpdating(true);
    await onUpdate(item.cropId, newQty);
    setUpdating(false);
  };

  return (
    <div className="px-5 py-4 flex items-center gap-4">
      {/* Image */}
      <Link to={`/crops/${item.cropId}`} className="flex-shrink-0">
        <img
          src={getImageUrl(crop?.imageUrl)}
          alt={crop?.cropName}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-100 dark:border-gray-700 hover:opacity-80 transition-opacity"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/crops/${item.cropId}`} className="hover:text-emerald-600 transition-colors">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{crop?.cropName}</h4>
        </Link>
        {crop?.location && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <FiMapPin size={10} /> {crop.location}
          </p>
        )}
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
          {formatPrice(crop?.pricePerKg || 0)}<span className="text-gray-400 font-normal">/kg</span>
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 flex-shrink-0">
        <button
          onClick={() => handleQtyChange(item.quantity - 1)}
          disabled={updating || item.quantity <= 1}
          className="px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 disabled:opacity-30"
        >
          <FiMinus size={13} />
        </button>
        <span className="px-3 py-1.5 text-sm font-bold text-gray-900 dark:text-white border-x-2 border-gray-200 dark:border-gray-700 min-w-[3rem] text-center">
          {updating ? '...' : item.quantity}
        </span>
        <button
          onClick={() => handleQtyChange(item.quantity + 1)}
          disabled={updating || item.quantity >= (crop?.quantity || 999)}
          className="px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400 disabled:opacity-30"
        >
          <FiPlus size={13} />
        </button>
      </div>

      {/* Subtotal + remove */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-sm text-gray-900 dark:text-white">{formatPrice(subtotal)}</p>
        <button
          onClick={() => onRemove(item.cropId)}
          className="text-[11px] text-red-500 hover:text-red-600 font-medium mt-1 transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
