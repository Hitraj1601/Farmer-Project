import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiHash, FiBriefcase, FiHome, FiSave, FiShield, FiAward } from 'react-icons/fi';
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
    <div className="min-h-screen">
      {/* ─── Hero Banner ─── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 pt-8 pb-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-violet-500/30 border-4 border-white/10 animate-fade-in fill-mode-both">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="text-center sm:text-left animate-fade-in-up fill-mode-both">
              <h1 className="text-3xl sm:text-4xl font-black text-white">{user?.name}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/10 backdrop-blur-xl rounded-full text-sm text-white/90 font-semibold">
                  {user?.role === 'FARMER' ? '🌾' : user?.role === 'ADMIN' ? '⚙️' : '🛒'} {user?.role}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400 font-semibold">
                  <FiShield size={12} /> Verified
                </span>
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

      {/* ─── Content ─── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-16 relative z-10">

        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 overflow-hidden mb-6 animate-fade-in-up fill-mode-both">
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
            <div className="px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <FiMail className="text-blue-500" size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.email}</p>
              </div>
            </div>
            <div className="px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                <FiPhone className="text-emerald-500" size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.phone || 'Not set'}</p>
              </div>
            </div>
            <div className="px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
                <FiAward className="text-violet-500" size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.role}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        {user?.role !== 'ADMIN' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-8 animate-fade-in-up fill-mode-both delay-100">
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                user?.role === 'FARMER'
                  ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-emerald-500/20'
                  : 'bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/20'
              }`}>
                {user?.role === 'FARMER' ? <FiMapPin className="text-white" size={18} /> : <FiBriefcase className="text-white" size={18} />}
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                {user?.role === 'FARMER' ? 'Farmer Details' : 'Business Details'}
              </h2>
            </div>

            {user?.role === 'FARMER' ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Farm Location</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input className="input-field pl-12 py-3.5 rounded-2xl" placeholder="Village, District, State" value={farmerForm.farmLocation} onChange={(e) => setFarmerForm({ ...farmerForm, farmLocation: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Bank Account Number</label>
                  <div className="relative">
                    <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input className="input-field pl-12 py-3.5 rounded-2xl" placeholder="Your bank account number" value={farmerForm.bankAccount} onChange={(e) => setFarmerForm({ ...farmerForm, bankAccount: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">IFSC Code</label>
                  <div className="relative">
                    <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input className="input-field pl-12 py-3.5 rounded-2xl" placeholder="e.g. SBIN0001234" value={farmerForm.ifscCode} onChange={(e) => setFarmerForm({ ...farmerForm, ifscCode: e.target.value.toUpperCase() })} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Business Name</label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input className="input-field pl-12 py-3.5 rounded-2xl" placeholder="Your business name" value={buyerForm.businessName} onChange={(e) => setBuyerForm({ ...buyerForm, businessName: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Business Address</label>
                  <div className="relative">
                    <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input className="input-field pl-12 py-3.5 rounded-2xl" placeholder="Your business address" value={buyerForm.businessAddress} onChange={(e) => setBuyerForm({ ...buyerForm, businessAddress: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            <Button onClick={handleSave} loading={saving} className="w-full mt-8 py-3.5 flex items-center justify-center gap-2 rounded-2xl text-base">
              <FiSave size={18} /> Save Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
