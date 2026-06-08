import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiMapPin, FiPackage, FiFilter, FiX, FiUser, FiSliders, FiChevronDown } from 'react-icons/fi';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Marketplace</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Browse fresh produce directly from local farmers</p>
      </div>

      {/* Search & Filters Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 sm:p-5 mb-8 animate-fade-in-up fill-mode-both delay-100">

        {/* Row 1: Search + Location + Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search crops..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="input-field pl-10"
            />
          </div>
          <div className="relative w-full sm:w-48">
            <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Location..."
              value={location}
              onChange={(e) => { setLocation(e.target.value); resetPage(); }}
              className="input-field pl-10"
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative w-full sm:w-52">
            <FiSliders className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); resetPage(); }}
              className="input-field pl-10 pr-8 appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
          </div>

          {/* Toggle advanced filters */}
          <button
            onClick={() => setShowAdvanced(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 whitespace-nowrap
              ${showAdvanced
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400'
              }`}
          >
            <FiFilter size={15} />
            Filters {activeFilterCount > 0 && <span className="bg-white text-emerald-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{activeFilterCount}</span>}
          </button>
        </div>

        {/* Advanced filters (collapsible) */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in-up fill-mode-both">
            {/* Min price */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Min Price (Rs./kg)</label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); resetPage(); }}
                className="input-field"
                min="0"
              />
            </div>
            {/* Max price */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Max Price (Rs./kg)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); resetPage(); }}
                className="input-field"
                min="0"
              />
            </div>
            {/* Farmer name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">Farmer Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Search by farmer..."
                  value={farmerName}
                  onChange={(e) => { setFarmerName(e.target.value); resetPage(); }}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>
        )}

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {CROP_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); resetPage(); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                category === cat
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active filter chips + Clear All */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 font-medium">Active filters:</span>
            {search && <Chip label={`Search: "${search}"`} onRemove={() => setSearch('')} />}
            {location && <Chip label={`Location: ${location}`} onRemove={() => setLocation('')} />}
            {category !== 'All' && <Chip label={`Category: ${category}`} onRemove={() => setCategory('All')} />}
            {sortBy !== 'newest' && <Chip label={`Sort: ${SORT_OPTIONS.find(s => s.value === sortBy)?.label}`} onRemove={() => setSortBy('newest')} />}
            {minPrice && <Chip label={`Min: Rs.${minPrice}`} onRemove={() => setMinPrice('')} />}
            {maxPrice && <Chip label={`Max: Rs.${maxPrice}`} onRemove={() => setMaxPrice('')} />}
            {farmerName && <Chip label={`Farmer: ${farmerName}`} onRemove={() => setFarmerName('')} />}
            <button
              onClick={clearAllFilters}
              className="ml-auto text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
            >
              <FiX size={12} /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : crops.length === 0 ? (
        <div className="empty-state">
          <div className="icon-area">
            <FiPackage size={32} />
          </div>
          <h3>No crops found</h3>
          <p>Try adjusting your search or filter criteria</p>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="btn-primary mt-4 inline-flex items-center gap-2">
              <FiX size={14} /> Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {pagination.total} crop{pagination.total !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {crops.map((crop, index) => (
              <CropCard key={crop.id} crop={crop} index={index} />
            ))}
          </div>
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

// Small filter chip component
function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors">
        <FiX size={11} />
      </button>
    </span>
  );
}
