import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiMail, FiLock, FiArrowRight, FiCheckCircle, FiShield, FiKey } from 'react-icons/fi';
import { authService } from '../services';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import heroFarmer from '../assets/hero-farmer.png';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = request, 2 = reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      toast.success(res.message || 'Verification code sent! (Check backend console)');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Verify password strength
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword({ email, code, newPassword });
      toast.success(res.message || 'Password reset successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left - Illustration side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
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

        <div className="relative flex flex-col justify-center px-8 xl:px-16 text-white">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <GiWheat size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight">FarmConnect</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black leading-[1.1]">
            Reset your password
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              securely and fast
            </span>
          </h2>
          <p className="mt-6 text-gray-300/80 text-lg max-w-md leading-relaxed">
            Follow the steps to recover your access and verify your account.
          </p>
        </div>
      </div>

      {/* Right - Form side */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-gray-50/50 dark:bg-gray-950">
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
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Forgot Password?</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {step === 1 
                ? "Enter your email address to receive a password reset code." 
                : "Enter the verification code printed on server console and choose a strong password."
              }
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 px-5 py-4 rounded-2xl mb-6 text-sm border border-red-100 dark:border-red-900/50 animate-fade-in fill-mode-both flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 text-red-500">!</span>
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-12 py-3.5 rounded-2xl"
                    required
                  />
                </div>
              </div>
              <Button type="submit" loading={loading} className="w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl text-base">
                Send Reset Code <FiArrowRight size={18} />
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Verification Code</label>
                <div className="relative">
                  <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="6-digit reset code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input-field pl-12 py-3.5 rounded-2xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    placeholder="Min 8 chars, 1 uppercase, 1 symbol"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pl-12 py-3.5 rounded-2xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pl-12 py-3.5 rounded-2xl"
                    required
                  />
                </div>
              </div>
              <Button type="submit" loading={loading} className="w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl text-base">
                Reset Password <FiArrowRight size={18} />
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Remembered your password?{' '}
            <Link to="/login" className="text-emerald-600 dark:text-emerald-400 font-bold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
