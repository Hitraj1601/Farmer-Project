import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './layouts/ProtectedRoute';
import Loader from './components/Loader';

const HomePage = lazy(() => import('./pages/HomePage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const CropDetailPage = lazy(() => import('./pages/CropDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const CartPage = lazy(() => import('./pages/CartPage'));

const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard'));
const MyCrops = lazy(() => import('./pages/farmer/MyCrops'));
const CropForm = lazy(() => import('./pages/farmer/CropForm'));
const FarmerOrders = lazy(() => import('./pages/farmer/FarmerOrders'));
const Analytics = lazy(() => import('./pages/farmer/Analytics'));
const BulkUpload = lazy(() => import('./pages/farmer/BulkUpload'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const PaymentsPage = lazy(() => import('./pages/admin/PaymentsPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader text="Loading page..." />}>
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
              <Route path="/cart" element={<CartPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:conversationId" element={<ChatPage />} />
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
              <Route path="/dashboard/bulk-upload" element={<BulkUpload />} />
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
      </Suspense>
    </BrowserRouter>
  );
}
