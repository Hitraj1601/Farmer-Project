import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiSearch, FiMapPin, FiPackage, FiFilter, FiX, FiUser,
  FiSliders, FiChevronDown, FiChevronLeft, FiChevronRight, FiGrid, FiList, FiStar,
  FiTrendingUp, FiShoppingBag, FiRefreshCw,
  FiZap, FiCheckCircle, FiBox, FiArrowRight
} from 'react-icons/fi';
import { GiWheat, GiFruitBowl, GiFarmer } from 'react-icons/gi';
import { cropService } from '../services';
import { CROP_CATEGORIES } from '../utils/constants';
import CropCard from '../components/CropCard';
import Pagination from '../components/Pagination';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First', icon: '🆕' },
  { value: 'priceAsc', label: 'Price: Low → High', icon: '💰' },
  { value: 'priceDesc', label: 'Price: High → Low', icon: '💎' },
  { value: 'quantityDesc', label: 'Most Available', icon: '📦' },
];

const CATEGORY_ICONS = {
  All: FiGrid,
  Grains: GiWheat,
  Vegetables: GiFruitBowl,
  Fruits: FiStar,
  Spices: FiTrendingUp,
  Pulses: FiPackage,
  Oilseeds: FiShoppingBag,
  Dairy: GiFarmer,
  Flowers: FiStar,
  'Cash Crops': FiZap,
  'Herbs & Medicinal': FiBox,
  'Dry Fruits & Nuts': FiPackage,
  'Organic Manures': FiBox,
  Others: FiBox,
};

const CATEGORY_EMOJI = {
  All: '🌾',
  Grains: '🌾',
  Vegetables: '🥬',
  Fruits: '🍎',
  Spices: '🌶️',
  Pulses: '🫘',
  Oilseeds: '🥜',
  Dairy: '🥛',
  Flowers: '🌸',
  'Cash Crops': '🌱',
  'Herbs & Medicinal': '🌿',
  'Dry Fruits & Nuts': '🌰',
  'Organic Manures': '🪵',
  Others: '📦',
};

/* ─── Scroll-reveal hook ─── */
function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.08 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, isVisible];
}

function ScrollReveal({ children, className = '' }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/* ─── Interactive Horizontal Category Bar ─── */
function CategoryBar({ category, setCategory, resetPage, viewMode, setViewMode }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const totalDragDistance = useRef(0);

  const checkScrollability = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollability();
    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);

    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  // Translate vertical wheel scroll to instant horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (delta === 0) return;
      e.preventDefault();
      el.scrollLeft += delta * 1.3;
      checkScrollability();
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [checkScrollability]);

  // Auto-scroll selected category into view within container ONLY
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const activeEl = container.querySelector(`[data-category="${category}"]`);
    if (activeEl) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const scrollOffset = activeRect.left - containerRect.left - (containerRect.width / 2) + (activeRect.width / 2);
      container.scrollBy({ left: scrollOffset, behavior: 'smooth' });
    }
  }, [category]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === 'left' ? -300 : 300;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    dragStartX.current = e.pageX - scrollRef.current.offsetLeft;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
    totalDragDistance.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStartX.current) * 1.5;
    totalDragDistance.current += Math.abs(walk);
    scrollRef.current.scrollLeft = dragScrollLeft.current - walk;
    checkScrollability();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleCategoryClick = (cat) => {
    if (totalDragDistance.current > 8) return;
    setCategory(cat);
    resetPage();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-5 mb-5 shadow-sm" id="category-section">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
            <FiGrid size={14} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Categories</h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
              Browse produce by agricultural classification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {category !== 'All' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50">
              Category: <strong className="font-bold">{category}</strong>
              <button
                onClick={() => { setCategory('All'); resetPage(); }}
                className="hover:text-emerald-900 dark:hover:text-white ml-0.5 p-0.5 rounded hover:bg-emerald-200/50 dark:hover:bg-emerald-800/50 transition-colors"
                title="Reset to All Categories"
              >
                <FiX size={12} />
              </button>
            </span>
          )}

          <div className="flex items-center gap-0.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl p-1 border border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-600/50' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              title="Grid view"
              id="view-grid-btn"
            >
              <FiGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-600/50' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
              title="List view"
              id="view-list-btn"
            >
              <FiList size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Horizontal Scroll Bar Layout */}
      <div className="flex items-center gap-2 relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => handleScroll('left')}
          disabled={!canScrollLeft}
          className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 ${
            canScrollLeft
              ? 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 hover:border-emerald-500 shadow-sm cursor-pointer active:scale-95'
              : 'bg-gray-100/50 dark:bg-gray-800/30 text-gray-300 dark:text-gray-700 border-gray-100 dark:border-gray-800/40 cursor-not-allowed opacity-50'
          }`}
          aria-label="Scroll Left"
          title="Scroll left"
        >
          <FiChevronLeft size={18} />
        </button>

        {/* Scroll Track Container */}
        <div className="relative flex-1 overflow-hidden min-w-0">
          {/* Category Pills Track */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex gap-2.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-hide select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ touchAction: 'pan-x' }}
          >
            {CROP_CATEGORIES.map((cat) => {
              const isActive = category === cat;
              const emoji = CATEGORY_EMOJI[cat] || '📦';
              return (
                <button
                  key={cat}
                  data-category={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 border ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500/50 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                      : 'bg-gray-50/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-200/60 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:border-emerald-300/50 dark:hover:border-emerald-700/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:shadow-md hover:shadow-gray-200/30 dark:hover:shadow-black/20'
                  }`}
                  id={`category-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                >
                  <span className="text-base leading-none transition-transform group-hover:scale-110 duration-200">
                    {emoji}
                  </span>
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => handleScroll('right')}
          disabled={!canScrollRight}
          className={`flex-shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 ${
            canScrollRight
              ? 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 hover:border-emerald-500 shadow-sm cursor-pointer active:scale-95'
              : 'bg-gray-100/50 dark:bg-gray-800/30 text-gray-300 dark:text-gray-700 border-gray-100 dark:border-gray-800/40 cursor-not-allowed opacity-50'
          }`}
          aria-label="Scroll Right"
          title="Scroll right"
        >
          <FiChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  // Advanced filters
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [farmerName, setFarmerName] = useState('');
  const [debouncedFarmerName, setDebouncedFarmerName] = useState('');

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFarmerName(farmerName), 400);
    return () => clearTimeout(timer);
  }, [farmerName]);

  // Fetch crops when any filter changes
  useEffect(() => {
    const fetchCrops = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 15 };
        if (debouncedSearch) params.search = debouncedSearch;
        if (location) params.location = location;
        if (category && category !== 'All') params.category = category;
        if (sortBy && sortBy !== 'newest') params.sortBy = sortBy;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (debouncedFarmerName) params.farmerName = debouncedFarmerName;
        const res = await cropService.getAll(params);
        setCrops(res.data.crops);
        setPagination(res.data.pagination);
        window.scrollTo(0, 0);
      } catch {
        setCrops([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, [page, debouncedSearch, location, category, sortBy, minPrice, maxPrice, debouncedFarmerName]);

  const resetPage = () => setPage(1);

  const clearAllFilters = useCallback(() => {
    setSearch('');
    setLocation('');
    setCategory('All');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setFarmerName('');
    setPage(1);
  }, []);

  const activeFilterCount = [
    search, location, category !== 'All' ? category : '',
    sortBy !== 'newest' ? sortBy : '',
    minPrice, maxPrice, farmerName,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">

      {/* ─── Enterprise Header ─── */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6 mb-8">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Marketplace
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Direct connection to verified agricultural sellers with zero middlemen markup.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/35 px-3.5 py-2 rounded-xl border border-emerald-200/50 dark:border-emerald-900/50 self-start md:self-auto shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {pagination.total > 0 ? `${pagination.total} fresh crops available now` : 'Farm-fresh produce daily'}
          </div>
        </div>
      </header>

      {/* ─── Main Content Area ─── */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* ─── Search & Filters block ─── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 p-5 mb-5 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={17} />
              <input
                type="text"
                placeholder="Search crops, category, or farmer..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                className="w-full pl-11 pr-10 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl placeholder:text-gray-500 outline-none border border-gray-200 dark:border-gray-700 text-sm font-medium focus:bg-white dark:focus:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                id="marketplace-search"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); resetPage(); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                  title="Clear search"
                >
                  <FiX size={15} />
                </button>
              )}
            </div>
            <div className="relative sm:w-64">
              <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
              <input
                type="text"
                placeholder="Filter by location..."
                value={location}
                onChange={(e) => { setLocation(e.target.value); resetPage(); }}
                className="w-full pl-11 pr-10 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl placeholder:text-gray-500 outline-none border border-gray-200 dark:border-gray-700 text-sm font-medium focus:bg-white dark:focus:bg-gray-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                id="marketplace-location"
              />
              {location && (
                <button
                  onClick={() => { setLocation(''); resetPage(); }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-colors"
                  title="Clear location"
                >
                  <FiX size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ─── Category Navigation Component ─── */}
        <ScrollReveal>
          <CategoryBar
            category={category}
            setCategory={setCategory}
            resetPage={resetPage}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </ScrollReveal>

        {/* ─── Filters Toolbar ─── */}
        <ScrollReveal delay={60}>
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-xl shadow-gray-900/[0.04] dark:shadow-black/40 p-4 sm:p-5 mb-6" id="filters-section">
            <div className="flex flex-wrap gap-3 items-center justify-between sm:justify-start">
              {/* Sort dropdown */}
              <div className="relative flex-1 sm:flex-initial sm:w-56">
                <FiSliders className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-medium border border-gray-200/60 dark:border-gray-700/50 focus:border-emerald-400 dark:focus:border-emerald-500 outline-none appearance-none cursor-pointer transition-all duration-200 hover:bg-gray-100/80 dark:hover:bg-gray-800"
                  id="sort-select"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              {/* Advanced filters toggle */}
              <button
                onClick={() => setShowAdvanced(v => !v)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 whitespace-nowrap
                  ${showAdvanced
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-50/80 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-200/60 dark:border-gray-700/50 hover:border-emerald-300 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
                  }`}
                id="advanced-filters-btn"
              >
                <FiFilter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className={`rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold ${showAdvanced ? 'bg-white/90 text-emerald-600' : 'bg-emerald-500 text-white'}`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="hidden sm:block flex-1" />

              {/* Results count */}
              {!loading && (
                <div className="w-full sm:w-auto text-center sm:text-left text-xs sm:text-sm mt-1 sm:mt-0 bg-gray-50 dark:bg-gray-800/50 px-3.5 py-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-gray-500 dark:text-gray-400">
                    Showing <span className="font-bold text-emerald-600 dark:text-emerald-400">{crops.length}</span> of{' '}
                    <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> crops
                  </span>
                </div>
              )}
            </div>

            {/* ─── Advanced Filters (expandable) ─── */}
            <div
              className={`grid transition-all duration-500 ease-in-out ${
                showAdvanced ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Min Price (₹/kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); resetPage(); }}
                      className="w-full px-3.5 py-2.5 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl text-sm text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/50 focus:border-emerald-400 outline-none transition-all duration-200 placeholder:text-gray-400"
                      min="0"
                      id="filter-min-price"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Max Price (₹/kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); resetPage(); }}
                      className="w-full px-3.5 py-2.5 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl text-sm text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/50 focus:border-emerald-400 outline-none transition-all duration-200 placeholder:text-gray-400"
                      min="0"
                      id="filter-max-price"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Farmer Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        placeholder="Search by farmer..."
                        value={farmerName}
                        onChange={(e) => { setFarmerName(e.target.value); resetPage(); }}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50/80 dark:bg-gray-800/60 rounded-xl text-sm text-gray-700 dark:text-gray-300 border border-gray-200/60 dark:border-gray-700/50 focus:border-emerald-400 outline-none transition-all duration-200 placeholder:text-gray-400"
                        id="filter-farmer-name"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-gray-100 dark:border-gray-800/80 animate-fade-in">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mr-1">Active:</span>
                {search && <FilterChip label={`"${search}"`} icon={<FiSearch size={10} />} onRemove={() => setSearch('')} />}
                {location && <FilterChip label={location} icon={<FiMapPin size={10} />} onRemove={() => setLocation('')} />}
                {category !== 'All' && <FilterChip label={category} icon={<FiGrid size={10} />} onRemove={() => setCategory('All')} />}
                {sortBy !== 'newest' && <FilterChip label={SORT_OPTIONS.find(s => s.value === sortBy)?.label} icon={<FiSliders size={10} />} onRemove={() => setSortBy('newest')} />}
                {minPrice && <FilterChip label={`Min ₹${minPrice}`} onRemove={() => setMinPrice('')} />}
                {maxPrice && <FilterChip label={`Max ₹${maxPrice}`} onRemove={() => setMaxPrice('')} />}
                {farmerName && <FilterChip label={farmerName} icon={<FiUser size={10} />} onRemove={() => setFarmerName('')} />}
                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50"
                  id="clear-filters-btn"
                >
                  <FiRefreshCw size={11} /> Clear All
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* ══════════════════════════════════════════════════════════
            PRODUCTS GRID
           ══════════════════════════════════════════════════════════ */}
        {loading ? (
          <div className={`grid gap-4 sm:gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'
              : 'grid-cols-1 max-w-5xl mx-auto'
          }`}>
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 overflow-hidden shadow-sm">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                  <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" style={{ animationDelay: `${i * 100 + 50}ms` }} />
                  <div className="flex justify-between">
                    <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
                    <div className="h-4 w-14 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />
                  </div>
                  <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" style={{ animationDelay: `${i * 100 + 100}ms` }} />
                </div>
              </div>
            ))}
          </div>
        ) : crops.length === 0 ? (
          <ScrollReveal>
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-800/60 shadow-xl p-16 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                <FiPackage size={36} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No crops found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
                We couldn't find any crops matching your filters. Try adjusting your search criteria or clearing all filters.
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 text-sm"
                  id="empty-clear-filters"
                >
                  <FiRefreshCw size={15} /> Clear All Filters
                </button>
              )}
            </div>
          </ScrollReveal>
        ) : (
          <>
            <div className={`grid gap-4 sm:gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5'
                : 'grid-cols-1 max-w-5xl mx-auto'
            }`}>
              {crops.map((crop, index) => (
                <CropCard key={crop.id} crop={crop} index={index} viewMode={viewMode} />
              ))}
            </div>
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Filter Chip ─── */
function FilterChip({ label, icon, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold rounded-lg border border-emerald-200/50 dark:border-emerald-800/40 group hover:bg-emerald-100/80 dark:hover:bg-emerald-950/50 transition-all duration-200">
      {icon && <span className="text-emerald-500 dark:text-emerald-500">{icon}</span>}
      {label}
      <button onClick={onRemove} className="hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors ml-0.5 p-0.5 rounded hover:bg-emerald-200/50 dark:hover:bg-emerald-800/30">
        <FiX size={11} />
      </button>
    </span>
  );
}
