import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiUser, FiPhone, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import farmLandscape from '../assets/farm-landscape.png';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', role: 'FARMER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to FarmConnect, ${user.name}!`);
      if (user.role === 'FARMER') navigate('/dashboard');
      else navigate('/marketplace');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen flex">
      {/* Left - Illustration side */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img src={farmLandscape} alt="Beautiful Indian farmland" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-emerald-950/80 to-gray-950/70" />

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px]" />
        </div>

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <GiWheat size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight">FarmConnect</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black leading-[1.1]">
            Join India&apos;s trusted
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              farm marketplace
            </span>
          </h2>
          <p className="mt-6 text-gray-300/80 text-lg max-w-md leading-relaxed">
            Create your account to start selling your crops or buying fresh produce directly from farmers.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { val: '500+', label: 'Active Farmers' },
              { val: '2,000+', label: 'Crops Listed' },
              { val: '10K+', label: 'Orders Done' },
              { val: '₹50L+', label: 'Revenue' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
                <p className="text-2xl font-black">{s.val}</p>
                <p className="text-sm text-emerald-300/80 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 bg-gray-50/50 dark:bg-gray-950 py-8">
        <div className="w-full max-w-md animate-fade-in-up fill-mode-both">
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <GiWheat className="text-white" size={22} />
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white">Farm<span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Connect</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Create your account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Get started in just a few minutes</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 px-5 py-4 rounded-2xl mb-6 text-sm border border-red-100 dark:border-red-900/50 animate-fade-in fill-mode-both flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 text-red-500">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl">
              {['FARMER', 'BUYER'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={`py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    form.role === role
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {role === 'FARMER' ? '🌾 Farmer' : '🛒 Buyer'}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className="input-field pl-12 py-3.5 rounded-2xl" placeholder="Your full name" value={form.name} onChange={set('name')} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input className="input-field pl-12 py-3.5 rounded-2xl" placeholder="10-digit mobile number" value={form.phone} onChange={set('phone')} required maxLength={10} pattern="[6-9][0-9]{9}" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="email" className="input-field pl-12 py-3.5 rounded-2xl" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="password" className="input-field pl-12 py-3.5 rounded-2xl" placeholder="Min 8 characters" value={form.password} onChange={set('password')} minLength={8} required />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl text-base">
              Create Account <FiArrowRight size={18} />
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
