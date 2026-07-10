import { NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiShoppingBag, FiCreditCard, FiX } from 'react-icons/fi';
import { useEffect } from 'react';

const links = [
  { to: '/admin', icon: FiGrid, label: 'Overview', end: true },
  { to: '/admin/users', icon: FiUsers, label: 'Users' },
  { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/admin/payments', icon: FiCreditCard, label: 'Payments' },
];

export default function AdminSidebar({ isOpen = false, onClose = () => {} }) {
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const navContent = (
    <div className="flex flex-col flex-1 px-4 py-6">
      <div className="mb-6 px-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Admin Panel</p>
      </div>
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const isActive = link.end
            ? location.pathname === link.to
            : location.pathname.startsWith(link.to);
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-400 shadow-sm shadow-violet-500/5'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:text-gray-700 dark:group-hover:text-gray-200'
              }`}>
                <link.icon size={16} />
              </div>
              {link.label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 min-h-[calc(100vh-4rem)]">
        {navContent}
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 w-[280px] max-w-[85vw] h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl border-r border-gray-100 dark:border-gray-800 shadow-2xl shadow-black/20 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <span className="text-sm font-bold text-gray-900 dark:text-white">Admin Panel</span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>
        {navContent}
      </aside>
    </>
  );
}
