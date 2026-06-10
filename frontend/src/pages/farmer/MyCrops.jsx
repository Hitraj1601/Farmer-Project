import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit, FiTrash2, FiPlus, FiPackage } from 'react-icons/fi';
import { cropService } from '../../services';
import { formatPrice, getImageUrl } from '../../utils/helpers';
import Loader from '../../components/Loader';
import Button from '../../components/Button';
import toast from 'react-hot-toast';

export default function MyCrops() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCrops = async () => {
    setLoading(true);
    try {
      const res = await cropService.getMyCrops();
      setCrops(res.data);
    } catch { setCrops([]); }
    setLoading(false);
  };

  useEffect(() => { fetchCrops(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return;
    try {
      await cropService.delete(id);
      setCrops(prev => prev.filter(c => c.id !== id));
      toast.success('Crop deleted successfully');
    } catch {
      toast.error('Failed to delete crop');
    }
  };

  if (loading) return <Loader text="Loading your crops..." />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 animate-fade-in-up fill-mode-both">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">My Crops</h1>
          <p className="text-gray-500 mt-1">{crops.length} crop{crops.length !== 1 ? 's' : ''} listed</p>
        </div>
        <Link to="/dashboard/add-crop">
          <Button className="flex items-center gap-2">
            <FiPlus size={16} /> Add New Crop
          </Button>
        </Link>
      </div>

      {crops.length === 0 ? (
        <div className="empty-state animate-fade-in-up fill-mode-both delay-100">
          <div className="icon-area">
            <FiPackage size={32} />
          </div>
          <h3>No crops listed yet</h3>
          <p>Add your first crop to start selling on the marketplace</p>
          <Link to="/dashboard/add-crop" className="btn-primary mt-4 inline-flex items-center gap-2">
            <FiPlus size={16} /> Add Your First Crop
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {crops.map((crop, i) => (
            <div key={crop.id} className={`group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all duration-200 animate-fade-in-up fill-mode-both delay-${Math.min(i * 100, 500)}`}>
              <img
                src={getImageUrl(crop.imageUrl)}
                alt={crop.cropName}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 ring-1 ring-gray-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{crop.cropName}</h3>
                  {crop.category && (
                    <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold rounded-md uppercase">{crop.category}</span>
                  )}
                  {crop.stockAlertThreshold > 0 && crop.quantity <= crop.stockAlertThreshold && (
                    <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-md uppercase flex items-center gap-1">
                      ⚠️ Low Stock
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{crop.location}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm font-bold text-emerald-600">{formatPrice(crop.pricePerKg)}/kg</span>
                  <span className="text-sm text-gray-400">·</span>
                  <span className="text-sm text-gray-500">{crop.quantity} kg available</span>
                  {crop.stockAlertThreshold > 0 && (
                    <span className="text-xs text-gray-400">Alert: ≤{crop.stockAlertThreshold} kg</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link to={`/dashboard/edit-crop/${crop.id}`}>
                  <button className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-600 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all">
                    <FiEdit size={15} />
                  </button>
                </Link>
                <button onClick={() => handleDelete(crop.id)} className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 flex items-center justify-center text-gray-500 dark:text-gray-400 transition-all">
                  <FiTrash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
