import { NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiPackage, FiPlusCircle, FiShoppingBag, FiBarChart2, FiUploadCloud, FiHelpCircle, FiX } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import { useEffect } from 'react';

const navGroups = [
  {
    label: 'Main',
    links: [
      { to: '/dashboard', icon: FiGrid, label: 'Overview', end: true },
      { to: '/dashboard/my-crops', icon: FiPackage, label: 'My Crops' },
      { to: '/dashboard/orders', icon: FiShoppingBag, label: 'Orders' },
    ],
  },
  {
    label: 'Manage',
    links: [
      { to: '/dashboard/add-crop', icon: FiPlusCircle, label: 'Add Crop' },
      { to: '/dashboard/bulk-upload', icon: FiUploadCloud, label: 'Bulk Upload' },
      { to: '/dashboard/analytics', icon: FiBarChart2, label: 'Analytics' },
    ],
  },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
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

  const sidebarContent = (
    <div className="flex flex-col flex-1 px-3 py-5 overflow-y-auto">

      {/* Seller branding */}
      <div className="mx-2 mb-5 px-3 py-3 rounded-[1.35rem] bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950/60 dark:via-slate-900 dark:to-teal-950/30 border border-emerald-100 dark:border-emerald-900/50 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[0.9rem_0.45rem_0.9rem_0.45rem] bg-[radial-gradient(circle_at_top_left,_#34d399,_#059669_70%,_#0f766e)] flex items-center justify-center shadow-[0_14px_24px_-16px_rgba(16,185,129,0.8)] flex-shrink-0">
            <GiWheat className="text-white" size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 leading-tight">Seller Dashboard</p>
            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/60">Manage your farm business</p>
          </div>
        </div>
      </div>

      {/* Navigation groups */}
      {navGroups.map((group) => (
        <div key={group.label} className="mb-4">
          <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400/80 dark:text-gray-500/80">
            {group.label}
          </p>
          <nav className="flex flex-col gap-0.5">
            {group.links.map((link) => {
              const isActive = link.end
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to);
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-[1rem] text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200/70 dark:ring-emerald-900/50'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? 'bg-[radial-gradient(circle_at_top_left,_#34d399,_#059669_70%,_#0f766e)] text-white shadow-[0_14px_24px_-16px_rgba(16,185,129,0.8)]'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                  }`}>
                    <link.icon size={16} />
                  </div>
                  <span className="flex-1">{link.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ═══ Desktop Sidebar (static, visible lg+) ═══ */}
      <aside className="hidden lg:flex flex-col w-[272px] bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/70 min-h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}

        {/* Bottom help card */}
        <div className="px-4 pb-5">
          <div className="p-3.5 rounded-[1.2rem] bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-800/70 dark:to-slate-900/70 border border-slate-200/80 dark:border-slate-700/70">
            <div className="flex items-center gap-2 mb-1.5">
              <FiHelpCircle size={14} className="text-blue-500" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Need Help?</p>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Visit our help center or reach out to support for assistance.
            </p>
          </div>
        </div>
      </aside>

      {/* ═══ Mobile Sidebar Drawer (visible below lg) ═══ */}
      {/* Backdrop overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-50 w-[280px] max-w-[85vw] h-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-200/80 dark:border-slate-800/70 shadow-2xl shadow-black/20 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header with close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[radial-gradient(circle_at_top_left,_#34d399,_#059669_62%,_#0f766e)] rounded-[1.1rem_0.5rem_1.1rem_0.5rem] flex items-center justify-center shadow-[0_14px_24px_-16px_rgba(16,185,129,0.8)]">
              <GiWheat className="text-white" size={16} />
            </div>
            <span className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight font-display">
              Farm<span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">Connect</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        {sidebarContent}

        {/* Bottom help card (mobile) */}
        <div className="px-4 pb-5 mt-auto">
          <div className="p-3.5 rounded-[1.2rem] bg-gradient-to-br from-slate-50 to-emerald-50 dark:from-slate-800/70 dark:to-slate-900/70 border border-slate-200/80 dark:border-slate-700/70">
            <div className="flex items-center gap-2 mb-1.5">
              <FiHelpCircle size={14} className="text-blue-500" />
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Need Help?</p>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Visit our help center or reach out to support for assistance.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
