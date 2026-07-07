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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ─── Enterprise Header ─── */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              My Wishlist
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Crops you are tracking. You will be notified if their prices drop.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/35 px-3 py-1.5 rounded-lg border border-emerald-200/50 dark:border-emerald-900/50 self-start md:self-auto">
            <FiHeart size={14} className="fill-emerald-500 text-emerald-500" />
            {items.length} saved item{items.length !== 1 ? 's' : ''} total
          </div>
        </div>
      </header>

      {/* ─── Content Area ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {items.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-16 text-center animate-fade-in-up fill-mode-both">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-100 to-teal-200 dark:from-emerald-950 dark:to-teal-900 rounded-3xl flex items-center justify-center mb-6">
              <FiHeart size={40} className="text-emerald-400" />
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
                  className="group gallery-card bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/[0.08] animate-fade-in-up fill-mode-both relative"
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
                  <div className="gallery-media relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={getImageUrl(crop.imageUrl)}
                      alt={crop.cropName}
                      loading="lazy"
                      decoding="async"
                      className="gallery-image w-full h-full object-cover"
                    />
                    <div className="gallery-overlay bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                    {crop.category && (
                      <span className="gallery-chip absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 text-gray-700 dark:text-gray-200 border-white/30 dark:border-gray-700/30">
                        {crop.category}
                      </span>
                    )}

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(item.cropId, crop.cropName)}
                      disabled={removing === item.cropId}
                      className="gallery-action absolute top-4 right-4 w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-110 transition-all duration-300 disabled:opacity-50 backdrop-blur-xl"
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
