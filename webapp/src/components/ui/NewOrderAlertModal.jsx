import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { speechService } from '../../lib/speechService';
import { Volume2, UtensilsCrossed, Clock } from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const NewOrderAlertModal = () => {
  const { activeNewOrderModal, setActiveNewOrderModal, acceptOrder, startPreparing, rejectOrder } = useRestaurant();

  if (!activeNewOrderModal) return null;

  const order = activeNewOrderModal;

  const handleReplayVoice = () => {
    speechService.announceOrder(order, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-secondary-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-primary/30 transform transition-all animate-scale-up">
        {/* Header Banner */}
        <div className="bg-secondary-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold tracking-wide text-xs uppercase text-primary">New Order Alert</span>
          </div>
          <button
            onClick={handleReplayVoice}
            className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-white transition"
            title="Replay Voice Announcement"
          >
            <Volume2 className="w-3.5 h-3.5 text-primary-400" />
            <span>Replay Voice</span>
          </button>
        </div>

        {/* Order Details Body */}
        <div className="p-6">
          <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-secondary-800">
            <div>
              <div className="text-2xl font-black text-secondary-900 dark:text-white">
                Order #{order.orderNumber}
              </div>
              <div className="text-base font-bold text-primary mt-0.5">
                Table {order.tableNumber}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black text-secondary-900 dark:text-white">
                {formatINR(order.grandTotal)}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 justify-end mt-1">
                <Clock className="w-3 h-3" />
                <span>Just now</span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="py-4 space-y-2.5 max-h-48 overflow-y-auto">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm font-medium">
                <div className="flex items-center gap-2 text-secondary-800 dark:text-gray-200">
                  <span className="w-6 h-6 rounded-md bg-primary-100 dark:bg-primary-950/60 text-primary font-bold flex items-center justify-center text-xs">
                    {item.quantity}x
                  </span>
                  <span>{item.name}</span>
                  {item.variantName && item.variantName !== 'Standard' && (
                    <span className="text-xs text-gray-400">({item.variantName})</span>
                  )}
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold">
                  {formatINR(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Customer Special Instructions */}
          {order.specialInstructions && (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-3 mb-4 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-bold">Instructions: </span>
              "{order.specialInstructions}"
            </div>
          )}

          {/* Action Buttons Matching Reference UI */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={() => acceptOrder(order.id)}
              className="py-3 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-sm active:scale-95"
            >
              Accept
            </button>
            <button
              onClick={() => startPreparing(order.id)}
              className="py-3 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-sm active:scale-95"
            >
              Preparing
            </button>
            <button
              onClick={() => rejectOrder(order.id)}
              className="py-3 px-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm transition shadow-sm active:scale-95"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

