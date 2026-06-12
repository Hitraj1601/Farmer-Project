import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-12 right-12 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>
      <Navbar />
      <div className="relative flex">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <div className="p-5 lg:p-8 max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
