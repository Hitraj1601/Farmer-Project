import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiMail, FiLock, FiArrowRight, FiShield, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import heroFarmer from '../assets/hero-farmer.png';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'FARMER') navigate('/dashboard');
      else navigate('/marketplace');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Illustration side */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img src={heroFarmer} alt="Indian farmer in green field" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-emerald-950/80 to-gray-950/70" />

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-teal-400/10 rounded-full blur-[100px]" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
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
            Welcome back to
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              the marketplace
            </span>
          </h2>
          <p className="mt-6 text-gray-300/80 text-lg max-w-md leading-relaxed">
            Sign in to manage your crops, track orders, and connect with buyers across India.
          </p>
          <div className="mt-10 space-y-5">
            {[
              { icon: FiCheckCircle, text: 'Direct farmer-to-buyer marketplace' },
              { icon: FiShield, text: 'Secure Razorpay payments' },
              { icon: FiTruck, text: 'Real-time order tracking' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-4 text-gray-300/80">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-emerald-400" />
                </div>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form side */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 bg-gray-50/50 dark:bg-gray-950">
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
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Sign in to your account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 px-5 py-4 rounded-2xl mb-6 text-sm border border-red-100 dark:border-red-900/50 animate-fade-in fill-mode-both flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 text-red-500">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-12 py-3.5 rounded-2xl"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-12 py-3.5 rounded-2xl"
                  required
                />
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl text-base">
              Sign In <FiArrowRight size={18} />
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
