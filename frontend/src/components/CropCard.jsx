import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiArrowRight, FiHeart, FiShoppingBag, FiUser } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';

export default function CropCard({ crop, index = 0, viewMode = 'grid' }) {
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(crop.id);
  const isBuyer = user?.role === 'BUYER';

  const openDetails = () => {
    navigate(`/crops/${crop.id}`);
  };

  if (viewMode === 'list') {
    return (
      <div
        className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/[0.05] transition-all duration-500 hover:-translate-y-0.5 overflow-hidden animate-fade-in-up fill-mode-both"
        style={{ animationDelay: `${index * 0.06}s` }}
        role="link"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openDetails();
          }
        }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-56 h-48 sm:h-auto overflow-hidden flex-shrink-0">
            <img
              src={getImageUrl(crop.imageUrl)}
              alt={crop.cropName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/5" />
            {crop.quantity <= 10 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse shadow-lg shadow-red-500/30">
                Low Stock
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {crop.category && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {crop.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {crop.cropName}
                  </h3>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(crop.pricePerKg)}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 block">per kg</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <FiMapPin size={13} />
                  {crop.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <FiShoppingBag size={13} />
                  {crop.quantity} kg available
                </span>
                {crop.farmer && (
                  <span className="flex items-center gap-1.5">
                    <FiUser size={13} />
                    {crop.farmer.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Link
                to={`/crops/${crop.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-2.5 px-6 rounded-xl hover:from-emerald-400 hover:to-green-400 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 text-sm group/btn"
              >
                View Details
                <FiArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              {isBuyer && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(crop.id); }}
                  className={`p-2.5 rounded-xl transition-all duration-300 ${
                    wishlisted
                      ? 'bg-red-50 dark:bg-red-950 text-red-500 scale-110'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                  }`}
                >
                  {wishlisted ? <FaHeart size={16} /> : <FiHeart size={16} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Grid View (default) ───
  return (
    <div
      className="group bg-white/92 dark:bg-slate-900/92 rounded-[1.8rem] border border-slate-200/80 dark:border-slate-700/70 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/[0.08] transition-all duration-500 hover:-translate-y-2 overflow-hidden animate-fade-in-up fill-mode-both"
      style={{ animationDelay: `${index * 0.08}s` }}
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetails();
        }
      }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={getImageUrl(crop.imageUrl)}
          alt={crop.cropName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category badge */}
        {crop.category && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl text-gray-700 dark:text-gray-200 text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-lg border border-white/30 dark:border-gray-700/30">
              {crop.category}
            </span>
          </div>
        )}

        {/* Wishlist heart button */}
        {isBuyer && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(crop.id); }}
            className={`absolute top-4 right-4 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 backdrop-blur-xl border
              ${wishlisted
                ? 'bg-red-500 text-white border-red-400 scale-110 shadow-red-500/30'
                : 'bg-white/80 dark:bg-gray-900/80 text-gray-400 border-white/30 dark:border-gray-700/30 hover:text-red-500 hover:scale-110 hover:shadow-xl'
              }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {wishlisted ? <FaHeart size={16} /> : <FiHeart size={16} />}
          </button>
        )}

        {/* Low stock badge */}
        {crop.quantity <= 10 && (
          <span className="absolute bottom-4 left-4 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl animate-pulse shadow-lg shadow-red-500/30">
            🔥 Low Stock
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
          {crop.cropName}
        </h3>

        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mt-2 gap-1.5">
          <FiMapPin size={13} className="flex-shrink-0 text-emerald-500 dark:text-emerald-400" />
          <span className="truncate">{crop.location}</span>
        </div>

        <div className="flex items-end justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatPrice(crop.pricePerKg)}</span>
            <span className="text-sm text-gray-400 dark:text-gray-500 ml-1">/ kg</span>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl">
            {crop.quantity} kg
          </span>
        </div>

        {crop.farmer && (
          <div className="flex items-center gap-2 mt-3">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md shadow-emerald-500/20">
              {crop.farmer.name?.[0]}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{crop.farmer.name}</p>
          </div>
        )}

        <Link
          to={`/crops/${crop.id}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-full
                     bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50
                     text-emerald-700 dark:text-emerald-400 font-bold text-sm
                     border border-emerald-100 dark:border-emerald-900/50
                     hover:from-emerald-500 hover:to-teal-500 hover:text-white hover:border-transparent
                     dark:hover:from-emerald-600 dark:hover:to-teal-600 dark:hover:text-white
                     transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5
                     group/btn"
        >
          View Details
          <FiArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
