import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import {
  Users,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  Send,
  Clock,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const SharedCartDrawer = ({
  tableNumber,
  tableToken,
  currentGuestName,
  currentGuestAvatar,
  onOpenSplitBill,
  onOrderPlaced,
}) => {
  const {
    tableSessions,
    addSharedCartItem,
    removeSharedCartItem,
    updateSharedCartItemQty,
    submitSharedTableOrder,
  } = useRestaurant();

  const session = tableSessions[tableNumber] || {
    tableNumber,
    activeGuests: [],
    sharedCart: [],
    submittedRounds: [],
    totalBill: 0,
    paidAmount: 0,
    remainingBalance: 0,
  };

  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoundsHistory, setShowRoundsHistory] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const sharedCart = session.sharedCart || [];
  const submittedRounds = session.submittedRounds || [];
  const activeGuests = session.activeGuests || [];

  // Calculations for current round
  const roundSubtotal = sharedCart.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const roundTax = Math.round(roundSubtotal * 0.05); // 5% GST
  const roundGrandTotal = roundSubtotal + roundTax;
  const currentRoundNumber = submittedRounds.length + 1;

  const handleSubmitRound = (e) => {
    e.preventDefault();
    if (sharedCart.length === 0) return;
    if (isSubmitting) return; // Concurrency protection against simultaneous click

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const newOrder = submitSharedTableOrder(
        tableNumber,
        'counter',
        specialInstructions,
        currentGuestName || 'Table Guests'
      );

      if (!newOrder) {
        throw new Error('Failed to submit table order round. Please try again.');
      }

      setSpecialInstructions('');
      setIsSubmitting(false);
      if (onOrderPlaced) onOrderPlaced(newOrder);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error submitting table order');
    }
  };

  return (
    <div className="bg-white dark:bg-secondary-900 rounded-3xl p-5 border border-gray-100 dark:border-secondary-800 shadow-xl flex flex-col font-sans transition-all">
      {/* Session Top Banner: Table Number & Active Guests */}
      <div className="pb-4 border-b border-gray-100 dark:border-secondary-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-display font-bold text-lg text-secondary-900 dark:text-white">
              Table {tableNumber}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Live Session
            </span>
          </div>

          {/* Settle Bill Button */}
          <button
            onClick={onOpenSplitBill}
            className="px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-600 font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Table Bill</span>
          </button>
        </div>

        {/* Active Guests List */}
        <div className="bg-gray-50 dark:bg-secondary-800/80 p-2.5 rounded-xl border border-gray-100 dark:border-secondary-700 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                {activeGuests.length} Diner{activeGuests.length !== 1 ? 's' : ''} Connected:
              </span>
            </div>

            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {activeGuests.map((g) => (
                <span
                  key={g.id || g.name}
                  title={`${g.name} ${g.isHost ? '(Host)' : ''}`}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-secondary-700 text-xs shadow-xs border border-gray-200 dark:border-secondary-600"
                >
                  {g.avatar || '👤'}
                </span>
              ))}
              {activeGuests.length === 0 && (
                <span className="text-[11px] text-gray-400">You are the first</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-200/50 dark:border-secondary-700 text-[10px]">
            <span className="text-gray-400">Multiple phones on Table {tableNumber}:</span>
            <button
              type="button"
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({ title: `Join Table ${tableNumber}`, url }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(url);
                  alert(`Table ${tableNumber} link copied! Send it to your friend to order food together.`);
                }
              }}
              className="font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              <span>+ Invite Friend</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shared Cart Items */}
      <div className="py-3 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">
              Shared Cart (Round {currentRoundNumber})
            </h4>
            {sharedCart.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {sharedCart.reduce((s, i) => s + (i.quantity || 1), 0)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Live Synced
          </span>
        </div>

        {sharedCart.length === 0 ? (
          <div className="py-6 px-4 bg-gray-50 dark:bg-secondary-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-secondary-700 text-center my-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center mb-2">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-secondary-900 dark:text-white">
              Shared cart is empty
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Tap + Add on any dish to share with everyone at Table {tableNumber}.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 divide-y divide-gray-50 dark:divide-secondary-800/60">
            {sharedCart.map((item) => (
              <div
                key={item.cartItemId}
                className="pt-2 first:pt-0 flex items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <h5 className="font-bold text-xs text-secondary-900 dark:text-white truncate">
                      {item.name}
                    </h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-bold text-primary">
                        {formatINR(item.price)}
                      </span>
                      {item.variantName && item.variantName !== 'Standard' && (
                        <span className="text-[10px] text-gray-400 truncate">
                          • {item.variantName}
                        </span>
                      )}
                    </div>
                    {/* Guest Added Attribution Pill */}
                    <div className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-[10px] font-medium text-amber-800 dark:text-amber-300 border border-amber-200/50">
                      <span>{item.addedByAvatar || '👤'}</span>
                      <span>Added by {item.addedBy || 'Guest'}</span>
                    </div>
                  </div>
                </div>

                {/* Stepper */}
                <div className="flex items-center border border-gray-200 dark:border-secondary-700 rounded-lg bg-gray-50 dark:bg-secondary-800 p-0.5 flex-shrink-0">
                  <button
                    onClick={() => updateSharedCartItemQty(tableNumber, item.cartItemId, -1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-secondary-700"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-bold text-secondary-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateSharedCartItemQty(tableNumber, item.cartItemId, 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-secondary-700"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Round Totals & Submission */}
        {sharedCart.length > 0 && (
          <form onSubmit={handleSubmitRound} className="mt-3 pt-3 border-t border-gray-100 dark:border-secondary-800 space-y-2.5">
            <div>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Kitchen notes (e.g. less spicy, extra dip)..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-400"
              />
            </div>

            <div className="space-y-1 text-xs text-gray-500 py-1">
              <div className="flex justify-between">
                <span>Round Subtotal:</span>
                <span className="font-semibold text-secondary-900 dark:text-white">{formatINR(roundSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span className="font-semibold text-secondary-900 dark:text-white">{formatINR(roundTax)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-secondary-900 dark:text-white pt-1 border-t border-gray-100 dark:border-secondary-800">
                <span>Round Total:</span>
                <span className="text-primary font-black">{formatINR(roundGrandTotal)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full font-bold shadow-md flex items-center justify-center gap-2"
              size="md"
            >
              {isSubmitting ? (
                <span>Submitting to Kitchen...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Round {currentRoundNumber} to Kitchen</span>
                </>
              )}
            </Button>
          </form>
        )}
      </div>

      {/* Previously Submitted Table Orders History (Rounds) */}
      {submittedRounds.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-secondary-800">
          <button
            type="button"
            onClick={() => setShowRoundsHistory(!showRoundsHistory)}
            className="w-full flex items-center justify-between text-xs font-bold text-secondary-900 dark:text-white py-1"
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Table Order History ({submittedRounds.length} Round{submittedRounds.length > 1 ? 's' : ''})</span>
            </div>
            {showRoundsHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showRoundsHistory && (
            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto pr-1">
              {submittedRounds.map((round) => (
                <div
                  key={round.orderNumber || round.roundNumber}
                  className="bg-gray-50 dark:bg-secondary-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-secondary-700 text-xs"
                >
                  <div className="flex items-center justify-between font-bold pb-1.5 border-b border-gray-200/60 dark:border-secondary-700">
                    <span className="text-secondary-900 dark:text-white">
                      Round {round.roundNumber} ({round.orderNumber})
                    </span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                      {round.status || 'Preparing'}
                    </span>
                  </div>

                  <div className="py-1 space-y-0.5 text-gray-600 dark:text-gray-300">
                    {round.items?.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span>
                          {it.quantity}x {it.name} <span className="text-gray-400">({it.orderedBy || 'Guest'})</span>
                        </span>
                        <span className="font-semibold">{formatINR(it.totalPrice)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between font-bold pt-1 border-t border-gray-200/50 dark:border-secondary-700 text-secondary-900 dark:text-white">
                    <span>Round Total:</span>
                    <span>{formatINR(round.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bill Settlement Summary Footer */}
      {(session.totalBill > 0 || submittedRounds.length > 0) && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-secondary-800 bg-primary-50/50 dark:bg-primary-950/20 p-3 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-500 font-semibold">Total Table Bill</div>
            <div className="text-lg font-black text-secondary-900 dark:text-white">
              {formatINR(session.totalBill)}
            </div>
            {session.paidAmount > 0 && (
              <div className="text-[10px] text-emerald-600 font-bold">
                Paid: {formatINR(session.paidAmount)} • Balance: {formatINR(session.remainingBalance)}
              </div>
            )}
          </div>

          <button
            onClick={onOpenSplitBill}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 active:scale-95 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Pay / Split</span>
          </button>
        </div>
      )}
    </div>
  );
};

