import { Link } from 'react-router-dom';
import { FiMapPin, FiArrowRight, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';

export default function CropCard({ crop, index = 0 }) {
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(crop.id);
  const isBuyer = user?.role === 'BUYER';

  return (
    <div
      className="card card-hover group animate-fade-in-up fill-mode-both"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={getImageUrl(crop.imageUrl)}
          alt={crop.cropName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {crop.category && (
            <span className="bg-white/90 backdrop-blur-md text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {crop.category}
            </span>
          )}
        </div>

        {/* Wishlist heart button */}
        {isBuyer && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(crop.id); }}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300
              ${wishlisted
                ? 'bg-red-500 text-white scale-110'
                : 'bg-white/90 backdrop-blur-md text-gray-400 hover:text-red-500 hover:scale-110'
              }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {wishlisted ? <FaHeart size={14} /> : <FiHeart size={14} />}
          </button>
        )}

        {crop.quantity <= 10 && (
          <span className="absolute bottom-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
            Low Stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
          {crop.cropName}
        </h3>

        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-1.5 gap-1">
          <FiMapPin size={13} className="flex-shrink-0" />
          <span className="truncate">{crop.location}</span>
        </div>

        <div className="flex items-end justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{formatPrice(crop.pricePerKg)}</span>
            <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">/ kg</span>
          </div>
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-full">
            {crop.quantity} kg
          </span>
        </div>

        {crop.farmer && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[10px] font-bold">
              {crop.farmer.name?.[0]}
            </span>
            {crop.farmer.name}
          </p>
        )}

        <Link
          to={`/crops/${crop.id}`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                     bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold text-sm
                     hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all duration-300
                     group/btn"
        >
          View Details
          <FiArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
