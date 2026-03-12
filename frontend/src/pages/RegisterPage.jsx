import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiUser, FiPhone, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';

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
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-green-800/75 to-teal-900/80" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <GiWheat size={22} />
            </div>
            <span className="text-xl font-extrabold">FarmConnect</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-tight">
            Join India&apos;s trusted<br />farm marketplace
          </h2>
          <p className="mt-4 text-emerald-100/80 text-lg max-w-md leading-relaxed">
            Create your account to start selling your crops or buying fresh produce directly from farmers.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { val: '500+', label: 'Active Farmers' },
              { val: '2,000+', label: 'Crops Listed' },
              { val: '10K+', label: 'Orders Done' },
              { val: '₹50L+', label: 'Revenue' },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-2xl font-extrabold">{s.val}</p>
                <p className="text-sm text-emerald-200">{s.label}</p>
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
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <GiWheat className="text-white" size={20} />
              </div>
              <span className="text-xl font-extrabold text-gray-900">Farm<span className="text-gradient">Connect</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Create your account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5">Get started in just a few minutes</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm border border-red-100 dark:border-red-900 animate-fade-in fill-mode-both">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              {['FARMER', 'BUYER'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ ...form, role })}
                  className={`py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    form.role === role
                      ? 'bg-white dark:bg-gray-700 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {role === 'FARMER' ? '🌾 Farmer' : '🛒 Buyer'}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input className="input-field pl-10" placeholder="Your full name" value={form.name} onChange={set('name')} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input className="input-field pl-10" placeholder="10-digit mobile number" value={form.phone} onChange={set('phone')} required maxLength={10} pattern="[6-9][0-9]{9}" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" className="input-field pl-10" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" className="input-field pl-10" placeholder="Min 8 characters" value={form.password} onChange={set('password')} minLength={8} required />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3 flex items-center justify-center gap-2">
              Create Account <FiArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
