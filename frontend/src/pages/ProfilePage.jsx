import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiHash, FiBriefcase, FiHome, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services';
import Button from '../components/Button';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [farmerForm, setFarmerForm] = useState({ farmLocation: '', bankAccount: '', ifscCode: '' });
  const [buyerForm, setBuyerForm] = useState({ businessName: '', businessAddress: '' });

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'FARMER') {
          const res = await profileService.getFarmerProfile();
          if (res.data) setFarmerForm({ farmLocation: res.data.farmLocation || '', bankAccount: res.data.bankAccount || '', ifscCode: res.data.ifscCode || '' });
        } else if (user?.role === 'BUYER') {
          const res = await profileService.getBuyerProfile();
          if (res.data) setBuyerForm({ businessName: res.data.businessName || '', businessAddress: res.data.businessAddress || '' });
        }
      } catch { /* no profile yet */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.role === 'FARMER') await profileService.upsertFarmerProfile(farmerForm);
      else await profileService.upsertBuyerProfile(buyerForm);
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    }
    setSaving(false);
  };

  if (loading) return <Loader text="Loading profile..." />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in-up fill-mode-both">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account settings</p>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-6 animate-fade-in-up fill-mode-both delay-100">
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-8 py-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white mt-2">
                {user?.role === 'FARMER' ? '🌾' : user?.role === 'ADMIN' ? '⚙️' : '🛒'} {user?.role}
              </span>
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
          <div className="px-6 py-4 flex items-center gap-3">
            <FiMail className="text-gray-400" size={16} />
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center gap-3">
            <FiPhone className="text-gray-400" size={16} />
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Phone</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.phone || 'Not set'}</p>
            </div>
          </div>
          <div className="px-6 py-4 flex items-center gap-3">
            <FiUser className="text-gray-400" size={16} />
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Role</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      {user?.role !== 'ADMIN' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 animate-fade-in-up fill-mode-both delay-200">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            {user?.role === 'FARMER' ? '🌾 Farmer Details' : '🏢 Business Details'}
          </h2>

          {user?.role === 'FARMER' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Farm Location</label>
                <div className="relative">
                  <FiMapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input className="input-field pl-10" placeholder="Village, District, State" value={farmerForm.farmLocation} onChange={(e) => setFarmerForm({ ...farmerForm, farmLocation: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Bank Account Number</label>
                <div className="relative">
                  <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input className="input-field pl-10" placeholder="Your bank account number" value={farmerForm.bankAccount} onChange={(e) => setFarmerForm({ ...farmerForm, bankAccount: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">IFSC Code</label>
                <div className="relative">
                  <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input className="input-field pl-10" placeholder="e.g. SBIN0001234" value={farmerForm.ifscCode} onChange={(e) => setFarmerForm({ ...farmerForm, ifscCode: e.target.value.toUpperCase() })} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Business Name</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input className="input-field pl-10" placeholder="Your business name" value={buyerForm.businessName} onChange={(e) => setBuyerForm({ ...buyerForm, businessName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Business Address</label>
                <div className="relative">
                  <FiHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input className="input-field pl-10" placeholder="Your business address" value={buyerForm.businessAddress} onChange={(e) => setBuyerForm({ ...buyerForm, businessAddress: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleSave} loading={saving} className="w-full mt-8 py-3 flex items-center justify-center gap-2">
            <FiSave size={16} /> Save Profile
          </Button>
        </div>
      )}
    </div>
  );
}
