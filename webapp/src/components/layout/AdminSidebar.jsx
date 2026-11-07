import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Grid,
  Users,
  BarChart3,
  Settings,
  LogOut,
  UtensilsCrossed,
  Boxes,
  CalendarDays,
  Gift,
  Building2,
  UserCheck,
  HeartHandshake,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { BusinessSwitcher } from './BusinessSwitcher';

export const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const { restaurant, orders, serviceRequests } = useRestaurant();
  const navigate = useNavigate();

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const pendingRequests = serviceRequests.filter((s) => s.status === 'pending').length;
  const totalAlerts = pendingCount + pendingRequests;

  const navLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/orders', label: 'Orders & POS', icon: ShoppingBag, badge: totalAlerts > 0 ? totalAlerts : null },
    { to: '/admin/menu', label: 'Menu & Prices', icon: Utensils },
    { to: '/admin/tables', label: 'Tables & QR Stands', icon: Grid },
    { to: '/admin/customers', label: 'Customer List (CRM)', icon: UserCheck },
    { to: '/admin/inventory', label: 'Inventory & Stock', icon: Boxes },
    { to: '/admin/reservations', label: 'Reservations', icon: CalendarDays },
    { to: '/admin/loyalty', label: 'Offers & Discounts', icon: Gift },
    { to: '/admin/staff', label: 'Workers & Staff', icon: Users },
    { to: '/admin/analytics', label: 'Analytics Reports', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
    { to: '/superadmin', label: 'Super Admin Tower', icon: Building2 },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-64 bg-secondary-900 text-gray-300 flex flex-col justify-between h-screen sticky top-0 border-r border-secondary-800 flex-shrink-0 select-none">
      <div className="overflow-y-auto">
        {/* Business Tenant Switcher Header */}
        <div className="p-3 border-b border-secondary-800">
          <BusinessSwitcher />
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'hover:bg-secondary-800 text-gray-400 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-secondary-800 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-xs">
            {user?.name?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</div>
            <div className="text-[10px] text-primary capitalize font-medium">{restaurant.name || 'Owner'}</div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-red-400 hover:bg-secondary-800 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
