import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Navbar from './Navbar';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950">
      <Navbar />

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/80 dark:border-gray-800/70 px-4 py-2.5">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-800/50 text-violet-700 dark:text-violet-400 font-semibold text-sm hover:bg-violet-100 dark:hover:bg-violet-950 transition-all duration-200"
          aria-label="Open admin menu"
        >
          <FiMenu size={18} />
          <span>Admin Menu</span>
        </button>
      </div>

      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <div className="p-4 sm:p-5 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
