import { NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiPackage, FiPlusCircle, FiShoppingBag, FiBarChart2, FiUploadCloud } from 'react-icons/fi';

const links = [
  { to: '/dashboard', icon: FiGrid, label: 'Overview', end: true },
  { to: '/dashboard/my-crops', icon: FiPackage, label: 'My Crops' },
  { to: '/dashboard/add-crop', icon: FiPlusCircle, label: 'Add Crop' },
  { to: '/dashboard/bulk-upload', icon: FiUploadCloud, label: 'Bulk Upload' },
  { to: '/dashboard/orders', icon: FiShoppingBag, label: 'Orders' },
  { to: '/dashboard/analytics', icon: FiBarChart2, label: 'Analytics' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col flex-1 px-4 py-6">
        <div className="mb-6 px-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Farmer Panel</p>
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
                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-emerald-500/5'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                }`}>
                  <link.icon size={16} />
                </div>
                {link.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
