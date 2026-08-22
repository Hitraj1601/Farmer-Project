import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiArrowRight, FiHeart, FiShoppingBag, FiUser, FiBox, FiShoppingCart, FiTruck } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { formatPrice, getImageUrl } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../context/CartContext';

/* Category color mapping for subtle accent variety */
const CATEGORY_ACCENT = {
  Vegetable: { gradient: 'from-emerald-500 to-green-600', text: 'text-emerald-700 dark:text-emerald-300', light: 'bg-emerald-50/90 dark:bg-emerald-950/70', border: 'border-emerald-200/50 dark:border-emerald-800/50' },
  Grain: { gradient: 'from-amber-500 to-yellow-600', text: 'text-amber-700 dark:text-amber-300', light: 'bg-amber-50/90 dark:bg-amber-950/70', border: 'border-amber-200/50 dark:border-amber-800/50' },
  Fruit: { gradient: 'from-rose-500 to-pink-600', text: 'text-rose-700 dark:text-rose-300', light: 'bg-rose-50/90 dark:bg-rose-950/70', border: 'border-rose-200/50 dark:border-rose-800/50' },
  Spice: { gradient: 'from-orange-500 to-red-600', text: 'text-orange-700 dark:text-orange-300', light: 'bg-orange-50/90 dark:bg-orange-950/70', border: 'border-orange-200/50 dark:border-orange-800/50' },
  Pulse: { gradient: 'from-violet-500 to-purple-600', text: 'text-violet-700 dark:text-violet-300', light: 'bg-violet-50/90 dark:bg-violet-950/70', border: 'border-violet-200/50 dark:border-violet-800/50' },
  Oilseed: { gradient: 'from-teal-500 to-cyan-600', text: 'text-teal-700 dark:text-teal-300', light: 'bg-teal-50/90 dark:bg-teal-950/70', border: 'border-teal-200/50 dark:border-teal-800/50' },
  Dairy: { gradient: 'from-blue-500 to-indigo-600', text: 'text-blue-700 dark:text-blue-300', light: 'bg-blue-50/90 dark:bg-blue-950/70', border: 'border-blue-200/50 dark:border-blue-800/50' },
  Other: { gradient: 'from-slate-500 to-gray-600', text: 'text-slate-700 dark:text-slate-300', light: 'bg-slate-50/90 dark:bg-slate-950/70', border: 'border-slate-200/50 dark:border-slate-800/50' },
};

const getAccent = (cat) => CATEGORY_ACCENT[cat] || CATEGORY_ACCENT.Other;

export default function CropCard({ crop, index = 0, viewMode = 'grid' }) {
  const { user } = useAuth();
  const { isWishlisted, toggle } = useWishlist();
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(crop.id);
  const isBuyer = user?.role === 'BUYER';
  const inCart = isInCart(crop.id);
  const accent = getAccent(crop.category);

  const openDetails = () => navigate(`/crops/${crop.id}`);

  /* ═══════════════════ LIST VIEW ═══════════════════ */
  if (viewMode === 'list') {
    return (
      <div
        className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-none border border-gray-200/60 dark:border-gray-800/60 hover:border-emerald-300/60 dark:hover:border-emerald-700/40 shadow-sm hover:shadow-xl hover:shadow-emerald-500/[0.06] cursor-pointer animate-fade-in-up fill-mode-both transition-all duration-400"
        style={{ animationDelay: `${index * 50}ms` }}
        role="link"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails(); } }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative w-full sm:w-52 md:w-60 h-48 sm:h-auto overflow-hidden flex-shrink-0 rounded-none">
            <img
              src={getImageUrl(crop.imageUrl)}
              alt={crop.cropName}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80';
              }}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5" />
            {crop.quantity <= 10 && (
              <span className="absolute top-3 left-3 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Low Stock
              </span>
            )}
            {crop.category && (
              <span className={`absolute bottom-3 left-3 ${accent.light} ${accent.text} ${accent.border} backdrop-blur-xl text-[10px] font-bold px-2.5 py-1 rounded-lg border`}>
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
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 text-sm group/btn"
              >
                View Details
                <FiArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
              </Link>
              {isBuyer && (
                <>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!inCart) addToCart(crop.id, 1); }}
                    disabled={inCart}
                    className={`p-2.5 rounded-xl transition-all duration-300 border ${
                      inCart
                        ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-500 border-violet-200/50 dark:border-violet-800/50'
                        : 'bg-gray-50 dark:bg-gray-800/60 text-gray-400 border-gray-200/50 dark:border-gray-700/50 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-300/50'
                    }`}
                    title={inCart ? 'Already in cart' : 'Add to cart'}
                  >
                    <FiShoppingCart size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(crop.id); }}
                    className={`p-2.5 rounded-xl transition-all duration-300 border ${
                      wishlisted
                        ? 'bg-red-50 dark:bg-red-950/50 text-red-500 border-red-200/50 dark:border-red-800/50 scale-110'
                        : 'bg-gray-50 dark:bg-gray-800/60 text-gray-400 border-gray-200/50 dark:border-gray-700/50 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 hover:border-red-300/50'
                    }`}
                  >
                    {wishlisted ? <FaHeart size={16} /> : <FiHeart size={16} />}
                  </button>
                </>
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
      className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-none border border-gray-200/60 dark:border-gray-800/60 hover:border-emerald-300/50 dark:hover:border-emerald-700/40 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/[0.08] cursor-pointer animate-fade-in-up fill-mode-both transition-all duration-500 hover:-translate-y-1"
      style={{ animationDelay: `${index * 60}ms` }}
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetails(); } }}
    >
      {/* ── Image Section ── */}
      <div className="relative h-32 xs:h-36 sm:h-44 md:h-52 overflow-hidden rounded-none bg-gray-100 dark:bg-gray-800">
        <img
          src={getImageUrl(crop.imageUrl)}
          alt={crop.cropName}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80';
          }}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Hover overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

        {/* Category pill — top left */}
        {crop.category && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <span className={`${accent.light} ${accent.text} ${accent.border} backdrop-blur-xl text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg border inline-flex items-center`}>
              {crop.category}
            </span>
          </div>
        )}

        {/* Wishlist heart — top right */}
        {isBuyer && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(crop.id); }}
            className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 backdrop-blur-xl border
              ${wishlisted
                ? 'bg-red-500/90 text-white border-red-400/30 scale-110 shadow-red-500/30'
                : 'bg-white/70 dark:bg-gray-900/70 text-gray-500 border-white/20 dark:border-gray-700/30 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:text-red-500 hover:scale-110 hover:bg-red-50/90 dark:hover:bg-red-950/80'
              }`}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {wishlisted ? <FaHeart size={11} className="sm:w-3.5 sm:h-3.5" /> : <FiHeart size={11} className="sm:w-3.5 sm:h-3.5" />}
          </button>
        )}

        {/* Low stock badge */}
        {crop.quantity <= 10 && (
          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 z-20 bg-red-500/90 backdrop-blur-sm text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-lg shadow-red-500/30 flex items-center gap-1">
            <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
            Low Stock
          </span>
        )}

        {/* Price badge — bottom right, floating */}
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-lg sm:rounded-xl px-1.5 sm:px-3 py-0.5 sm:py-1.5 shadow-lg border border-white/20 dark:border-gray-700/30">
          <span className="text-sm sm:text-lg font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">{formatPrice(crop.pricePerKg)}</span>
          <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500 ml-0.5 font-medium">/kg</span>
        </div>
      </div>

      {/* ── Content Section ── */}
      <div className="p-3 sm:p-4">
        {/* Crop name */}
        <h3 className="font-bold text-gray-900 dark:text-white text-[13px] sm:text-[15px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 line-clamp-1 leading-snug">
          {crop.cropName}
        </h3>

        {/* Meta row: location + stock */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 xs:gap-0 mt-2">
          <span className="flex items-center gap-1 text-[11px] sm:text-sm text-gray-500 dark:text-gray-400 min-w-0">
            <FiMapPin size={11} className="text-emerald-500 flex-shrink-0" />
            <span className="truncate max-w-[80px] xs:max-w-[100px] sm:max-w-[120px]">{crop.location}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50/80 dark:bg-gray-800/60 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-gray-100/80 dark:border-gray-700/50 self-start xs:self-auto">
            <FiBox size={10} />
            {crop.quantity} kg
          </span>
        </div>

        {/* Farmer row */}
        {crop.farmer && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-gray-100/80 dark:border-gray-800/60">
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold shadow-sm shadow-emerald-500/20">
              {crop.farmer.name?.[0]}
            </span>
            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{crop.farmer.name}</p>
          </div>
        )}

        {/* Delivery availability badge */}
        {crop.farmer && (() => {
          const areas = crop.farmer.farmerProfile?.serviceableAreas;
          if (areas) {
            const areaList = areas.split(',').map(a => a.trim()).filter(Boolean);
            const display = areaList.length > 1
              ? `${areaList.slice(0, 1).join(', ')} +${areaList.length - 1} more`
              : areaList.join(', ');
            return (
              <div className="flex items-center gap-1 mt-1.5 text-[9px] sm:text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                <FiTruck size={9} className="flex-shrink-0" />
                <span className="truncate">Delivers: {display}</span>
              </div>
            );
          }
          return (
            <div className="flex items-center gap-1 mt-1.5 text-[9px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <FiTruck size={9} className="flex-shrink-0" />
              <span>Delivers Everywhere</span>
            </div>
          );
        })()}

        {/* CTA Buttons */}
        <div className="mt-3 flex gap-1.5">
          <Link
            to={`/crops/${crop.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg sm:rounded-xl
                       bg-gradient-to-r from-emerald-500 to-teal-500
                       text-white font-semibold text-xs sm:text-sm
                       shadow-md shadow-emerald-500/15
                       hover:from-emerald-400 hover:to-teal-400
                       hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5
                       transition-all duration-300
                       group/btn"
          >
            <span>Details</span>
            <FiArrowRight size={11} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
          </Link>
          {isBuyer && (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!inCart) addToCart(crop.id, 1); }}
              disabled={inCart}
              className={`flex items-center justify-center w-8 sm:w-10 rounded-lg sm:rounded-xl border transition-all duration-300 flex-shrink-0 ${
                inCart
                  ? 'bg-violet-50/80 dark:bg-violet-950/30 border-violet-200/50 dark:border-violet-800/50 text-violet-500'
                  : 'bg-gray-50/80 dark:bg-gray-800/60 border-gray-200/50 dark:border-gray-700/50 text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/50 hover:border-violet-300/50'
              }`}
              title={inCart ? 'Already in cart' : 'Add to cart'}
            >
              <FiShoppingCart size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
