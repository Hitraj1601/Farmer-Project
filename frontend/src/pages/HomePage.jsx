import { Link } from 'react-router-dom';
import { GiWheat, GiFarmer, GiReceiveMoney } from 'react-icons/gi';
import { FiShield, FiTruck, FiUsers, FiArrowRight, FiStar, FiCheckCircle } from 'react-icons/fi';

const stats = [
  { label: 'Active Farmers', value: '500+', icon: GiFarmer, color: 'emerald' },
  { label: 'Crops Listed', value: '2,000+', icon: GiWheat, color: 'blue' },
  { label: 'Orders Completed', value: '10,000+', icon: FiTruck, color: 'violet' },
  { label: 'Revenue Generated', value: '₹50L+', icon: GiReceiveMoney, color: 'amber' },
];

const features = [
  { icon: FiUsers, title: 'Direct from Farmers', desc: 'Buy directly from verified farmers. Zero middlemen, honest pricing, with complete transparency.' },
  { icon: FiShield, title: 'Secure Payments', desc: 'Razorpay-powered transactions with buyer protection. Pay safely using UPI, cards, or net banking.' },
  { icon: FiTruck, title: 'Reliable Delivery', desc: 'Real-time order tracking from farm to your doorstep. Fresh produce guaranteed.' },
];

const steps = [
  { num: '01', title: 'Browse & Select', desc: 'Explore fresh crops from verified local farmers across India.' },
  { num: '02', title: 'Place Your Order', desc: 'Choose quantity, pay securely, and confirm your order in seconds.' },
  { num: '03', title: 'Farm to Table', desc: 'Get fresh produce delivered directly with real-time tracking.' },
];

const testimonials = [
  { name: 'Rajesh Patel', role: 'Farmer, Gujarat', text: 'FarmConnect helped me reach buyers directly. My income has doubled in just 6 months!', rating: 5 },
  { name: 'Priya Sharma', role: 'Buyer, Delhi', text: 'The freshest vegetables I have ever bought online. Quality and pricing both are excellent.', rating: 5 },
  { name: 'Amit Kumar', role: 'Farmer, Bihar', text: 'Simple platform, easy to list crops. Payments are always on time. Highly recommended!', rating: 4 },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[600px]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1920&q=80')" }}
        />
        {/* Dark + Green gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 via-green-800/75 to-teal-900/80" />
        {/* Decorative blurs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl animate-fade-in-up fill-mode-both">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm text-white/90 mb-6">
              <FiCheckCircle size={14} /> Trusted by 500+ farmers across India
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
              Farm Fresh Produce,
              <br />
              <span className="text-emerald-200">Directly to You</span>
            </h1>
            <p className="mt-6 text-lg text-emerald-100/90 max-w-xl leading-relaxed">
              Connect directly with local farmers. Get fresh crops at fair prices with zero middlemen. Supporting sustainable agriculture across India.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/marketplace" className="group inline-flex items-center gap-2 bg-white text-emerald-700 font-bold py-3.5 px-8 rounded-xl hover:bg-emerald-50 transition-all shadow-xl shadow-black/10 hover:-translate-y-0.5">
                Browse Marketplace
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all">
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={s.label} className={`bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl shadow-black/[0.03] dark:shadow-black/20 border border-gray-100 dark:border-gray-800 animate-fade-in-up fill-mode-both delay-${(i + 1) * 100}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  s.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' :
                  s.color === 'blue' ? 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400' :
                  s.color === 'violet' ? 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400' :
                  'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                }`}>
                  <s.icon size={20} />
                </div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">Why Choose Us</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
              Everything you need to <span className="text-gradient">buy & sell</span> farm produce
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={f.title} className={`group relative bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm hover:shadow-xl hover:shadow-emerald-500/[0.05] transition-all duration-300 hover:-translate-y-1 animate-fade-in-up fill-mode-both delay-${(i + 1) * 100}`}>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50/80 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Three simple steps to fresh produce</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.num} className={`relative animate-fade-in-up fill-mode-both delay-${(i + 1) * 100}`}>
                <span className="text-7xl font-black text-emerald-100 dark:text-emerald-900">{s.num}</span>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white -mt-4 mb-2">{s.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">Testimonials</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Loved by farmers & buyers</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={t.name} className={`bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in-up fill-mode-both delay-${(i + 1) * 100}`}>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }, (_, j) => (
                    <FiStar key={j} size={16} className={j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'} />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-800/85 via-green-700/80 to-teal-800/85" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to get started?</h2>
          <p className="text-emerald-100/90 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of farmers and buyers on India&apos;s most trusted agricultural marketplace.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register" className="group inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold py-3.5 px-8 rounded-xl hover:bg-emerald-50 transition-all shadow-xl shadow-black/10">
              Create Free Account
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
            <Link to="/marketplace" className="inline-flex items-center justify-center border-2 border-white/30 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-white/10 transition-all">
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
