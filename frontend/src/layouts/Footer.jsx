import { Link } from 'react-router-dom';
import { GiWheat } from 'react-icons/gi';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 dark:text-gray-500 dark:border-t dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <GiWheat className="text-white" size={20} />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">Farm<span className="text-emerald-400">Connect</span></span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Empowering farmers with direct market access. Fresh from farm to your table with transparency and trust.
            </p>
            <div className="mt-6 space-y-2.5 text-sm">
              <div className="flex items-center gap-2.5">
                <FiMail className="text-emerald-500" size={14} />
                <span>support@farmconnect.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FiPhone className="text-emerald-500" size={14} />
                <span>+91 9876 543 210</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FiMapPin className="text-emerald-500" size={14} />
                <span>Bhopal, Madhya Pradesh</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-2.5">
              {[
                { to: '/marketplace', label: 'Marketplace' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm hover:text-emerald-400 transition-colors duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Farmers */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">For Farmers</h3>
            <ul className="mt-4 space-y-2.5">
              {['Sell Your Crops', 'Track Orders', 'View Analytics', 'Manage Inventory'].map((item) => (
                <li key={item} className="text-sm">{item}</li>
              ))}
            </ul>
          </div>

          {/* For Buyers */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">For Buyers</h3>
            <ul className="mt-4 space-y-2.5">
              {['Browse Fresh Produce', 'Secure Payments', 'Order Tracking', 'Quality Assured'].map((item) => (
                <li key={item} className="text-sm">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 dark:border-gray-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-500 hover:text-gray-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="text-xs text-gray-500 hover:text-gray-400 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
