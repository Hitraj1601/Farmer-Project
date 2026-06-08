import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMapPin, FiArrowRight, FiTrash2, FiTrendingDown } from 'react-icons/fi';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <FiHeart className="text-white" size={20} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Wishlist</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 mt-1 ml-13">
          {items.length} saved crop{items.length !== 1 ? 's' : ''} — get notified when prices drop
        </p>
      </div>

      {items.length === 0 ? (
        <div className="empty-state animate-fade-in-up fill-mode-both delay-100">
          <div className="icon-area">
            <FiHeart size={32} />
          </div>
          <h3>Your wishlist is empty</h3>
          <p>Browse the marketplace and tap the ❤️ on any crop to save it here</p>
          <Link to="/marketplace" className="btn-primary mt-4 inline-flex items-center gap-2">
            Browse Marketplace <FiArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const crop = item.crop;
            const priceDropped = crop.pricePerKg < item.notifiedPrice;
            const dropAmount = (item.notifiedPrice - crop.pricePerKg).toFixed(2);

            return (
              <div
                key={item.id}
                className={`card group relative animate-fade-in-up fill-mode-both`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Price drop badge */}
                {priceDropped && (
                  <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <FiTrendingDown size={11} />
                    ₹{dropAmount} drop!
                  </div>
                )}

                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(crop.imageUrl)}
                    alt={crop.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  {crop.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {crop.category}
                    </span>
                  )}
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.cropId, crop.cropName)}
                    disabled={removing === item.cropId}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                    aria-label="Remove from wishlist"
                  >
                    {removing === item.cropId
                      ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <FiTrash2 size={13} />
                    }
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {crop.cropName}
                  </h3>

                  <div className="flex items-center text-gray-500 text-xs mt-1 gap-1">
                    <FiMapPin size={11} className="flex-shrink-0" />
                    <span className="truncate">{crop.location}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
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
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-400">{crop.quantity} kg available</span>
                      {crop.farmer && (
                        <span className="text-xs text-gray-400">by {crop.farmer.name}</span>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/crops/${crop.id}`}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl
                               bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold text-sm
                               hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all duration-300
                               group/btn"
                  >
                    View & Order
                    <FiArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
