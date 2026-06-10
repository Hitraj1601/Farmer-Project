import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          <div className="p-5 lg:p-8 max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
