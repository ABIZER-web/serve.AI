import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import { InvoiceModal } from '../../components/billing/InvoiceModal';
import { SplitBillModal } from '../../components/billing/SplitBillModal';
import { CustomerFeedbackModal } from '../../components/menu/CustomerFeedbackModal';
import { CallWaiterModal } from '../../components/menu/CallWaiterModal';
import { formatINR } from '../../utils/currency';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Receipt,
  UtensilsCrossed,
  ArrowLeft,
  Sparkles,
  Users,
  Star,
  Bell,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { orders, restaurant } = useRestaurant();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState(false);

  // Find order in store
  const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId) || orders[0];

  const steps = [
    { key: 'placed', label: 'Placed' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'served', label: 'Served' },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'accepted': return 1;
      case 'preparing': return 2;
      case 'ready': return 3;
      case 'served':
      case 'completed': return 4;
      default: return 0;
    }
  };

  const currentStep = getStepIndex(order?.status || 'preparing');

  return (
    <div className="min-h-screen bg-background text-secondary-900 dark:text-white pb-16 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-secondary-900/95 backdrop-blur-md border-b border-gray-100 dark:border-secondary-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            to={`/r/${restaurant.slug}/table/${order?.tableNumber || 'T-05'}`}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Menu</span>
          </Link>
          <span className="font-extrabold text-sm tracking-tight text-secondary-900 dark:text-white">
            {restaurant.name}
          </span>
          <button
            onClick={() => setIsCallWaiterOpen(true)}
            className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold flex items-center gap-1"
          >
            <Bell className="w-3 h-3 text-primary animate-bounce" />
            <span>Waiter</span>
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Order Header Card Matching UI Reference */}
        <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-gray-100 dark:border-secondary-800 shadow-sm text-center">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-primary bg-primary-50 dark:bg-primary-950/50 px-3 py-1 rounded-full">
            Live Order Status
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight mt-3">
            Track Your <span className="font-bold">Order</span>
          </h1>
          <div className="text-sm font-bold text-gray-500 mt-1">
            Order #{order?.orderNumber} • Table {order?.tableNumber}
          </div>

          {/* Progress Timeline Matching UI Reference (Placed -> Accepted -> Preparing -> Ready -> Served) */}
          <div className="mt-8 relative px-2">
            <div className="flex items-center justify-between relative z-10">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isPassed
                          ? 'bg-primary text-white shadow-md shadow-primary/25 scale-110'
                          : 'bg-gray-100 dark:bg-secondary-800 text-gray-400'
                      }`}
                    >
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] mt-2 font-bold transition ${
                        isCurrent
                          ? 'text-primary'
                          : isPassed
                          ? 'text-secondary-900 dark:text-white'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Connecting Bar */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-gray-100 dark:bg-secondary-800 -z-0">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Animated Preparation Card Matching UI Reference */}
        <div className="bg-gradient-to-b from-amber-50 to-orange-50/40 dark:from-secondary-900 dark:to-secondary-800/60 rounded-3xl p-6 border border-amber-200/60 dark:border-secondary-800 text-center relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-white dark:bg-secondary-800 shadow-md mx-auto flex items-center justify-center text-primary mb-3 relative">
            <ChefHat className="w-10 h-10 animate-bounce" />
            <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1" />
          </div>

          <h3 className="font-display italic text-xl font-normal text-secondary-900 dark:text-white">
            {order?.status === 'ready'
              ? 'Your food is ready!'
              : order?.status === 'served'
              ? 'Food has been served. Enjoy your meal!'
              : 'Your food is being prepared!'}
          </h3>

          <div className="flex items-center justify-center gap-1.5 text-xs text-primary font-bold mt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {order?.status === 'ready'
                ? 'Ready for pickup / table service'
                : `Estimated time: ${order?.estimatedPrepTimeMinutes || 15} min`}
            </span>
          </div>
        </div>

        {/* Items Summary Card */}
        <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-gray-100 dark:border-secondary-800 shadow-sm">
          <h4 className="font-bold text-sm text-secondary-900 dark:text-white mb-3">
            Ordered Items
          </h4>
          <div className="space-y-3 divide-y divide-gray-100 dark:divide-secondary-800">
            {order?.items?.map((item, idx) => (
              <div key={idx} className="pt-2 first:pt-0 flex justify-between items-center text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-primary-100 dark:bg-primary-950/60 text-primary font-bold flex items-center justify-center text-[11px]">
                    {item.quantity}x
                  </span>
                  <span className="font-bold text-secondary-900 dark:text-white">{item.name}</span>
                  {item.variantName && item.variantName !== 'Standard' && (
                    <span className="text-gray-400">({item.variantName})</span>
                  )}
                </div>
                <span className="font-bold text-secondary-900 dark:text-white">
                  {formatINR(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 dark:border-secondary-800 pt-3 mt-4 flex justify-between items-center text-sm font-black">
            <span>Grand Total</span>
            <span className="text-primary text-base">{formatINR(order?.grandTotal)}</span>
          </div>
        </div>

        {/* Action Controls Grid (Tax Invoice, Split Bill, Review Experience, Order More) */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setIsInvoiceOpen(true)}
            variant="outline"
            size="md"
            icon={Receipt}
            className="w-full font-bold text-xs"
          >
            Tax Invoice (PDF)
          </Button>

          <Button
            onClick={() => setIsSplitBillOpen(true)}
            variant="outline"
            size="md"
            icon={Users}
            className="w-full font-bold text-xs"
          >
            Split Bill
          </Button>

          <Button
            onClick={() => setIsFeedbackOpen(true)}
            variant="outline"
            size="md"
            icon={Star}
            className="w-full font-bold text-xs"
          >
            Rate & Win Reward
          </Button>

          <Link to={`/r/${restaurant.slug}/table/${order?.tableNumber || 'T-05'}`}>
            <Button variant="primary" size="md" icon={UtensilsCrossed} className="w-full font-bold text-xs">
              Order More
            </Button>
          </Link>
        </div>
      </main>

      {/* Tax Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
        restaurant={restaurant}
      />

      {/* Split Bill Modal */}
      <SplitBillModal
        isOpen={isSplitBillOpen}
        onClose={() => setIsSplitBillOpen(false)}
        order={order}
      />

      {/* Customer Feedback & Rewards Modal */}
      <CustomerFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        order={order}
      />

      {/* Call Waiter Modal */}
      <CallWaiterModal
        isOpen={isCallWaiterOpen}
        onClose={() => setIsCallWaiterOpen(false)}
        tableNumber={order?.tableNumber || 'T-05'}
      />
    </div>
  );
};
