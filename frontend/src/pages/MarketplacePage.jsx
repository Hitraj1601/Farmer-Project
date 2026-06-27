import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiSearch, FiMapPin, FiPackage, FiFilter, FiX, FiUser,
  FiSliders, FiChevronDown, FiGrid, FiList, FiStar,
  FiTrendingUp, FiShoppingBag, FiRefreshCw,
  FiZap, FiCheckCircle, FiBox
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
  Others: FiBox,
};

const CATEGORY_GRADIENTS = {
  All: 'from-gray-600 to-slate-700',
  Grains: 'from-amber-500 to-yellow-600',
  Vegetables: 'from-emerald-500 to-green-600',
  Fruits: 'from-rose-500 to-pink-600',
  Spices: 'from-orange-500 to-red-600',
  Pulses: 'from-violet-500 to-purple-600',
  Oilseeds: 'from-teal-500 to-cyan-600',
  Dairy: 'from-blue-500 to-indigo-600',
  Others: 'from-slate-500 to-gray-600',
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

function ScrollReveal({ children, className = '', delay = 0 }) {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
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
        const params = { page, limit: 20 };
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ══════════════════════════════════════════════════
          HERO SECTION — Premium gradient with floating elements
         ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-6 pb-24 sm:pt-8 sm:pb-28" id="marketplace-hero">
        {/* Multi-layered background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-emerald-950/80 to-gray-950" />
          {/* Mesh gradient blobs */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-32 left-[10%] w-[600px] h-[600px] rounded-full bg-emerald-500/15 blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
            <div className="absolute top-[20%] right-[5%] w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[130px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
            <div className="absolute bottom-0 left-[40%] w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-[100px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '4s' }} />
          </div>
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
              backgroundSize: '32px 32px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header text */}
          <div className="text-center max-w-3xl mx-auto">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl rounded-full text-sm text-emerald-400 mb-6 animate-fade-in fill-mode-both">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              {pagination.total > 0 ? (
                <span>{pagination.total} fresh crops available right now</span>
              ) : (
                <span>Farm-fresh produce daily</span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight animate-fade-in-up fill-mode-both">
              The Fresh{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  Marketplace
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6 C 50 2 150 2 198 6" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round" />
                  <defs><linearGradient id="underline-grad" x1="0" y1="0" x2="200" y2="0"><stop stopColor="#34d399" /><stop offset="1" stopColor="#2dd4bf" /></linearGradient></defs>
                </svg>
              </span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-gray-400/90 max-w-xl mx-auto leading-relaxed animate-fade-in-up fill-mode-both" style={{ animationDelay: '150ms' }}>
              Discover farm-fresh produce from verified farmers across India.
              <span className="text-emerald-400 font-medium"> Zero middlemen, maximum freshness.</span>
            </p>

            {/* Trust strip */}
            <div className="mt-6 flex items-center justify-center gap-5 sm:gap-8 text-gray-500 text-xs sm:text-sm animate-fade-in fill-mode-both" style={{ animationDelay: '300ms' }}>
              <span className="flex items-center gap-1.5"><FiCheckCircle size={14} className="text-emerald-400" /> Verified Farmers</span>
              <span className="flex items-center gap-1.5"><FiZap size={14} className="text-amber-400" /> 48hr Fresh Delivery</span>
              <span className="hidden sm:flex items-center gap-1.5"><FiShoppingBag size={14} className="text-blue-400" /> Secure Payments</span>
            </div>
          </div>

          {/* ─── Floating Search Bar ─── */}
          <div className="mt-10 max-w-3xl mx-auto animate-fade-in-up fill-mode-both" style={{ animationDelay: '200ms' }}>
            <div className="bg-white/[0.08] backdrop-blur-2xl rounded-2xl p-1.5 border border-white/[0.08] shadow-2xl shadow-black/30">
              <div className="flex flex-col sm:flex-row gap-1.5">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search for crops, vegetables, fruits..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.06] rounded-xl text-white placeholder:text-gray-500 outline-none focus:bg-white/[0.1] transition-all duration-300 border border-transparent focus:border-emerald-500/30 text-sm"
                    id="marketplace-search"
                  />
                </div>
                <div className="relative sm:w-44">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Location..."
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); resetPage(); }}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.06] rounded-xl text-white placeholder:text-gray-500 outline-none focus:bg-white/[0.1] transition-all duration-300 border border-transparent focus:border-emerald-500/30 text-sm"
                    id="marketplace-location"
                  />
                </div>
                <button
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3.5 px-7 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 hover:-translate-y-0.5 text-sm"
                  id="marketplace-search-btn"
                >
                  <FiSearch size={16} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom edge blend */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
      </section>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT AREA
         ══════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20 relative z-10">

        {/* ─── Category Navigation ─── */}
        <ScrollReveal>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-lg shadow-gray-200/50 dark:shadow-black/30 p-4 sm:p-5 mb-5" id="category-section">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.15em]">Shop by Category</h3>
              {/* View toggles */}
              <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  title="Grid view"
                  id="view-grid-btn"
                >
                  <FiGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                  title="List view"
                  id="view-list-btn"
                >
                  <FiList size={15} />
                </button>
              </div>
            </div>

            {/* Category pills — scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {CROP_CATEGORIES.map((cat) => {
                const IconComp = CATEGORY_ICONS[cat] || FiGrid;
                const isActive = category === cat;
                const gradient = CATEGORY_GRADIENTS[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); resetPage(); }}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? `bg-gradient-to-r ${gradient} text-white shadow-lg shadow-emerald-500/15 scale-[1.03]`
                        : 'bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/80 hover:text-gray-900 dark:hover:text-white hover:scale-[1.02]'
                    }`}
                    id={`category-${cat.toLowerCase()}`}
                  >
                    <span className="text-base">{CATEGORY_EMOJI[cat]}</span>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Filters Toolbar ─── */}
        <ScrollReveal delay={80}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-lg shadow-gray-200/50 dark:shadow-black/30 p-4 sm:p-5 mb-6" id="filters-section">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Sort dropdown */}
              <div className="relative w-full sm:w-52">
                <FiSliders className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
                  className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-700/80 focus:border-emerald-500 dark:focus:border-emerald-500 outline-none appearance-none cursor-pointer transition-colors duration-200"
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-300 whitespace-nowrap
                  ${showAdvanced
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20'
                    : 'bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700/80 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400'
                  }`}
                id="advanced-filters-btn"
              >
                <FiFilter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className={`rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold ${showAdvanced ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'}`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="flex-1" />

              {/* Results count */}
              {!loading && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Showing <span className="font-bold text-gray-900 dark:text-white">{crops.length}</span> of{' '}
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
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/80 focus:border-emerald-500 outline-none transition-colors duration-200 placeholder:text-gray-400"
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
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/80 focus:border-emerald-500 outline-none transition-colors duration-200 placeholder:text-gray-400"
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
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 dark:bg-gray-800/80 rounded-xl text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700/80 focus:border-emerald-500 outline-none transition-colors duration-200 placeholder:text-gray-400"
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

        {/* ══════════════════════════════════════════════════
            PRODUCTS GRID
           ══════════════════════════════════════════════════ */}
        {loading ? (
          <div className={`grid gap-5 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 overflow-hidden shadow-sm animate-pulse">
                <div className="h-52 bg-gray-100 dark:bg-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  <div className="flex justify-between">
                    <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    <div className="h-4 w-14 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                  </div>
                  <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : crops.length === 0 ? (
          <ScrollReveal>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/80 shadow-lg p-16 text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-5">
                <FiPackage size={36} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No crops found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto text-sm leading-relaxed">
                We couldn't find any crops matching your filters. Try adjusting your search criteria or clearing all filters.
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all duration-300 text-sm"
                  id="empty-clear-filters"
                >
                  <FiRefreshCw size={15} /> Clear All Filters
                </button>
              )}
            </div>
          </ScrollReveal>
        ) : (
          <>
            <div className={`grid gap-5 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 max-w-4xl mx-auto'
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
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold rounded-lg border border-emerald-200/60 dark:border-emerald-800/50 group hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-colors">
      {icon && <span className="text-emerald-500">{icon}</span>}
      {label}
      <button onClick={onRemove} className="hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors ml-0.5">
        <FiX size={11} />
      </button>
    </span>
  );
}
