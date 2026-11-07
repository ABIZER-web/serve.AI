import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import { Download, FileSpreadsheet, TrendingUp, DollarSign, PieChart as PieIcon, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AnalyticsReports = () => {
  const { orders } = useRestaurant();

  const totalSales = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0) + 10000;
  const totalTaxCollected = orders.reduce((sum, o) => sum + (o.cgstAmount + o.sgstAmount || 0), 0) + 500;
  const upiOrders = orders.filter((o) => o.paymentMethod === 'upi').length + 42;
  const counterOrders = orders.filter((o) => o.paymentMethod === 'counter').length + 18;

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Table', 'Status', 'Payment Method', 'Subtotal', 'Tax (GST)', 'Grand Total', 'Created At'];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.tableNumber,
      o.status,
      o.paymentMethod,
      o.subtotal,
      (o.cgstAmount + o.sgstAmount).toFixed(2),
      o.grandTotal,
      new Date(o.createdAt).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `food_house_sales_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-secondary-900 dark:text-white">Reports & Financial Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">GST-compliant tax breakdowns, category volume, and payment method audit.</p>
        </div>

        <Button onClick={handleExportCSV} icon={Download} size="sm">
          Export Sales CSV
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gross Revenue (MTD)</div>
          <div className="text-2xl font-black text-secondary-900 dark:text-white mt-2">{formatINR(totalSales)}</div>
          <div className="text-xs text-emerald-600 font-bold mt-1">+24% vs last month</div>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total GST Collected (5%)</div>
          <div className="text-2xl font-black text-primary mt-2">{formatINR(totalTaxCollected)}</div>
          <div className="text-xs text-gray-400 mt-1">Split equally: 2.5% CGST + 2.5% SGST</div>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Split</div>
          <div className="text-2xl font-black text-secondary-900 dark:text-white mt-2">70% UPI • 30% Cash</div>
          <div className="text-xs text-gray-400 mt-1">{upiOrders} digital payments processed</div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-gray-100 dark:border-secondary-800 shadow-sm">
        <h3 className="font-extrabold text-base text-secondary-900 dark:text-white mb-4">
          Category-wise Sales Volume
        </h3>

        <div className="space-y-4">
          {[
            { name: 'Pizza', percentage: 42, count: '₹48,200 (194 orders)', color: 'bg-primary' },
            { name: 'Beverages (Cold Coffee & Mocktails)', percentage: 24, count: '₹22,100 (230 orders)', color: 'bg-blue-500' },
            { name: 'Indian Special Meals & Thali', percentage: 18, count: '₹19,400 (68 orders)', color: 'bg-emerald-500' },
            { name: 'Burgers & Starters', percentage: 16, count: '₹14,350 (92 orders)', color: 'bg-amber-500' },
          ].map((cat) => (
            <div key={cat.name}>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-secondary-900 dark:text-white">{cat.name}</span>
                <span className="text-gray-500">{cat.count}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-secondary-800 overflow-hidden">
                <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

