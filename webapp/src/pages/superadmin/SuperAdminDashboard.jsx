import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useNavigate, Link } from 'react-router-dom';
import { formatINR } from '../../utils/currency';
import {
  Building2,
  TrendingUp,
  Server,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Users,
  Eye,
  Coffee,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SuperAdminDashboard = () => {
  const { businesses, switchBusiness, superadminToggleRestaurant, restaurant } = useRestaurant();
  const navigate = useNavigate();

  const handleOpenBusinessDashboard = (slug) => {
    switchBusiness(slug);
    navigate('/admin');
  };

  const totalGMV = businesses.reduce((acc, b) => acc + (b.totalGMV || 450000), 0);
  const totalOrders = businesses.reduce((acc, b) => acc + (b.monthlyOrders || 1200), 0);
  const totalWorkers = businesses.reduce((acc, b) => acc + (b.workersCount || 5), 0);

  const plans = [
    { name: 'Starter Plan', price: 1999, tables: 'Up to 8 Tables', fee: '2.5% platform fee', color: 'border-blue-500/40' },
    { name: 'Pro Restaurant', price: 4999, tables: 'Up to 25 Tables', fee: '1.2% platform fee', color: 'border-primary', isPopular: true },
    { name: 'Franchise & Chain', price: 9999, tables: 'Unlimited Tables', fee: '0.8% platform fee', color: 'border-purple-500/40' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-6 sm:p-8 space-y-6">
      {/* Super Admin Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-primary to-orange-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white">
                Super Admin Tower (Platform Owners: Us)
              </h1>
              <span className="text-[10px] font-mono uppercase bg-primary text-white font-black px-2 py-0.5 rounded-full">
                Full Master Access
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyze all restaurants & cafes running under our system. Switch into any business dashboard instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/onboard"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary-600 text-white transition flex items-center gap-1.5 shadow-md shadow-primary/25"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Business</span>
          </Link>

          <Link
            to="/admin"
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5 border border-slate-700"
          >
            <span>Back to {restaurant.name}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Platform Level KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Platform GMV</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {formatINR(totalGMV)}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Monthly platform fee revenue ~{formatINR(Math.round(totalGMV * 0.02))}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Businesses Running Under Us</span>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {businesses.length} Outlets
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cafe Highfive is flagship</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Monthly Processed Orders</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white mt-2 font-mono">
            {totalOrders.toLocaleString()} Orders
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all cafes & tables</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Active Staff & Workers</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400 mt-2 font-mono">
            {totalWorkers} Staff
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Chefs, Waiters & Baristas</div>
        </div>
      </div>

      {/* Tenant Directory Table with Direct "Open Dashboard" Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white">All Businesses Under Our Platform</h3>
            <p className="text-xs text-slate-400">
              Select any restaurant to open their live dashboard, manage menu items, inspect tables, or view customers.
            </p>
          </div>
          <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono">
            {businesses.length} Registered Outlets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-5">Business Name & Concept</th>
                <th className="py-3 px-5">City & Location</th>
                <th className="py-3 px-5">Tables & QR</th>
                <th className="py-3 px-5">Workers</th>
                <th className="py-3 px-5">Monthly GMV</th>
                <th className="py-3 px-5">Subscription</th>
                <th className="py-3 px-5 text-right">Super Admin Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
              {businesses.map((biz) => {
                const isCurrent = restaurant.slug === biz.slug;
                const isActive = biz.status === 'active';

                return (
                  <tr key={biz.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-primary text-white flex items-center justify-center font-black text-xs">
                          {biz.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-1.5">
                            <span>{biz.name}</span>
                            {biz.isPrimary && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                                OUR FLAGSHIP
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                                ACTIVE IN DASHBOARD
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px]">{biz.cuisine || 'Cafe & Bistro'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-400">{biz.city}</td>
                    <td className="py-4 px-5">
                      <span className="font-bold text-white">{biz.tablesCount || 10} Tables</span>
                      <div className="text-[10px] text-slate-500 font-mono">/r/{biz.slug}/table/T-01</div>
                    </td>
                    <td className="py-4 px-5 font-mono">{biz.workersCount || 5} staff</td>
                    <td className="py-4 px-5 font-mono font-bold text-emerald-400">
                      {formatINR(biz.totalGMV || 480000)}
                    </td>
                    <td className="py-4 px-5">
                      <span className="bg-primary/20 text-primary border border-primary/40 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        {biz.planName}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenBusinessDashboard(biz.slug)}
                          className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs flex items-center gap-1 transition shadow-sm"
                          title="Open and manage this restaurant dashboard"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open Dashboard</span>
                        </button>

                        <button
                          onClick={() => superadminToggleRestaurant(biz.id)}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] transition ${
                            isActive
                              ? 'bg-slate-800 text-slate-400 hover:text-red-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {isActive ? 'Active' : 'Suspended'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Pricing Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          <span>SaaS Tier Packages for Businesses</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`bg-slate-950 p-5 rounded-2xl border ${p.color} relative flex flex-col justify-between`}
            >
              {p.isPopular && (
                <span className="absolute -top-2.5 right-4 bg-primary text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow">
                  Most Popular
                </span>
              )}
              <div>
                <div className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                  {p.name}
                </div>
                <div className="font-mono text-3xl font-black text-white mt-1">
                  {formatINR(p.price)}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-3 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{p.tables}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{p.fee}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI Voice & Waiter Call System</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800 text-[10px] text-slate-500">
                Automated monthly billing via Razorpay / Stripe
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
