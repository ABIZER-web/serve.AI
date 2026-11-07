import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import {
  Tag,
  Gift,
  Award,
  Users,
  Star,
  Plus,
  Percent,
  CheckCircle2,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LoyaltyPromotions = () => {
  const { loyalty, reviews } = useRestaurant();
  const [coupons, setCoupons] = useState(loyalty.coupons || []);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newDiscountPct, setNewDiscountPct] = useState(15);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Mock CRM Customer Database
  const crmCustomers = [
    { name: 'Rahul Sharma', phone: '+91 99887 76655', tier: 'Gold', points: 240, visits: 8, totalSpend: 5420 },
    { name: 'Priya Patel', phone: '+91 98112 33445', tier: 'Silver', points: 110, visits: 3, totalSpend: 1840 },
    { name: 'Amit Verma', phone: '+91 97234 56789', tier: 'Platinum', points: 680, visits: 19, totalSpend: 14290 },
    { name: 'Kavita Iyer', phone: '+91 98334 11229', tier: 'Gold', points: 310, visits: 9, totalSpend: 6150 },
  ];

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCouponCode) return;
    const newC = {
      code: newCouponCode.toUpperCase(),
      title: `${newDiscountPct}% Off Table Orders`,
      discountPct: Number(newDiscountPct),
      minAmount: 300,
    };
    setCoupons([...coupons, newC]);
    setIsCouponModalOpen(false);
    setNewCouponCode('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
            Loyalty, Discounts & CRM
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Reward repeat diners with cashback points, manage promo vouchers & track customer reviews.
          </p>
        </div>

        <Button
          onClick={() => setIsCouponModalOpen(true)}
          variant="primary"
          icon={Plus}
          className="text-xs font-bold"
        >
          Create Promo Code
        </Button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-secondary-900 p-5 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cashback Rate</div>
            <div className="text-2xl font-black text-secondary-900 dark:text-white">10% Points Back</div>
            <div className="text-[10px] text-gray-400">1 pt = ₹1 on next bill</div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 p-5 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Promo Codes</div>
            <div className="text-2xl font-black text-secondary-900 dark:text-white">{coupons.length} Active</div>
            <div className="text-[10px] text-emerald-600 font-bold">Auto-applied in cart</div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 p-5 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Guest Satisfaction</div>
            <div className="text-2xl font-black text-secondary-900 dark:text-white">4.8 / 5.0</div>
            <div className="text-[10px] text-gray-400">From {reviews.length + 42} verified reviews</div>
          </div>
        </div>
      </div>

      {/* Promo Codes Section */}
      <div className="bg-white dark:bg-secondary-900 rounded-3xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-secondary-900 dark:text-white flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary" />
          <span>Active Restaurant Discount Coupons</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {coupons.map((c, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-primary/20 bg-primary/5 dark:bg-primary/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm text-primary tracking-wider">
                    {c.code}
                  </span>
                  <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>
                <div className="text-xs font-bold text-secondary-900 dark:text-white mt-1">
                  {c.title}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  Min order: {formatINR(c.minAmount || 300)}
                </div>
              </div>

              <div className="text-[10px] text-primary font-bold mt-3">
                Used 84 times this month
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer CRM Directory */}
      <div className="bg-white dark:bg-secondary-900 rounded-3xl border border-gray-100 dark:border-secondary-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-secondary-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-secondary-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>Customer Loyalty CRM Directory</span>
          </h3>
          <span className="text-xs text-gray-400">Total Registered Members: 280+</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 dark:bg-secondary-800 text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-5">Customer Name</th>
                <th className="py-3 px-5">Phone Number</th>
                <th className="py-3 px-5">Loyalty Tier</th>
                <th className="py-3 px-5">Points Balance</th>
                <th className="py-3 px-5">Visits Count</th>
                <th className="py-3 px-5 text-right">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-800 font-medium text-secondary-800 dark:text-gray-200">
              {crmCustomers.map((cust, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-secondary-800/50 transition">
                  <td className="py-3.5 px-5 font-bold text-secondary-900 dark:text-white">
                    {cust.name}
                  </td>
                  <td className="py-3.5 px-5 font-mono">{cust.phone}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        cust.tier === 'Platinum'
                          ? 'bg-purple-50 text-purple-600 border-purple-200'
                          : cust.tier === 'Gold'
                          ? 'bg-amber-50 text-amber-600 border-amber-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      {cust.tier} Member
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-black text-primary font-mono">
                    {cust.points} pts
                  </td>
                  <td className="py-3.5 px-5">{cust.visits} visits</td>
                  <td className="py-3.5 px-5 text-right font-black text-secondary-900 dark:text-white font-mono">
                    {formatINR(cust.totalSpend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Review Sentiment Feed */}
      <div className="bg-white dark:bg-secondary-900 rounded-3xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-secondary-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span>Recent Verified Table Reviews & Sentiment</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-2xl border border-gray-100 dark:border-secondary-800 bg-gray-50/50 dark:bg-secondary-850 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-1">
                  <span className="font-bold text-xs text-secondary-900 dark:text-white">
                    {rev.customerName}
                  </span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 italic mt-1 leading-relaxed">
                  "{rev.comment}"
                </p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {rev.tags?.map((t, i) => (
                    <span
                      key={i}
                      className="text-[9px] bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-gray-200/60 dark:border-secondary-700">
                Verified Order #{rev.orderNumber}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 max-w-sm w-full border border-gray-100 dark:border-secondary-800 shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-secondary-900 dark:text-white">
              Create Discount Promo Code
            </h4>

            <form onSubmit={handleAddCoupon} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value)}
                  placeholder="e.g. FESTIVE25"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={newDiscountPct}
                  onChange={(e) => setNewDiscountPct(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 text-xs font-bold">
                  Activate Code
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

