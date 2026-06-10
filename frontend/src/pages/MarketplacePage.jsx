import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiSearch, FiMapPin, FiPackage, FiFilter, FiX, FiUser,
  FiSliders, FiChevronDown, FiGrid, FiList, FiStar,
  FiTrendingUp, FiShoppingBag, FiArrowRight, FiRefreshCw
} from 'react-icons/fi';
import { GiWheat, GiFruitBowl, GiFarmer } from 'react-icons/gi';
import { cropService } from '../services';
import { CROP_CATEGORIES } from '../utils/constants';
import CropCard from '../components/CropCard';
import Pagination from '../components/Pagination';
import { SkeletonCard } from '../components/Loader';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'quantityDesc', label: 'Most Available' },
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
  Others: FiGrid,
};

const CATEGORY_COLORS = {
  All: 'from-gray-500 to-gray-600',
  Grains: 'from-amber-500 to-yellow-600',
  Vegetables: 'from-emerald-500 to-green-600',
  Fruits: 'from-red-500 to-rose-600',
  Spices: 'from-orange-500 to-amber-600',
  Pulses: 'from-violet-500 to-purple-600',
  Oilseeds: 'from-teal-500 to-cyan-600',
  Dairy: 'from-blue-500 to-indigo-600',
  Others: 'from-slate-500 to-gray-600',
};

/* ─── Scroll-reveal hook ─── */
function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
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
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
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
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

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
        const params = { page, limit: 12 };
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

  // Count active filters
  const activeFilterCount = [
    search, location, category !== 'All' ? category : '',
    sortBy !== 'newest' ? sortBy : '',
    minPrice, maxPrice, farmerName,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 pt-8 pb-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-amber-500/5 blur-[80px]" />
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl rounded-full text-sm text-emerald-400 mb-6 animate-fade-in fill-mode-both">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              {pagination.total > 0 ? `${pagination.total} fresh crops available` : 'Fresh produce daily'}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight animate-fade-in-up fill-mode-both">
              Fresh{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Marketplace
              </span>
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed animate-fade-in-up fill-mode-both delay-200">
              Discover farm-fresh produce from verified local farmers across India. Zero middlemen, maximum freshness.
            </p>
          </div>

          {/* ─── Search Bar (floating) ─── */}
          <div className="mt-10 max-w-4xl mx-auto animate-fade-in-up fill-mode-both delay-300">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-2 border border-white/10 shadow-2xl shadow-black/20">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search crops, vegetables, fruits..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 rounded-2xl text-white placeholder:text-gray-500 outline-none focus:bg-white/15 transition-colors border border-transparent focus:border-emerald-500/30"
                  />
                </div>
                <div className="relative sm:w-52">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Location..."
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); resetPage(); }}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 rounded-2xl text-white placeholder:text-gray-500 outline-none focus:bg-white/15 transition-colors border border-transparent focus:border-emerald-500/30"
                  />
                </div>
                <button
                  onClick={() => {}}
                  className="bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-4 px-8 rounded-2xl hover:from-emerald-400 hover:to-green-400 transition-all duration-300 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                >
                  <FiSearch size={18} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 30 C 360 60 1080 0 1440 30 L 1440 60 L 0 60 Z" className="fill-gray-50 dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* ─── Main Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-16 relative z-10">

        {/* ─── Category Pills with Icons ─── */}
        <ScrollReveal>
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Categories</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  title="Grid view"
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  title="List view"
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {CROP_CATEGORIES.map((cat) => {
                const IconComp = CATEGORY_ICONS[cat] || FiGrid;
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); resetPage(); }}
                    className={`group flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-[1.02]'
                    }`}
                  >
                    <IconComp size={16} className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors'} />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ─── Filters Toolbar ─── */}
        <ScrollReveal delay={100}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              {/* Sort dropdown */}
              <div className="relative w-full sm:w-56">
                <FiSliders className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
                  className="input-field pl-11 pr-10 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
              </div>

              {/* Toggle advanced */}
              <button
                onClick={() => setShowAdvanced(v => !v)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-semibold transition-all duration-300 whitespace-nowrap
                  ${showAdvanced
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white border-transparent shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600'
                  }`}
              >
                <FiFilter size={15} />
                Advanced Filters
                {activeFilterCount > 0 && (
                  <span className={`rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold ${showAdvanced ? 'bg-white text-emerald-600' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'}`}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Results count */}
              {!loading && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    <span className="font-bold text-gray-900 dark:text-white">{pagination.total}</span> crop{pagination.total !== 1 ? 's' : ''} found
                  </span>
                </div>
              )}
            </div>

            {/* Advanced filters (collapsible) */}
            <div
              className={`grid transition-all duration-500 ease-in-out ${
                showAdvanced ? 'grid-rows-[1fr] opacity-100 mt-5' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="pt-5 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Min Price (₹/kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); resetPage(); }}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Max Price (₹/kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); resetPage(); }}
                      className="input-field"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Farmer Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input
                        type="text"
                        placeholder="Search by farmer..."
                        value={farmerName}
                        onChange={(e) => { setFarmerName(e.target.value); resetPage(); }}
                        className="input-field pl-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active filter chips + Clear All */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-fade-in">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider mr-1">Active:</span>
                {search && <Chip label={`"${search}"`} icon={<FiSearch size={11} />} onRemove={() => setSearch('')} />}
                {location && <Chip label={location} icon={<FiMapPin size={11} />} onRemove={() => setLocation('')} />}
                {category !== 'All' && <Chip label={category} icon={<FiGrid size={11} />} onRemove={() => setCategory('All')} />}
                {sortBy !== 'newest' && <Chip label={SORT_OPTIONS.find(s => s.value === sortBy)?.label} icon={<FiSliders size={11} />} onRemove={() => setSortBy('newest')} />}
                {minPrice && <Chip label={`Min ₹${minPrice}`} onRemove={() => setMinPrice('')} />}
                {maxPrice && <Chip label={`Max ₹${maxPrice}`} onRemove={() => setMaxPrice('')} />}
                {farmerName && <Chip label={farmerName} icon={<FiUser size={11} />} onRemove={() => setFarmerName('')} />}
                <button
                  onClick={clearAllFilters}
                  className="ml-auto text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <FiRefreshCw size={12} /> Clear All
                </button>
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* ─── Results Grid ─── */}
        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : crops.length === 0 ? (
          <ScrollReveal>
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-16 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl flex items-center justify-center mb-6">
                <FiPackage size={40} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No crops found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                We couldn't find any crops matching your filters. Try adjusting your search criteria.
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  <FiRefreshCw size={16} /> Clear All Filters
                </button>
              )}
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={150}>
            <div className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}>
              {crops.map((crop, index) => (
                <CropCard key={crop.id} crop={crop} index={index} viewMode={viewMode} />
              ))}
            </div>
            <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}

/* ─── Filter Chip Component ─── */
function Chip({ label, icon, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 group">
      {icon && <span className="text-emerald-500 dark:text-emerald-500">{icon}</span>}
      {label}
      <button onClick={onRemove} className="hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors ml-0.5">
        <FiX size={12} />
      </button>
    </span>
  );
}
