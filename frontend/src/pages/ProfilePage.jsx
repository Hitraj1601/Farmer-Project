import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiMapPin, FiCreditCard, FiHash, FiBriefcase, FiHome, FiSave, FiAward, FiEdit3, FiX, FiCheckCircle, FiTruck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services';
import Button from '../components/Button';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
      setIsEditing(false); // Auto redirect back to read-only profile view
    } catch (err) {
      toast.error(err.message || 'Failed to save profile');
    }
    setSaving(false);
  };

  if (loading) return <Loader text="Loading profile..." />;

  const isFarmer = user?.role === 'FARMER';
  const isBuyer = user?.role === 'BUYER';

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
              {isFarmer ? '🌾' : user?.role === 'ADMIN' ? '⚙️' : '🛒'} {user?.role}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/50 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              <FiCheckCircle size={13} /> Verified
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

        {/* ─── Profile Details Section (View Mode vs Edit Form) ─── */}
        {user?.role !== 'ADMIN' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/40 dark:shadow-black/30 p-6 sm:p-8 animate-fade-in-up fill-mode-both delay-100">
            
            {/* Header / Mode Toggle Row */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-500/20 text-white">
                  {isFarmer ? <FiMapPin size={18} /> : <FiBriefcase size={18} />}
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white">
                    {isFarmer ? 'Farmer Details' : 'Business Details'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {isEditing ? 'Fill in your details below and save.' : 'View your saved profile information.'}
                  </p>
                </div>
              </div>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/50 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm"
                >
                  <FiEdit3 size={15} /> Edit Profile
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-semibold transition-all duration-200"
                >
                  <FiX size={14} /> Cancel
                </button>
              )}
            </div>

            {/* ─── READ-ONLY SUMMARY VIEW ─── */}
            {!isEditing ? (
              <div className="space-y-6">
                {isFarmer ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <FiMapPin className="text-emerald-500" size={13} /> Farm Location
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {farmerForm.farmLocation || <span className="text-gray-400 italic">Not set (click Edit to add)</span>}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <FiCreditCard className="text-emerald-500" size={13} /> Bank Account
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {farmerForm.bankAccount ? `•••• ${farmerForm.bankAccount.slice(-4)}` : <span className="text-gray-400 italic">Not set</span>}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <FiHash className="text-emerald-500" size={13} /> IFSC Code
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {farmerForm.ifscCode || <span className="text-gray-400 italic">Not set</span>}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <FiTruck className="text-emerald-500" size={13} /> Serviceable Areas
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {farmerForm.serviceableAreas || 'All areas (Everywhere)'}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <FiBriefcase className="text-emerald-500" size={13} /> Business Name
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {buyerForm.businessName || <span className="text-gray-400 italic">Not set (click Edit to add)</span>}
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <FiHome className="text-emerald-500" size={13} /> Business Address
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {buyerForm.businessAddress || <span className="text-gray-400 italic">Not set</span>}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/20 dark:to-teal-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/40">
                      <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FiTruck size={14} /> Saved Delivery Address
                      </p>
                      {addressForm.street ? (
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                          <p className="font-semibold text-gray-900 dark:text-white">{addressForm.street}</p>
                          {addressForm.landmark && <p className="text-xs text-gray-500">Landmark: {addressForm.landmark}</p>}
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mt-1">
                            {addressForm.city}, {addressForm.state} - {addressForm.pincode}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No delivery address set. Click "Edit Profile" to add your delivery address.</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* ─── EDITABLE FORM VIEW ─── */
              <div>
                {isFarmer ? (
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

                <div className="flex items-center gap-3 mt-8">
                  <Button onClick={handleSave} loading={saving} className="flex-1 py-3.5 flex items-center justify-center gap-2 rounded-2xl text-base">
                    <FiSave size={18} /> Save Profile
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-2xl text-sm transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

