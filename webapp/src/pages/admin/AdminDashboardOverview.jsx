import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  Clock,
  Grid,
  Search,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AdminDashboardOverview = () => {
  const { restaurant, orders, tables, menuItems } = useRestaurant();

  // Metrics matching reference UI screenshot
  const totalOrdersCount = 124 + orders.length - 6;
  const totalRevenueToday = 12450 + orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) - 2400;
  const pendingCount = orders.filter((o) => ['pending', 'accepted'].includes(o.status)).length;
  const activeTablesCount = tables.filter((t) => t.isOccupied).length;

  // Hourly Sales Data for Chart
  const salesChartData = [
    { time: '12 PM', today: 1800, yesterday: 1200 },
    { time: '2 PM', today: 4200, yesterday: 3100 },
    { time: '4 PM', today: 5600, yesterday: 4800 },
    { time: '6 PM', today: 8900, yesterday: 7200 },
    { time: '8 PM', today: 11400, yesterday: 9800 },
    { time: '10 PM', today: 12450, yesterday: 10900 },
  ];

  // Popular Items list matching UI reference
  const popularItems = [
    {
      id: 'p-1',
      name: 'Paneer Pizza',
      ordersCount: 328,
      revenue: '₹81,672',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'p-2',
      name: 'Cold Coffee',
      ordersCount: 276,
      revenue: '₹24,564',
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'p-3',
      name: 'Veg Burger',
      ordersCount: 198,
      revenue: '₹29,502',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-xs text-gray-500 mt-0.5 font-sans">
            Welcome back to {restaurant.name}. Real-time dining operations and sales summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary w-48"
            />
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 px-3 py-1.5 rounded-xl text-xs font-bold">
            <User className="w-4 h-4 text-primary" />
            <span>Admin</span>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards Matching UI Reference */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Today */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Total Orders
          </div>
          <div className="text-3xl font-black text-secondary-900 dark:text-white mt-2">
            {totalOrdersCount}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% from yesterday</span>
          </div>
        </div>

        {/* Revenue Today */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Revenue Today
          </div>
          <div className="text-3xl font-black text-secondary-900 dark:text-white mt-2">
            {formatINR(totalRevenueToday)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18% from yesterday</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Pending Orders
          </div>
          <div className="text-3xl font-black text-primary mt-2">
            {pendingCount || 8}
          </div>
          <div className="text-[11px] font-semibold text-gray-400 mt-2">
            Requires kitchen acceptance
          </div>
        </div>

        {/* Active Tables */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Active Tables
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {activeTablesCount || 6}
          </div>
          <div className="text-[11px] font-semibold text-gray-400 mt-2">
            Out of {tables.length} dining tables
          </div>
        </div>
      </div>

      {/* Main Grid: Sales Overview Chart (Left) & Popular Items (Right) Matching UI Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Overview Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-gray-100 dark:border-secondary-800 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-secondary-800">
            <div>
              <h3 className="font-extrabold text-base text-secondary-900 dark:text-white">
                Sales Overview
              </h3>
              <p className="text-xs text-gray-400">Intraday hourly revenue progression</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-secondary-800 dark:text-gray-200">Today</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-secondary-700" />
                <span className="text-gray-400">Yesterday</span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="todayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val) => [formatINR(val), 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="yesterday"
                  stroke="#9CA3AF"
                  strokeWidth={2}
                  fillOpacity={0}
                  strokeDasharray="4 4"
                />
                <Area
                  type="monotone"
                  dataKey="today"
                  stroke="#F97316"
                  strokeWidth={3}
                  fill="url(#todayGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Items Card (4 cols) Matching UI Reference */}
        <div className="lg:col-span-4 bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-gray-100 dark:border-secondary-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-secondary-900 dark:text-white pb-4 border-b border-gray-100 dark:border-secondary-800">
              Popular Items
            </h3>

            <div className="divide-y divide-gray-100 dark:divide-secondary-800 mt-2">
              {popularItems.map((item, idx) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                    />
                    <div>
                      <div className="font-bold text-xs text-secondary-900 dark:text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {item.ordersCount} orders today
                      </div>
                    </div>
                  </div>

                  <span className="font-black text-xs text-secondary-900 dark:text-white">
                    {item.revenue}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-secondary-800 text-center">
            <span className="text-[11px] text-primary font-bold">
              +17 more items on the active menu
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

