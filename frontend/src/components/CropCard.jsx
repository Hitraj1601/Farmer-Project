import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiArrowRight, FiHeart, FiShoppingBag, FiUser, FiEye, FiBox } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';

/* Category color mapping for subtle accent variety */
const CATEGORY_ACCENT = {
  Vegetable: { bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', light: 'bg-emerald-50 dark:bg-emerald-950/60', border: 'border-emerald-200 dark:border-emerald-800' },
  Grain: { bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', light: 'bg-amber-50 dark:bg-amber-950/60', border: 'border-amber-200 dark:border-amber-800' },
  Fruit: { bg: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', light: 'bg-rose-50 dark:bg-rose-950/60', border: 'border-rose-200 dark:border-rose-800' },
  Spice: { bg: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-300', light: 'bg-orange-50 dark:bg-orange-950/60', border: 'border-orange-200 dark:border-orange-800' },
  Pulse: { bg: 'bg-violet-500', text: 'text-violet-700 dark:text-violet-300', light: 'bg-violet-50 dark:bg-violet-950/60', border: 'border-violet-200 dark:border-violet-800' },
  Oilseed: { bg: 'bg-teal-500', text: 'text-teal-700 dark:text-teal-300', light: 'bg-teal-50 dark:bg-teal-950/60', border: 'border-teal-200 dark:border-teal-800' },
  Dairy: { bg: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300', light: 'bg-blue-50 dark:bg-blue-950/60', border: 'border-blue-200 dark:border-blue-800' },
  Other: { bg: 'bg-slate-500', text: 'text-slate-700 dark:text-slate-300', light: 'bg-slate-50 dark:bg-slate-950/60', border: 'border-slate-200 dark:border-slate-800' },
};

const getAccent = (cat) => CATEGORY_ACCENT[cat] || CATEGORY_ACCENT.Other;

export default function CropCard({ crop, index = 0, viewMode = 'grid' }) {
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(crop.id);
  const isBuyer = user?.role === 'BUYER';
  const accent = getAccent(crop.category);

  const openDetails = () => navigate(`/crops/${crop.id}`);

  /* ═══════════════════ LIST VIEW ═══════════════════ */
  if (viewMode === 'list') {
    return (
      <div
        className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 hover:border-emerald-200 dark:hover:border-emerald-800/60 shadow-sm hover:shadow-xl hover:shadow-emerald-500/[0.06] transition-all duration-500 overflow-hidden cursor-pointer animate-fade-in-up fill-mode-both"
        style={{ animationDelay: `${index * 50}ms` }}
        role="link"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails(); } }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-52 md:w-60 h-48 sm:h-auto overflow-hidden flex-shrink-0">
            <img
              src={getImageUrl(crop.imageUrl)}
              alt={crop.cropName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 group-hover:to-black/10 transition-all duration-500" />
            {crop.quantity <= 10 && (
              <span className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Low Stock
              </span>
            )}
            {crop.category && (
              <span className={`absolute bottom-3 left-3 ${accent.light} ${accent.text} ${accent.border} border backdrop-blur-sm text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider`}>
                {crop.category}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {crop.cropName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <FiMapPin size={13} className="text-emerald-500" />
                      {crop.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiBox size={13} className="text-blue-500" />
                      {crop.quantity} kg
                    </span>
                    {crop.farmer && (
                      <span className="flex items-center gap-1.5">
                        <FiUser size={13} className="text-violet-500" />
                        {crop.farmer.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">{formatPrice(crop.pricePerKg)}</span>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500 block font-medium">per kg</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 mt-4">
              <Link
                to={`/crops/${crop.id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 text-sm group/btn"
              >
                View Details
                <FiArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
              </Link>
              {isBuyer && (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(crop.id); }}
                  className={`p-2.5 rounded-xl transition-all duration-300 ${
                    wishlisted
                      ? 'bg-red-50 dark:bg-red-950/50 text-red-500 scale-110'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50'
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

  /* ═══════════════════ GRID VIEW ═══════════════════ */
  return (
    <div
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 hover:border-emerald-200/80 dark:hover:border-emerald-700/50 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/[0.08] transition-all duration-500 hover:-translate-y-1.5 overflow-hidden cursor-pointer animate-fade-in-up fill-mode-both"
      style={{ animationDelay: `${index * 60}ms` }}
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails(); } }}
    >
      {/* ── Image Section ── */}
      <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={getImageUrl(crop.imageUrl)}
          alt={crop.cropName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />

        {/* Hover overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        {/* Quick view button — appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-3 group-hover:translate-y-0">
          <Link
            to={`/crops/${crop.id}`}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-gray-900 dark:text-white font-bold text-sm py-2.5 px-5 rounded-xl shadow-xl hover:bg-emerald-500 hover:text-white transition-all duration-300 flex items-center gap-2 border border-white/20"
          >
            <FiEye size={15} />
            Quick View
          </Link>
        </div>

        {/* Category pill — top left */}
        {crop.category && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`${accent.light} ${accent.text} ${accent.border} border backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm`}>
              {crop.category}
            </span>
          </div>
        )}

        {/* Wishlist heart — top right */}
        {isBuyer && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(crop.id); }}
            className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 backdrop-blur-md border
              ${wishlisted
                ? 'bg-red-500/90 text-white border-red-400/50 scale-110 shadow-red-500/30'
                : 'bg-white/80 dark:bg-gray-900/80 text-gray-500 border-white/30 dark:border-gray-700/50 hover:text-red-500 hover:scale-110 hover:bg-red-50/90 dark:hover:bg-red-950/80'
              }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {wishlisted ? <FaHeart size={14} /> : <FiHeart size={14} />}
          </button>
        )}

        {/* Low stock badge */}
        {crop.quantity <= 10 && (
          <span className="absolute bottom-3 left-3 z-10 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Low Stock
          </span>
        )}

        {/* Price badge — bottom right, floating */}
        <div className="absolute bottom-3 right-3 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl px-3 py-1.5 shadow-lg border border-white/30 dark:border-gray-700/50">
          <span className="text-lg font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">{formatPrice(crop.pricePerKg)}</span>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-0.5 font-medium">/kg</span>
        </div>
      </div>

      {/* ── Content Section ── */}
      <div className="p-4">
        {/* Crop name */}
        <h3 className="font-bold text-gray-900 dark:text-white text-[15px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 line-clamp-1 leading-snug">
          {crop.cropName}
        </h3>

        {/* Meta row: location + stock */}
        <div className="flex items-center justify-between mt-2.5">
          <span className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <FiMapPin size={12} className="text-emerald-500 flex-shrink-0" />
            <span className="truncate max-w-[120px]">{crop.location}</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-lg">
            <FiBox size={11} />
            {crop.quantity} kg
          </span>
        </div>

        {/* Farmer row */}
        {crop.farmer && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800/80">
            <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
              {crop.farmer.name?.[0]}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{crop.farmer.name}</p>
          </div>
        )}

        {/* CTA Button */}
        <Link
          to={`/crops/${crop.id}`}
          onClick={(e) => e.stopPropagation()}
          className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                     bg-gray-50 dark:bg-gray-800/80
                     text-gray-700 dark:text-gray-300 font-semibold text-sm
                     border border-gray-100 dark:border-gray-700/80
                     hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-600 hover:text-white hover:border-transparent
                     hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5
                     transition-all duration-300
                     group/btn"
        >
          View Details
          <FiArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>
    </div>
  );
}
