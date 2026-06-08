import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiUploadCloud, FiImage, FiTarget } from 'react-icons/fi';
import { cropService, analyticsService } from '../../services';
import { CROP_CATEGORIES } from '../../utils/constants';
import { formatPrice } from '../../utils/helpers';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import toast from 'react-hot-toast';

export default function CropForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [priceSuggestion, setPriceSuggestion] = useState(null);
  const [fetchingSuggestion, setFetchingSuggestion] = useState(false);
  const [form, setForm] = useState({
    cropName: '',
    quantity: '',
    pricePerKg: '',
    location: '',
    category: CROP_CATEGORIES[1] || 'Vegetables',
    stockAlertThreshold: '',
  });

  useEffect(() => {
    if (!isEdit) return;
    const fetchCrop = async () => {
      try {
        const res = await cropService.getById(id);
        const c = res.data;
        setForm({ cropName: c.cropName, quantity: c.quantity, pricePerKg: c.pricePerKg, location: c.location, category: c.category || CROP_CATEGORIES[1], stockAlertThreshold: c.stockAlertThreshold ?? '' });
      } catch {
        setError('Crop not found');
      }
      setLoading(false);
    };
    fetchCrop();
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const formData = new FormData();
    formData.append('cropName', form.cropName);
    formData.append('quantity', form.quantity);
    formData.append('pricePerKg', form.pricePerKg);
    formData.append('location', form.location);
    if (form.category) formData.append('category', form.category);
    if (form.stockAlertThreshold !== '') formData.append('stockAlertThreshold', form.stockAlertThreshold);
    if (image) formData.append('image', image);

    try {
      if (isEdit) {
        await cropService.update(id, formData);
        toast.success('Crop updated successfully!');
      } else {
        await cropService.create(formData);
        toast.success('Crop added successfully!');
      }
      navigate('/dashboard/my-crops');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
    setSubmitting(false);
  };

  const fetchPriceSuggestion = async () => {
    if (!form.cropName.trim()) return;
    setFetchingSuggestion(true);
    try {
      const res = await analyticsService.getSuggestedPrice({
        cropName: form.cropName,
        category: form.category,
        location: form.location,
      });
      setPriceSuggestion(res.data);
    } catch (err) {
      setPriceSuggestion(null);
      toast.error(err.message || 'No price data available. Add some crops first!');
    }
    setFetchingSuggestion(false);
  };

  const applySuggestedPrice = () => {
    if (priceSuggestion?.suggestedPrice) {
      setForm({ ...form, pricePerKg: priceSuggestion.suggestedPrice });
    }
  };

  if (loading) return <Loader text="Loading crop details..." />;

  // Filter out "All" from categories
  const categories = CROP_CATEGORIES.filter(c => c !== 'All');

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{isEdit ? 'Edit Crop' : 'Add New Crop'}</h1>
        <p className="text-gray-500 mt-1">{isEdit ? 'Update your crop details' : 'List a new crop on the marketplace'}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm border border-red-100 dark:border-red-900 animate-fade-in fill-mode-both">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sm:p-8 space-y-6 animate-fade-in-up fill-mode-both delay-100">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Crop Name</label>
          <input name="cropName" className="input-field" placeholder="e.g. Organic Tomatoes" value={form.cropName} onChange={handleChange} required />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setForm({ ...form, category: cat })}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  form.category === cat
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Quantity (kg)</label>
            <input name="quantity" type="number" className="input-field" placeholder="e.g. 100" value={form.quantity} onChange={handleChange} required min="1" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price per kg (₹)</label>
            <input name="pricePerKg" type="number" className="input-field" placeholder="e.g. 50" value={form.pricePerKg} onChange={handleChange} required min="1" />
          </div>
        </div>

        {/* Smart Price Suggestion */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FiTarget className="text-emerald-600" size={18} />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Smart Price Suggestion</span>
            </div>
            <button
              type="button"
              onClick={fetchPriceSuggestion}
              disabled={fetchingSuggestion || !form.cropName.trim()}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {fetchingSuggestion ? 'Analyzing...' : 'Get Suggestion'}
            </button>
          </div>
          {priceSuggestion ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Suggested Price</p>
                  <p className="text-lg font-bold text-emerald-600">{formatPrice(priceSuggestion.suggestedPrice)}/kg</p>
                </div>
                <button type="button" onClick={applySuggestedPrice} className="px-3 py-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                  Apply
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Market Avg</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{formatPrice(priceSuggestion.marketAverage)}</p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Trend</p>
                  <p className={`text-xs font-bold ${priceSuggestion.trendFactor >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {priceSuggestion.trendFactor >= 0 ? '↑' : '↓'} {Math.abs(priceSuggestion.trendFactor || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Demand</p>
                  <p className={`text-xs font-bold ${(priceSuggestion.demandFactor || 0) >= 0 ? 'text-emerald-600' : 'text-orange-500'}`}>
                    {(priceSuggestion.demandFactor || 0) >= 0 ? 'High' : 'Low'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 dark:text-gray-400">Enter a crop name and click "Get Suggestion" to see AI-powered pricing recommendations.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
          <input name="location" className="input-field" placeholder="City, State" value={form.location} onChange={handleChange} required />
        </div>

        {/* Stock Alert Threshold */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-800/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-600" role="img" aria-label="bell">🔔</span>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Low Stock Alert Threshold</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Get notified on your dashboard when remaining stock falls to or below this quantity. Set to 0 to disable.
          </p>
          <input
            name="stockAlertThreshold"
            type="number"
            className="input-field"
            placeholder="e.g. 20 (alert when ≤ 20 kg remaining)"
            value={form.stockAlertThreshold}
            onChange={handleChange}
            min="0"
          />
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Crop Image</label>
          <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 rounded-2xl p-8 cursor-pointer transition-colors group">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                  <FiUploadCloud className="text-emerald-600" size={24} />
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
              </>
            )}
            <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
          </label>
        </div>

        <Button type="submit" loading={submitting} className="w-full py-3">
          {submitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update Crop' : 'Add Crop')}
        </Button>
      </form>
    </div>
  );
}
