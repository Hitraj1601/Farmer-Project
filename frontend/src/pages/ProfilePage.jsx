import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCreditCard, FiHash, FiBriefcase, FiHome, FiSave, FiShield, FiAward } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services';
import Button from '../components/Button';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [farmerForm, setFarmerForm] = useState({ farmLocation: '', bankAccount: '', ifscCode: '', serviceableAreas: '' });
  const [buyerForm, setBuyerForm] = useState({ businessName: '', businessAddress: '' });
  const [addressForm, setAddressForm] = useState({ street: '', landmark: '', city: '', state: '', pincode: '' });

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'FARMER') {
          const res = await profileService.getFarmerProfile();
          if (res.data) setFarmerForm({ farmLocation: res.data.farmLocation || '', bankAccount: res.data.bankAccount || '', ifscCode: res.data.ifscCode || '', serviceableAreas: res.data.serviceableAreas || '' });
        } else if (user?.role === 'BUYER') {
          const res = await profileService.getBuyerProfile();
          if (res.data) {
            setBuyerForm({ businessName: res.data.businessName || '', businessAddress: res.data.businessAddress || '' });
            
            const rawAddress = res.data.deliveryAddress || '';
            let parsedAddress = { street: '', landmark: '', city: '', state: '', pincode: '' };
            try {
              const parsed = JSON.parse(rawAddress);
              if (parsed && typeof parsed === 'object') {
                parsedAddress = {
                  street: parsed.street || '',
                  landmark: parsed.landmark || '',
                  city: parsed.city || '',
                  state: parsed.state || '',
                  pincode: parsed.pincode || '',
                };
              } else {
                parsedAddress.street = rawAddress;
              }
            } catch {
              parsedAddress.street = rawAddress;
            }
            setAddressForm(parsedAddress);
          }
        }
      } catch { /* no profile yet */ }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.role === 'FARMER') {
        await profileService.upsertFarmerProfile(farmerForm);
      } else {
        if (!addressForm.street.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.pincode.trim()) {
          toast.error('Flat/Street, City, State, and Pincode are required fields.');
          setSaving(false);
          return;
        }
        const payload = {
          ...buyerForm,
          deliveryAddress: JSON.stringify({
            street: addressForm.street.trim(),
            landmark: addressForm.landmark.trim(),
            city: addressForm.city.trim(),
            state: addressForm.state.trim(),
            pincode: addressForm.pincode.trim(),
          }),
        };
        await profileService.upsertBuyerProfile(payload);
      }
      
      // Update local storage and React auth state context
      await refreshProfile();
      toast.success('Profile saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    }
    setSaving(false);
  };

  if (loading) return <Loader text="Loading profile..." />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ─── Enterprise Header ─── */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-6 mb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-black shadow-md shadow-emerald-500/10">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {user?.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your profile details and settings.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-700 dark:text-gray-300 font-semibold shadow-sm">
              {user?.role === 'FARMER' ? '🌾' : user?.role === 'ADMIN' ? '⚙️' : '🛒'} {user?.role}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/50 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              Verified
            </span>
          </div>
        </div>
      </header>

      {/* ─── Content Area ─── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* User Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 overflow-hidden mb-6 animate-fade-in-up fill-mode-both">
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-800">
            <div className="px-6 py-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                <FiMail className="text-emerald-500" size={18} />
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
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                <FiAward className="text-emerald-500" size={18} />
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
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/20`}>
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
                {/* Serviceable Areas */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <FiHome className="text-emerald-600" size={18} />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Delivery Service Areas</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    List the cities or states where you can deliver. Buyers outside these areas will see a warning. Leave empty to accept orders from everywhere.
                  </p>
                  <textarea
                    className="input-field py-3.5 rounded-2xl min-h-[80px] resize-none"
                    placeholder="e.g. Mumbai, Pune, Nashik, Maharashtra"
                    value={farmerForm.serviceableAreas}
                    onChange={(e) => setFarmerForm({ ...farmerForm, serviceableAreas: e.target.value })}
                  />
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
                <div className="space-y-4">
                  <span className="block text-sm font-bold text-gray-700 dark:text-gray-300">Delivery Address</span>
                  
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Flat, House No., Building, Street *</label>
                    <div className="relative">
                      <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        className="input-field pl-11 py-3.5 rounded-2xl text-sm"
                        placeholder="e.g. Flat 101, building name, street name"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Landmark (Optional)</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          className="input-field pl-11 py-3.5 rounded-2xl text-sm"
                          placeholder="e.g. Near bus stop"
                          value={addressForm.landmark}
                          onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Pincode *</label>
                      <div className="relative">
                        <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          className="input-field pl-11 py-3.5 rounded-2xl text-sm"
                          placeholder="e.g. 400001"
                          value={addressForm.pincode}
                          onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">City *</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          className="input-field pl-11 py-3.5 rounded-2xl text-sm"
                          placeholder="e.g. Mumbai"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">State *</label>
                      <div className="relative">
                        <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="text"
                          className="input-field pl-11 py-3.5 rounded-2xl text-sm"
                          placeholder="e.g. Maharashtra"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Farmers will see this address before accepting the order.</p>
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
