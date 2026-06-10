import { NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiPackage, FiPlusCircle, FiShoppingBag, FiBarChart2, FiUploadCloud, FiHelpCircle } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';

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

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 min-h-[calc(100vh-4rem)] sticky top-16">
      <div className="flex flex-col flex-1 px-3 py-5 overflow-y-auto">

        {/* Seller branding */}
        <div className="mx-2 mb-5 px-3 py-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/40 border border-emerald-100 dark:border-emerald-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/20 flex-shrink-0">
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
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25'
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

      {/* Bottom help card */}
      <div className="px-4 pb-5">
        <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
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
  );
}
