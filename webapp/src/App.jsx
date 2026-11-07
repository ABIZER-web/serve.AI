import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';

// Pages
import { LandingPage } from './pages/landing/LandingPage';
import { CustomerMenuPage } from './pages/customer/CustomerMenuPage';
import { SelfSeatingPage } from './pages/customer/SelfSeatingPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { KitchenDisplayPage } from './pages/kitchen/KitchenDisplayPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboardOverview } from './pages/admin/AdminDashboardOverview';
import { MenuManagement } from './pages/admin/MenuManagement';
import { TableManagement } from './pages/admin/TableManagement';
import { CustomerManagement } from './pages/admin/CustomerManagement';
import { InventoryManagement } from './pages/admin/InventoryManagement';
import { ReservationsManagement } from './pages/admin/ReservationsManagement';
import { LoyaltyPromotions } from './pages/admin/LoyaltyPromotions';
import { StaffManagement } from './pages/admin/StaffManagement';
import { AnalyticsReports } from './pages/admin/AnalyticsReports';
import { SettingsPage } from './pages/admin/SettingsPage';
import { SuperAdminDashboard } from './pages/superadmin/SuperAdminDashboard';
import { BusinessOnboardingPage } from './pages/onboarding/BusinessOnboardingPage';

function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <CartProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col font-sans">
              <Routes>
                {/* Marketing Landing */}
                <Route
                  path="/"
                  element={<LandingPage />}
                />

                {/* Self-Serve Business Onboarding */}
                <Route
                  path="/onboard"
                  element={<BusinessOnboardingPage />}
                />

                {/* Customer Self-Seating Portal */}
                <Route
                  path="/r/:restaurantSlug/seating"
                  element={<SelfSeatingPage />}
                />

                {/* Customer Table QR Ordering Menu */}
                <Route
                  path="/r/:restaurantSlug/table/:tableNumber"
                  element={<CustomerMenuPage />}
                />

                {/* Customer Live Order Tracking */}
                <Route
                  path="/track/:orderId"
                  element={<OrderTrackingPage />}
                />

                {/* Staff Dashboard (POS) */}
                <Route
                  path="/staff"
                  element={
                    <>
                      <Navbar />
                      <StaffDashboardPage />
                    </>
                  }
                />

                {/* Kitchen Display System (KDS) */}
                <Route
                  path="/kitchen"
                  element={<KitchenDisplayPage />}
                />

                {/* Super Admin Multi-Tenant Cloud Platform */}
                <Route
                  path="/superadmin"
                  element={<SuperAdminDashboard />}
                />

                {/* Admin Management Hub */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardOverview />} />
                  <Route path="orders" element={<StaffDashboardPage />} />
                  <Route path="menu" element={<MenuManagement />} />
                  <Route path="tables" element={<TableManagement />} />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="reservations" element={<ReservationsManagement />} />
                  <Route path="loyalty" element={<LoyaltyPromotions />} />
                  <Route path="staff" element={<StaffManagement />} />
                  <Route path="analytics" element={<AnalyticsReports />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
        </CartProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
}

export default App;
