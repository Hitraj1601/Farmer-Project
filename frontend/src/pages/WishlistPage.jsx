import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiArrowRight, FiTrash2, FiTrendingDown, FiShoppingBag, FiPackage } from 'react-icons/fi';
import { wishlistService } from '../services';
import { formatPrice, getImageUrl } from '../utils/helpers';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistService.getAll();
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  const handleRemove = async (cropId, cropName) => {
    setRemoving(cropId);
    try {
      await wishlistService.remove(cropId);
      setItems((prev) => prev.filter((i) => i.cropId !== cropId));
      toast.success(`${cropName} removed from wishlist`);
    } catch {
      toast.error('Failed to remove from wishlist');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) return <Loader text="Loading your wishlist..." />;

  return (
    <div className="min-h-screen">
      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-rose-950 to-gray-900 pt-8 pb-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-[100px]" />
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl rounded-full text-sm text-rose-400 mb-6 animate-fade-in fill-mode-both">
              <FiHeart size={14} className="fill-rose-400" />
              {items.length} saved crop{items.length !== 1 ? 's' : ''}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight animate-fade-in-up fill-mode-both">
              My{' '}
              <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-red-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Wishlist
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed animate-fade-in-up fill-mode-both delay-200">
              Your saved crops — get notified when prices drop
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16 relative z-10">
        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-16 text-center animate-fade-in-up fill-mode-both">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-rose-100 to-pink-200 dark:from-rose-950 dark:to-pink-900 rounded-3xl flex items-center justify-center mb-6">
              <FiHeart size={40} className="text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
              Browse the marketplace and tap the ❤️ on any crop to save it here
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Browse Marketplace <FiArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item, i) => {
              const crop = item.crop;
              const priceDropped = crop.pricePerKg < item.notifiedPrice;
              const dropAmount = (item.notifiedPrice - crop.pricePerKg).toFixed(2);

              return (
                <div
                  key={item.id}
                  className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-rose-500/[0.08] transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fade-in-up fill-mode-both relative"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Price drop badge */}
                  {priceDropped && (
                    <div className="absolute -top-0 right-4 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-b-xl flex items-center gap-1 shadow-lg shadow-emerald-500/30">
                      <FiTrendingDown size={11} />
                      ₹{dropAmount} drop!
                    </div>
                  )}

                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={getImageUrl(crop.imageUrl)}
                      alt={crop.cropName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {crop.category && (
                      <span className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl text-gray-700 dark:text-gray-200 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-lg border border-white/30 dark:border-gray-700/30">
                        {crop.category}
                      </span>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(item.cropId, crop.cropName)}
                      disabled={removing === item.cropId}
                      className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-110 transition-all duration-300 disabled:opacity-50 backdrop-blur-xl"
                      aria-label="Remove from wishlist"
                    >
                      {removing === item.cropId
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <FiTrash2 size={16} />
                      }
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                      {crop.cropName}
                    </h3>

                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-2 gap-1.5">
                      <FiMapPin size={13} className="flex-shrink-0 text-emerald-500" />
                      <span className="truncate">{crop.location}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {formatPrice(crop.pricePerKg)}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">/ kg</span>
                        </div>
                        {priceDropped && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(item.notifiedPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiPackage size={11} /> {crop.quantity} kg available
                        </span>
                        {crop.farmer && (
                          <span className="text-xs text-gray-400">by {crop.farmer.name}</span>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/crops/${crop.id}`}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl
                                 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50
                                 text-emerald-700 dark:text-emerald-400 font-bold text-sm
                                 border border-emerald-100 dark:border-emerald-900/50
                                 hover:from-emerald-500 hover:to-green-500 hover:text-white hover:border-transparent
                                 dark:hover:from-emerald-600 dark:hover:to-green-600 dark:hover:text-white
                                 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5
                                 group/btn"
                    >
                      View & Order
                      <FiArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
