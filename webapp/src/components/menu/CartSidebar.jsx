import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, CreditCard, Clock, CheckCircle2, ChefHat, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { CheckoutModal } from './CheckoutModal';
import { PayAtTableModal } from '../tables/PayAtTableModal';

export const CartSidebar = ({ tableNumber, tableToken, onOrderPlaced, currentGuestName = 'You' }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    taxableAmount,
    discountAmount,
    cgstAmount,
    sgstAmount,
    grandTotal,
    totalItemCount,
  } = useCart();

  const { tableSessions } = useRestaurant();
  const session = tableSessions[tableNumber];
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isPayAtTableOpen, setIsPayAtTableOpen] = useState(false);

  const submittedRounds = session?.submittedRounds || [];

  if (cart.length === 0 && submittedRounds.length === 0) {
    return (
      <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-gray-100 dark:border-secondary-800 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary mb-3">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h4 className="font-bold text-base text-secondary-900 dark:text-white">Your Cart is Empty</h4>
        <p className="text-gray-400 text-xs mt-1 max-w-[200px]">
          Explore our delicious menu items and tap Add to build your table order.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm flex flex-col h-fit font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-secondary-800">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base text-secondary-900 dark:text-white">
            Table {tableNumber || 'T-05'} Cart
          </h3>
          {totalItemCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
              {totalItemCount}
            </span>
          )}
        </div>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-red-500 hover:text-red-600 font-semibold transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Cart Items List (New Round) */}
      {cart.length > 0 ? (
        <div className="py-3 space-y-3 max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-secondary-800/60">
          {cart.map((item) => (
            <div key={item.cartItemId} className="pt-2.5 first:pt-0 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <h5 className="font-bold text-xs text-secondary-900 dark:text-white truncate">
                    {item.name}
                  </h5>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-gray-500">
                      {formatINR(item.unitPrice)}
                    </span>
                    <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.2 rounded-md">
                      {item.addedBy || currentGuestName}
                    </span>
                  </div>
                  {item.variantName && item.variantName !== 'Standard' && (
                    <span className="text-[10px] text-gray-400 block -mt-0.5 truncate">
                      {item.variantName}
                    </span>
                  )}
                </div>
              </div>

              {/* Stepper & Delete */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center border border-gray-200 dark:border-secondary-700 rounded-lg bg-gray-50 dark:bg-secondary-800 p-0.5">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-secondary-700"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-secondary-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="w-6 h-6 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-secondary-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="text-gray-400 hover:text-red-500 p-1 transition"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-gray-400">
          Ready to order another round? Add items above.
        </div>
      )}

      {/* Previously Submitted Table Rounds */}
      {submittedRounds.length > 0 && (
        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-secondary-800">
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
            <span className="flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-primary" />
              <span>Table Orders Cooking / Served</span>
            </span>
            <span className="text-[10px] text-gray-400">{submittedRounds.length} Rounds</span>
          </div>

          <div className="space-y-2 max-h-36 overflow-y-auto">
            {submittedRounds.map((rnd, idx) => (
              <div
                key={idx}
                className="p-2 rounded-xl bg-gray-50 dark:bg-secondary-800 text-[11px] flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-secondary-900 dark:text-white block">
                    Round #{rnd.round || idx + 1} ({rnd.items?.length || 1} items)
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {rnd.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </span>
                </div>
                <span className="font-bold text-primary">
                  {formatINR(rnd.subtotal || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bill Breakdown Matching UI Reference */}
      {cart.length > 0 && (
        <div className="border-t border-gray-100 dark:border-secondary-800 pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Subtotal (New Items)</span>
            <span className="font-semibold text-secondary-800 dark:text-gray-200">
              {formatINR(subtotal)}
            </span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Special Offer Discount</span>
              <span>-{formatINR(discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Tax (5% GST: CGST + SGST)</span>
            <span className="font-semibold text-secondary-800 dark:text-gray-200">
              {formatINR(cgstAmount + sgstAmount)}
            </span>
          </div>

          <div className="flex justify-between text-sm font-extrabold text-secondary-900 dark:text-white pt-2 border-t border-gray-100 dark:border-secondary-800">
            <span>Total for this Round</span>
            <span className="text-primary text-base font-black">
              {formatINR(grandTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Place Order CTA Button */}
      {cart.length > 0 && (
        <Button
          onClick={() => setIsCheckoutOpen(true)}
          className="w-full mt-4 py-3 font-bold text-sm shadow-md"
        >
          <span>Send Order to Kitchen</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      )}

      {/* Pay at Table Action */}
      {submittedRounds.length > 0 && (
        <button
          onClick={() => setIsPayAtTableOpen(true)}
          className="w-full mt-2 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pay at Table (UPI / Split Bill)</span>
        </button>
      )}

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        tableNumber={tableNumber}
        tableToken={tableToken}
        onSuccess={(createdOrder) => {
          setIsCheckoutOpen(false);
          if (onOrderPlaced) onOrderPlaced(createdOrder);
        }}
      />

      {/* Pay At Table Modal */}
      <PayAtTableModal
        isOpen={isPayAtTableOpen}
        onClose={() => setIsPayAtTableOpen(false)}
        tableNumber={tableNumber || 'T-05'}
        guestName={currentGuestName}
      />
    </div>
  );
};

