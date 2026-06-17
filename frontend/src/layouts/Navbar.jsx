import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiShoppingBag, FiGrid, FiChevronDown, FiSettings, FiSun, FiMoon, FiHeart, FiMessageSquare } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const { unreadChat } = useSocket();
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
        ? 'bg-white/72 dark:bg-slate-950/72 backdrop-blur-2xl shadow-[0_18px_60px_-38px_rgba(15,23,42,0.7)] border-b border-slate-200/70 dark:border-slate-800/60'
        : 'bg-white/88 dark:bg-slate-950/88 border-b border-slate-200/70 dark:border-slate-800/60'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[radial-gradient(circle_at_top_left,_#34d399,_#059669_62%,_#0f766e)] rounded-[1.1rem_0.5rem_1.1rem_0.5rem] flex items-center justify-center shadow-[0_16px_30px_-18px_rgba(16,185,129,0.95)] group-hover:shadow-[0_22px_40px_-18px_rgba(16,185,129,0.95)] transition-shadow">
              <GiWheat className="text-white" size={20} />
            </div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight font-display">
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
                {isAuthenticated && (
                  <Link to="/chat" className={`${navLinkClass('/chat')} flex items-center gap-1`}>
                    <span className="relative">
                      <FiMessageSquare size={15} />
                      {unreadChat > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                          {unreadChat > 9 ? '9+' : unreadChat}
                        </span>
                      )}
                    </span>
                    <span className="ml-1">Chat</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/50"
              aria-label="Toggle dark mode"
            >
              {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {/* Chat icon */}
            {isAuthenticated && (
              <Link
                to="/chat"
                className="relative p-2.5 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/60 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/50"
                aria-label="Messages"
              >
                <FiMessageSquare size={18} />
                {unreadChat > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {unreadChat > 9 ? '9+' : unreadChat}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-all duration-200 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="w-8 h-8 rounded-[0.95rem_0.45rem_0.95rem_0.45rem] bg-[radial-gradient(circle_at_top_left,_#34d399,_#059669_70%,_#0f766e)] flex items-center justify-center text-white font-bold text-sm shadow-[0_14px_24px_-16px_rgba(16,185,129,0.8)]">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                    <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">{user.role}</p>
                  </div>
                  <FiChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-[1.4rem] shadow-[0_24px_60px_-30px_rgba(15,23,42,0.55)] border border-slate-200/80 dark:border-slate-800/70 py-2 animate-fade-in-down z-50">
                    <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/70">
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
                        <Link to="/chat" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                          <FiMessageSquare size={15} /> Messages
                          {unreadChat > 0 && (
                            <span className="ml-auto w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                              {unreadChat > 9 ? '9+' : unreadChat}
                            </span>
                          )}
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
        <div className="md:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/70 animate-fade-in-down">
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
                {isAuthenticated && (
                  <Link to="/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors">
                    <FiMessageSquare size={16} /> Messages
                    {unreadChat > 0 && (
                      <span className="ml-auto w-5 h-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadChat > 9 ? '9+' : unreadChat}
                      </span>
                    )}
                  </Link>
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
