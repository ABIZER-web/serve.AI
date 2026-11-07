import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatINR } from '../../utils/currency';
import { Users, QrCode, Share2, CheckCircle2, Copy, Check } from 'lucide-react';

export const SplitBillModal = ({ isOpen, onClose, order }) => {
  const [splitCount, setSplitCount] = useState(2);
  const [copiedPersonIndex, setCopiedPersonIndex] = useState(null);
  const [paidPersons, setPaidPersons] = useState({});

  if (!order) return null;

  const total = order.grandTotal || 0;
  const perPersonAmount = Math.ceil(total / splitCount);

  // Generate UPI string for each share
  const getUpiUrl = (amount) => {
    return `upi://pay?pa=foodhouse@okhdfcbank&pn=Food%20House&am=${amount}&cu=INR&tn=Split%20Order%20${order.orderNumber}`;
  };

  const handleCopyLink = (idx, amount) => {
    const link = getUpiUrl(amount);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).catch(() => {});
    }
    setCopiedPersonIndex(idx);
    setTimeout(() => setCopiedPersonIndex(null), 2000);
  };

  const togglePersonPaid = (idx) => {
    setPaidPersons((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const paidCount = Object.values(paidPersons).filter(Boolean).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Split Table Bill" maxWidth="max-w-md">
      <div className="space-y-4 font-sans text-xs">
        {/* Total Banner */}
        <div className="bg-gray-50 dark:bg-secondary-800 rounded-2xl p-4 border border-gray-100 dark:border-secondary-700 flex items-center justify-between">
          <div>
            <div className="text-gray-400 font-semibold">Total Table Bill</div>
            <div className="text-lg font-black text-secondary-900 dark:text-white">
              {formatINR(total)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-400 font-semibold">Each Person Pays</div>
            <div className="text-lg font-black text-primary">
              {formatINR(perPersonAmount)}
            </div>
          </div>
        </div>

        {/* Number of People Selector */}
        <div>
          <label className="font-bold text-gray-700 dark:text-gray-300 block mb-2">
            Split Equally Between
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setSplitCount(count)}
                className={`py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition ${
                  splitCount === count
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102'
                    : 'bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{count} People</span>
              </button>
            ))}
          </div>
        </div>

        {/* Per-person payment cards */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {Array.from({ length: splitCount }).map((_, idx) => {
            const isPaid = Boolean(paidPersons[idx]);
            const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
              getUpiUrl(perPersonAmount)
            )}`;

            return (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isPaid
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-secondary-850 border-gray-200 dark:border-secondary-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-secondary-800 p-1 border border-gray-100 dark:border-secondary-700 shadow-xs flex-shrink-0">
                    <img src={qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <div className="font-bold text-secondary-900 dark:text-white flex items-center gap-1.5">
                      <span>Person {idx + 1}</span>
                      {isPaid && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded-full">
                          Paid
                        </span>
                      )}
                    </div>
                    <div className="text-primary font-black text-xs">
                      {formatINR(perPersonAmount)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyLink(idx, perPersonAmount)}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-secondary-800 hover:bg-gray-200 text-gray-600 dark:text-gray-300 transition"
                    title="Copy UPI Payment Link"
                  >
                    {copiedPersonIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => togglePersonPaid(idx)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                      isPaid
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 dark:bg-secondary-800 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    {isPaid ? 'Settled' : 'Mark Paid'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress summary */}
        <div className="pt-2 border-t border-gray-100 dark:border-secondary-700 flex items-center justify-between">
          <span className="text-gray-500 font-medium">
            Settled: {paidCount} of {splitCount} shares
          </span>
          {paidCount === splitCount && (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bill Fully Settled!</span>
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
};

