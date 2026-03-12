import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import toast from 'react-hot-toast';

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
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80')" }}
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
            Welcome back to<br />the marketplace
          </h2>
          <p className="mt-4 text-emerald-100/80 text-lg max-w-md leading-relaxed">
            Sign in to manage your crops, track orders, and connect with buyers across India.
          </p>
          <div className="mt-10 space-y-4">
            {['Direct farmer-to-buyer marketplace', 'Secure Razorpay payments', 'Real-time order tracking'].map((item) => (
              <div key={item} className="flex items-center gap-3 text-emerald-100/80">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                {item}
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
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <GiWheat className="text-white" size={20} />
              </div>
              <span className="text-xl font-extrabold text-gray-900">Farm<span className="text-gradient">Connect</span></span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Sign in to your account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm border border-red-100 dark:border-red-900 animate-fade-in fill-mode-both">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" loading={loading} className="w-full py-3 flex items-center justify-center gap-2">
              Sign In <FiArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
