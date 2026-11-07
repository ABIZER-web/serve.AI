import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Monitor, Tv, LayoutDashboard, QrCode, Bell, UserCircle } from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const location = useLocation();
  const { orders, notifications } = useRestaurant();
  const { user, switchRole } = useAuth();

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-secondary-900/95 backdrop-blur-md border-b border-gray-100 dark:border-secondary-800 shadow-sm transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo matching UI Reference */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-secondary-900 dark:text-white">
                Food House
              </span>
              <span className="text-[10px] text-primary font-bold block -mt-1 tracking-wider uppercase">
                Serve.AI OS
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/r/food-house/table/T-05"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                location.pathname.startsWith('/r/')
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-800'
              }`}
            >
              <QrCode className="w-4 h-4 text-primary" />
              <span>Customer QR Menu (T-05)</span>
            </Link>

            <Link
              to="/staff"
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isActive('/staff')
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-800'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>Staff Dashboard</span>
              {pendingOrdersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </Link>

            <Link
              to="/kitchen"
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                isActive('/kitchen')
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-800'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Kitchen Display (KDS)</span>
              {preparingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center">
                  {preparingCount}
                </span>
              )}
            </Link>

            <Link
              to="/admin"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                location.pathname.startsWith('/admin')
                  ? 'bg-primary-50 dark:bg-primary-950/50 text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-secondary-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Admin Hub</span>
            </Link>
          </nav>

          {/* Right Action: Role Selector & Testing Controls */}
          <div className="flex items-center gap-2">
            {/* Quick Role Switcher */}
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-secondary-800 px-2.5 py-1.5 rounded-xl text-xs">
              <UserCircle className="w-4 h-4 text-gray-500" />
              <select
                value={user?.role || 'owner'}
                onChange={(e) => switchRole(e.target.value)}
                className="bg-transparent font-bold text-xs text-secondary-900 dark:text-white focus:outline-none cursor-pointer"
              >
                <option value="owner" className="text-black">Owner (Admin)</option>
                <option value="kitchen" className="text-black">Kitchen Chef</option>
                <option value="waiter" className="text-black">Waiter / Staff</option>
                <option value="cashier" className="text-black">Cashier</option>
              </select>
            </div>

            {/* Mobile Menu Dropdown Link */}
            <Link
              to="/r/food-house/table/T-05"
              className="md:hidden p-2 rounded-xl bg-primary text-white text-xs font-bold"
              title="Customer Menu"
            >
              <QrCode className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

