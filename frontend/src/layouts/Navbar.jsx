import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiShoppingBag, FiGrid, FiChevronDown, FiSettings, FiSun, FiMoon, FiHeart } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'FARMER') return '/dashboard';
    return '/marketplace';
  };

  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `relative px-1 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
    }`;
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-black/[0.04] border-b border-gray-100/50 dark:border-gray-800/50'
        : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <GiWheat className="text-white" size={20} />
            </div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Farm<span className="text-gradient">Connect</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/marketplace" className={navLinkClass('/marketplace')}>Marketplace</Link>
            {isAuthenticated && (
              <>
                <Link to={getDashboardLink()} className={navLinkClass(getDashboardLink())}>
                  Dashboard
                </Link>
                {user?.role === 'BUYER' && (
                  <>
                    <Link to="/my-orders" className={navLinkClass('/my-orders')}>
                      My Orders
                    </Link>
                    <Link to="/wishlist" className={`${navLinkClass('/wishlist')} flex items-center gap-1`}>
                      <FiHeart size={15} /> Wishlist
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{user.role}</p>
                  </div>
                  <FiChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 border border-gray-100 dark:border-gray-800 py-2 animate-fade-in-down z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                      <FiSettings size={15} /> Profile Settings
                    </Link>
                    <Link to={getDashboardLink()} onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                      <FiGrid size={15} /> Dashboard
                    </Link>
                    {user?.role === 'BUYER' && (
                      <>
                        <Link to="/my-orders" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                          <FiShoppingBag size={15} /> My Orders
                        </Link>
                        <Link to="/wishlist" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                          <FiHeart size={15} /> My Wishlist
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 w-full transition-colors">
                        <FiLogOut size={15} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 animate-fade-in-down">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link to="/marketplace" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors">
              Marketplace
            </Link>
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors">
                  <FiGrid size={16} /> Dashboard
                </Link>
                {user?.role === 'BUYER' && (
                  <>
                    <Link to="/my-orders" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors">
                      <FiShoppingBag size={16} /> My Orders
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors">
                      <FiHeart size={16} /> My Wishlist
                    </Link>
                  </>
                )}
                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors">
                  <FiUser size={16} /> Profile
                </Link>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Dark Mode</span>
                  <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all">
                    {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
                  </button>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800">
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 w-full font-medium transition-colors">
                    <FiLogOut size={16} /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between px-4 py-3 rounded-xl">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Dark Mode</span>
                  <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-all">
                    {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
                  </button>
                </div>
                <div className="flex gap-2 pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 px-4">
                  <Link to="/login" className="btn-secondary flex-1 text-center text-sm py-2.5">Sign In</Link>
                  <Link to="/register" className="btn-primary flex-1 text-center text-sm py-2.5">Get Started</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
