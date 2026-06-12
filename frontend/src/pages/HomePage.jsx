import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { GiWheat, GiFarmer, GiReceiveMoney, GiFruitBowl, GiCorn } from 'react-icons/gi';
import {
  FiShield, FiTruck, FiUsers, FiArrowRight, FiStar,
  FiCheckCircle, FiHeart, FiZap, FiGlobe, FiAward,
  FiTrendingUp, FiPackage, FiSun, FiDroplet, FiMapPin, FiPlay
} from 'react-icons/fi';

import heroFarmer from '../assets/hero-farmer.png';
import freshVegetables from '../assets/fresh-vegetables.png';
import farmLandscape from '../assets/farm-landscape.png';

/* ─── Animated Counter Hook ─── */
function useCountUp(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

/* ─── Intersection Observer for scroll reveal ─── */
function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

/* ─── Data ─── */
const stats = [
  { label: 'Active Farmers', value: 500, suffix: '+', icon: GiFarmer, gradient: 'from-emerald-400 to-green-500' },
  { label: 'Crops Listed', value: 2000, suffix: '+', icon: GiWheat, gradient: 'from-amber-400 to-orange-500' },
  { label: 'Orders Delivered', value: 10000, suffix: '+', icon: FiPackage, gradient: 'from-blue-400 to-indigo-500' },
  { label: 'Revenue Generated', value: 50, suffix: 'L+', prefix: '₹', icon: GiReceiveMoney, gradient: 'from-violet-400 to-purple-500' },
];

const features = [
  {
    icon: FiUsers, title: 'Direct from Farmers',
    desc: 'Buy directly from verified farmers with zero middlemen. Honest pricing, complete transparency, and real human connection.',
    gradient: 'from-emerald-500 to-teal-600', glow: 'emerald'
  },
  {
    icon: FiShield, title: 'Secure Payments',
    desc: 'Razorpay-powered transactions with buyer protection. Pay safely using UPI, cards, or net banking — every rupee tracked.',
    gradient: 'from-blue-500 to-indigo-600', glow: 'blue'
  },
  {
    icon: FiTruck, title: 'Farm to Doorstep',
    desc: 'Real-time GPS tracking from harvest to your kitchen. Fresh produce guaranteed within 48 hours of picking.',
    gradient: 'from-violet-500 to-purple-600', glow: 'violet'
  },
  {
    icon: FiTrendingUp, title: 'Smart Pricing',
    desc: 'AI-powered price suggestions based on market trends. Farmers earn more, buyers pay fair — everyone wins.',
    gradient: 'from-amber-500 to-orange-600', glow: 'amber'
  },
  {
    icon: FiGlobe, title: 'Pan-India Network',
    desc: 'Access farmers from 28+ states. From Kashmir apples to Kerala spices, discover India\'s agricultural diversity.',
    gradient: 'from-rose-500 to-pink-600', glow: 'rose'
  },
  {
    icon: FiAward, title: 'Quality Verified',
    desc: 'Every farmer is verified. Every crop quality-checked. Organic certifications tracked and displayed transparently.',
    gradient: 'from-cyan-500 to-blue-600', glow: 'cyan'
  },
];

const steps = [
  {
    num: '01', title: 'Browse & Discover',
    desc: 'Explore thousands of fresh crops from verified local farmers across India. Filter by organic, region, or season.',
    icon: FiSun, color: 'emerald'
  },
  {
    num: '02', title: 'Order Securely',
    desc: 'Choose your quantity, pay securely with Razorpay, and confirm your order in under 60 seconds.',
    icon: FiZap, color: 'blue'
  },
  {
    num: '03', title: 'Fresh Delivery',
    desc: 'Track your order in real-time as it travels from farm to your doorstep. Always fresh, always on time.',
    icon: FiTruck, color: 'violet'
  },
];

const testimonials = [
  {
    name: 'Rajesh Patel', role: 'Organic Farmer, Gujarat',
    text: 'FarmConnect transformed my business. I now reach buyers in 12 cities directly. My income has more than doubled in just 6 months!',
    rating: 5, avatar: 'R'
  },
  {
    name: 'Priya Sharma', role: 'Home Chef, Delhi',
    text: 'The freshest vegetables I\'ve ever bought online. The quality is outstanding and knowing exactly which farm it comes from gives me real peace of mind.',
    rating: 5, avatar: 'P'
  },
  {
    name: 'Amit Kumar', role: 'Farmer, Bihar',
    text: 'Simple platform, easy to list crops. Payments are always on time and the analytics dashboard helps me plan my seasons better.',
    rating: 5, avatar: 'A'
  },
  {
    name: 'Sneha Reddy', role: 'Restaurant Owner, Hyderabad',
    text: 'Bulk ordering from local farmers has cut our costs by 30%. The quality is consistently excellent, and delivery is always on time.',
    rating: 5, avatar: 'S'
  },
];

const categories = [
  { name: 'Vegetables', icon: GiFruitBowl, count: '800+', color: 'from-green-400 to-emerald-500' },
  { name: 'Grains', icon: GiWheat, count: '400+', color: 'from-amber-400 to-yellow-500' },
  { name: 'Fruits', icon: GiCorn, count: '350+', color: 'from-red-400 to-rose-500' },
  { name: 'Spices', icon: FiSun, count: '200+', color: 'from-orange-400 to-red-500' },
  { name: 'Organic', icon: FiDroplet, count: '600+', color: 'from-teal-400 to-cyan-500' },
  { name: 'Regional', icon: FiMapPin, count: '150+', color: 'from-purple-400 to-violet-500' },
];

/* ─── Components ─── */
function StatCard({ stat, index }) {
  const [count, ref] = useCountUp(stat.value, 2500);
  return (
    <div
      ref={ref}
      className="group relative animate-fade-in-up fill-mode-both"
      style={{ animationDelay: `${(index + 1) * 150}ms` }}
    >
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[1.8rem] p-6 sm:p-8 border border-white/20 dark:border-slate-700/30 hover:border-emerald-300/50 dark:hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden">
        {/* Background glow */}
        <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full opacity-10 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
        <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-[1.1rem_0.45rem_1.1rem_0.45rem] flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <stat.icon className="text-white" size={22} />
        </div>
        <p className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
          {stat.prefix || ''}{count.toLocaleString()}{stat.suffix}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{stat.label}</p>
      </div>
    </div>
  );
}

function ScrollRevealSection({ children, className = '', delay = 0 }) {
  const [ref, isVisible] = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── Main Page ─── */
export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* ─────────── HERO SECTION ─────────── */}
      <section className="relative min-h-[100vh] flex items-center" id="hero-section">
        {/* Multi-layer background */}
        <div className="absolute inset-0">
          <img
            src={heroFarmer}
            alt="Indian farmer in green field"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-900/80 to-gray-950/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-gray-950/30" />
        </div>

        {/* Animated floating orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, #10b981, transparent 70%)',
              transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, #f59e0b, transparent 70%)',
              transform: `translate(${-mousePos.x * 1.5}px, ${-mousePos.y * 1.5}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
          <div
            className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full opacity-8"
            style={{
              background: 'radial-gradient(circle, #6366f1, transparent 70%)',
              transform: `translate(${mousePos.x}px, ${-mousePos.y}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-0 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left — Text */}
            <div className="animate-fade-in-up fill-mode-both">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl rounded-full text-sm text-emerald-400 mb-8 animate-fade-in fill-mode-both delay-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Trusted by 500+ farmers across India
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight font-display">
                Farm Fresh
                <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                    Directly to
                  </span>
                </span>
                <br />
                <span className="text-white/90">Your Table</span>
              </h1>

              <p className="mt-8 text-lg sm:text-xl text-gray-300/90 max-w-lg leading-relaxed">
                India's most trusted agricultural marketplace connecting farmers directly with conscious buyers.
                <span className="text-emerald-400 font-semibold"> Zero middlemen. Fresh within 48 hours.</span>
              </p>

              {/* CTA buttons */}
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  to="/marketplace"
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-1 hover:scale-[1.02]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-3">
                    Explore Marketplace
                    <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" size={20} />
                  </span>
                </Link>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-3 border-2 border-white/20 text-white font-bold py-4 px-8 rounded-full hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/40"
                >
                  <FiPlay size={16} className="group-hover:scale-110 transition-transform" />
                  Start Selling
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {['R', 'P', 'A', 'S', 'M'].map((letter, i) => (
                    <div
                      key={letter}
                      className="w-10 h-10 rounded-full border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        background: `linear-gradient(135deg, ${['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'][i]}, ${['#059669', '#4f46e5', '#d97706', '#dc2626', '#7c3aed'][i]})`,
                        zIndex: 5 - i,
                      }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} size={14} className="text-amber-400 fill-amber-400" />
                    ))}
                    <span className="text-white/80 text-sm ml-1 font-semibold">4.9/5</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">from 2,000+ reviews</p>
                </div>
              </div>
            </div>

            {/* Right — Hero Image Showcase */}
            <div className="relative hidden lg:block animate-fade-in fill-mode-both delay-300">
              <div className="relative">
                {/* Main image card */}
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/40 border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-700">
                  <img
                    src={freshVegetables}
                    alt="Fresh organic vegetables"
                    className="w-full h-[480px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/10 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-bold text-sm">Fresh Harvest Today</p>
                          <p className="text-emerald-300 text-xs">24 new varieties available</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                          <FiCheckCircle className="text-white" size={20} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badge - top left */}
                <div className="absolute -top-6 -left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[1.4rem] p-4 shadow-2xl border border-white/30 dark:border-slate-700/30 animate-float z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-[1rem_0.45rem_1rem_0.45rem] flex items-center justify-center">
                      <FiTrendingUp className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm font-bold">+127%</p>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px]">Farmer Income</p>
                    </div>
                  </div>
                </div>

                {/* Floating badge - bottom right */}
                <div className="absolute -bottom-4 -right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[1.4rem] p-4 shadow-2xl border border-white/30 dark:border-slate-700/30 animate-float z-10" style={{ animationDelay: '1.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-[1rem_0.45rem_1rem_0.45rem] flex items-center justify-center">
                      <FiHeart className="text-white" size={18} />
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white text-sm font-bold">10K+</p>
                      <p className="text-gray-500 dark:text-gray-400 text-[11px]">Happy Buyers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 50 C 360 100 1080 0 1440 50 L 1440 100 L 0 100 Z" className="fill-gray-50 dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* ─────────── STATS SECTION ─────────── */}
      <section className="relative -mt-8 z-10 pb-16 dark:bg-gray-950" id="stats-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── CATEGORIES SECTION ─────────── */}
      <section className="py-20 dark:bg-gray-950" id="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollRevealSection>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">Explore Categories</p>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                Discover Fresh <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">Produce</span>
              </h2>
            </div>
          </ScrollRevealSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <ScrollRevealSection key={cat.name} delay={i * 100}>
                <Link
                  to="/marketplace"
                  className="group relative bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 hover:border-transparent transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl text-center overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  <div className={`w-14 h-14 mx-auto bg-gradient-to-br ${cat.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <cat.icon className="text-white" size={24} />
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{cat.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{cat.count} items</p>
                </Link>
              </ScrollRevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FEATURES SECTION ─────────── */}
      <section className="py-24 lg:py-32 relative overflow-hidden" id="features-section">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950" />
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollRevealSection>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">Why Choose FarmConnect</p>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                Everything you need to{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-green-300 dark:to-teal-400">
                  buy & sell
                </span>{' '}
                farm produce
              </h2>
              <p className="mt-6 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Built for India's farming community with cutting-edge technology and thoughtful design.
              </p>
            </div>
          </ScrollRevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <ScrollRevealSection key={f.title} delay={i * 100}>
                <div className={`group relative bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 hover:border-transparent transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-${f.glow}-500/10 overflow-hidden h-full`}>
                  {/* Hover glow */}
                  <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${f.gradient} rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-all duration-500`} />

                  <div className={`w-14 h-14 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center shadow-lg shadow-${f.glow}-500/20 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <f.icon className="text-white" size={24} />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3">{f.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>

                  {/* Arrow on hover */}
                  <div className="mt-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Learn more <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </ScrollRevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="py-24 lg:py-32 relative" id="how-it-works">
        <div className="absolute inset-0">
          <img
            src={farmLandscape}
            alt="Beautiful farmland panorama"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-950/95 via-gray-900/90 to-gray-950/95" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollRevealSection>
            <div className="text-center max-w-2xl mx-auto mb-20">
              <p className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4">How It Works</p>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                Three simple steps to{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">fresh produce</span>
              </h2>
            </div>
          </ScrollRevealSection>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((s, i) => (
              <ScrollRevealSection key={s.num} delay={i * 200}>
                <div className="relative group">
                  {/* Connector line (not on last) */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-emerald-500/40 to-transparent" />
                  )}

                  <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2">
                    {/* Step number */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${
                        s.color === 'emerald' ? 'from-emerald-400 to-green-500' :
                        s.color === 'blue' ? 'from-blue-400 to-indigo-500' :
                        'from-violet-400 to-purple-500'
                      } rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <s.icon className="text-white" size={28} />
                      </div>
                      <span className="text-5xl font-black text-white/5 group-hover:text-white/10 transition-colors">{s.num}</span>
                    </div>

                    <h3 className="font-bold text-xl text-white mb-3">{s.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </ScrollRevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <section className="py-24 lg:py-32 dark:bg-gray-950" id="testimonials-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollRevealSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-4">Testimonials</p>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                Loved by{' '}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">
                  farmers & buyers
                </span>
              </h2>
            </div>
          </ScrollRevealSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <ScrollRevealSection key={t.name} delay={i * 100}>
                <div className="group bg-white dark:bg-gray-900 rounded-3xl p-7 border border-gray-100 dark:border-gray-800 hover:border-emerald-200/50 dark:hover:border-emerald-800/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl h-full flex flex-col">
                  {/* Stars */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <FiStar key={j} size={14} className={j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'} />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm flex-1">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollRevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── CTA SECTION ─────────── */}
      <section className="relative py-24 lg:py-32 overflow-hidden" id="cta-section">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <ScrollRevealSection>
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 border border-white/20 backdrop-blur-xl rounded-full text-sm text-white/90 mb-8">
              <FiZap size={14} />
              Join 500+ farmers already on the platform
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Ready to transform
              <br />
              your farming journey?
            </h2>
            <p className="text-emerald-100/80 text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Whether you're a farmer looking to reach more buyers or a consumer seeking fresh, farm-direct produce — FarmConnect is your platform.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/register"
                className="group relative inline-flex items-center justify-center gap-3 bg-white text-emerald-700 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-2xl shadow-black/10 hover:-translate-y-1 hover:shadow-black/20"
              >
                Create Free Account
                <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" size={20} />
              </Link>
              <Link
                to="/marketplace"
                className="group inline-flex items-center justify-center gap-3 border-2 border-white/30 text-white font-bold py-4 px-10 rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 hover:border-white/50"
              >
                Browse Marketplace
              </Link>
            </div>

            {/* Bottom trust line */}
            <div className="mt-12 flex items-center justify-center gap-8 text-white/50 text-sm">
              <span className="flex items-center gap-2"><FiCheckCircle size={14} /> Free to join</span>
              <span className="flex items-center gap-2"><FiShield size={14} /> Secure payments</span>
              <span className="flex items-center gap-2"><FiHeart size={14} /> 24/7 support</span>
            </div>
          </ScrollRevealSection>
        </div>
      </section>
    </div>
  );
}
