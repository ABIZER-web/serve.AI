import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import {
  Users,
  Search,
  Award,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  Heart,
  TrendingUp,
  Download,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CustomerManagement = () => {
  const { customers, restaurant } = useRestaurant();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('ALL');

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      !searchQuery.trim() ||
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cust.phone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'ALL' || cust.tier.toUpperCase() === selectedTier;
    return matchesSearch && matchesTier;
  });

  const totalRevenueFromRepeat = customers.reduce((acc, c) => acc + (c.totalSpend || 0), 0);
  const platinumCount = customers.filter((c) => c.tier === 'Platinum').length;
  const goldCount = customers.filter((c) => c.tier === 'Gold').length;

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Name,Phone,Email,Tier,Visits,Total Spend,Points,Favorite Item']
        .concat(
          customers.map(
            (c) =>
              `"${c.name}","${c.phone}","${c.email}","${c.tier}",${c.visits},${c.totalSpend},${c.points},"${c.favoriteItem}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${restaurant.slug}-customers.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
            Customer Database & CRM
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Diners who ordered from {restaurant.name} via Table QR code or counter checkout.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          variant="outline"
          icon={Download}
          className="text-xs font-bold"
        >
          Export Customer List (CSV)
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-secondary-900 p-5 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Diners In CRM</div>
            <div className="text-2xl font-black text-secondary-900 dark:text-white">{customers.length} Guests</div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 p-5 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">VIP Members (Gold/Plat)</div>
            <div className="text-2xl font-black text-amber-500">{platinumCount + goldCount} Guests</div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 p-5 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Repeat Guest Revenue</div>
            <div className="text-2xl font-black text-secondary-900 dark:text-white">
              {formatINR(totalRevenueFromRepeat)}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-secondary-900 rounded-3xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {['ALL', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                  selectedTier === tier
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-secondary-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {tier === 'ALL' ? 'All Diners' : `${tier} Tier`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by guest name or phone..."
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-gray-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-secondary-800/80 text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Loyalty Tier & Points</th>
                <th className="py-3 px-4">Total Visits</th>
                <th className="py-3 px-4">Favorite Dish</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-800 font-medium text-secondary-800 dark:text-gray-200">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50/50 dark:hover:bg-secondary-800/50 transition">
                  <td className="py-3.5 px-4 font-bold text-secondary-900 dark:text-white">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs">
                        {cust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div>{cust.name}</div>
                        <div className="text-[10px] text-gray-400 font-normal">Last visit: {cust.lastVisit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-mono text-xs">{cust.phone}</div>
                    <div className="text-[10px] text-gray-400">{cust.email}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          cust.tier === 'Platinum'
                            ? 'bg-purple-50 text-purple-600 border-purple-200'
                            : cust.tier === 'Gold'
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200'
                        }`}
                      >
                        {cust.tier}
                      </span>
                      <span className="font-bold font-mono text-primary text-xs">
                        {cust.points} pts
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-xs">{cust.visits} orders</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
                      <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                      <span>{cust.favoriteItem}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-secondary-900 dark:text-white font-mono text-sm">
                    {formatINR(cust.totalSpend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

