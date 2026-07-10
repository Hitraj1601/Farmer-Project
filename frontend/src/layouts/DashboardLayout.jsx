import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-12 right-12 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>
      <Navbar />

      {/* Mobile sidebar toggle — visible below lg */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/70 px-4 py-2.5">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 font-semibold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-all duration-200"
          aria-label="Open dashboard menu"
        >
          <FiMenu size={18} />
          <span>Dashboard Menu</span>
        </button>
      </div>

      <div className="relative flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <div className="p-4 sm:p-5 lg:p-8 max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
