import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import CropDetailPage from './pages/CropDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyOrdersPage from './pages/MyOrdersPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';

import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MyCrops from './pages/farmer/MyCrops';
import CropForm from './pages/farmer/CropForm';
import FarmerOrders from './pages/farmer/FarmerOrders';
import Analytics from './pages/farmer/Analytics';

import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import PaymentsPage from './pages/admin/PaymentsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/crops/:id" element={<CropDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute roles={['BUYER']} />}>
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['FARMER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<FarmerDashboard />} />
            <Route path="/dashboard/my-crops" element={<MyCrops />} />
            <Route path="/dashboard/add-crop" element={<CropForm />} />
            <Route path="/dashboard/edit-crop/:id" element={<CropForm />} />
            <Route path="/dashboard/orders" element={<FarmerOrders />} />
            <Route path="/dashboard/analytics" element={<Analytics />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/payments" element={<PaymentsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
