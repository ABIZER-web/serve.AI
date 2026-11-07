import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import {
  CreditCard,
  QrCode,
  Users,
  CheckCircle2,
  DollarSign,
  Receipt,
  Smartphone,
  ShieldCheck,
  Check,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PayAtTableModal = ({ isOpen, onClose, tableNumber, guestName = 'Diner' }) => {
  const { tableSessions, recordPartialPayment, restaurant } = useRestaurant();
  const session = tableSessions[tableNumber];

  const totalBill = session?.totalBill || 690;
  const paidAmount = session?.paidAmount || 0;
  const remainingBalance = Math.max(0, session?.remainingBalance !== undefined ? session.remainingBalance : totalBill - paidAmount);

  const [paymentMode, setPaymentMode] = useState('full'); // 'full' | 'equal' | 'itemized' | 'custom'
  const [equalSplitCount, setEqualSplitCount] = useState(2);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customAmount, setCustomAmount] = useState(Math.min(remainingBalance, 300));
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card'
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastPayment, setLastPayment] = useState(null);

  // Calculate payable amount based on selected mode
  let payableAmount = remainingBalance;
  if (paymentMode === 'full') {
    payableAmount = remainingBalance;
  } else if (paymentMode === 'equal') {
    payableAmount = Math.ceil(remainingBalance / equalSplitCount);
  } else if (paymentMode === 'custom') {
    payableAmount = Number(customAmount) || 0;
  } else if (paymentMode === 'itemized') {
    payableAmount = selectedItems.reduce((acc, item) => acc + item.totalPrice, 0);
  }

  // All ordered items across all submitted rounds
  const allOrderedItems = session?.submittedRounds?.flatMap((r) => r.items) || [];

  const handleToggleItem = (item) => {
    if (selectedItems.some((i) => i.name === item.name)) {
      setSelectedItems(selectedItems.filter((i) => i.name !== item.name));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (payableAmount <= 0) return;

    if (paymentMethod === 'card' && typeof window !== 'undefined' && window.Razorpay) {
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ToBU0COX5xjDYg';
      try {
        const rzp = new window.Razorpay({
          key: razorpayKey,
          amount: Math.round(payableAmount * 100),
          currency: 'INR',
          name: restaurant.name || 'Food House',
          description: `Table ${tableNumber} Payment`,
          prefill: {
            name: guestName || 'Guest',
          },
          theme: {
            color: '#F97316',
          },
          handler: (response) => {
            const record = recordPartialPayment(
              tableNumber,
              payableAmount,
              guestName,
              'card'
            );
            setLastPayment(record);
            setIsSuccess(true);
            try {
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            } catch (e) {}
          },
        });
        rzp.open();
        return;
      } catch (err) {
        console.warn('Razorpay open failed, continuing with direct confirmation:', err);
      }
    }

    const record = recordPartialPayment(
      tableNumber,
      payableAmount,
      guestName,
      paymentMethod
    );

    setLastPayment(record);
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const upiUrl = `upi://pay?pa=cafehighfive@okhdfcbank&pn=${encodeURIComponent(restaurant.name)}&am=${payableAmount}&cu=INR&tn=Table%20${tableNumber}%20Bill`;
  const upiQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pay at Table ${tableNumber}`} maxWidth="max-w-md">
      {isSuccess ? (
        <div className="py-6 text-center space-y-4 font-sans text-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="font-display text-2xl font-bold text-secondary-900 dark:text-white">
            Payment Confirmed!
          </h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            Received <strong>{formatINR(payableAmount)}</strong> from <strong>{guestName}</strong> via {paymentMethod.toUpperCase()}.
          </p>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 text-left space-y-1.5">
            <div className="flex justify-between text-gray-500">
              <span>Total Table Bill:</span>
              <span className="font-bold text-secondary-900 dark:text-white">{formatINR(totalBill)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Paid So Far:</span>
              <span>{formatINR(paidAmount + payableAmount)}</span>
            </div>
            <div className="flex justify-between text-secondary-900 dark:text-white font-extrabold pt-1 border-t border-gray-200 dark:border-secondary-700">
              <span>Remaining Balance:</span>
              <span className="text-primary">{formatINR(Math.max(0, remainingBalance - payableAmount))}</span>
            </div>
          </div>

          <Button onClick={onClose} variant="primary" className="w-full font-bold">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleProcessPayment} className="space-y-4 font-sans text-xs">
          {/* Bill Summary Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-secondary-900 dark:to-secondary-800 border border-amber-200 dark:border-secondary-700 flex items-center justify-between">
            <div>
              <div className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                Total Table Bill
              </div>
              <div className="text-xl font-black text-secondary-900 dark:text-white">
                {formatINR(totalBill)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">
                Remaining Due
              </div>
              <div className="text-xl font-black text-primary">
                {formatINR(remainingBalance)}
              </div>
            </div>
          </div>

          {/* Payment Split Modes */}
          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
              Choose How to Pay
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMode('full')}
                className={`p-2.5 rounded-xl border text-left font-bold transition ${
                  paymentMode === 'full'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-secondary-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <div>Pay Full Bill</div>
                <div className="text-[10px] font-normal text-gray-400">{formatINR(remainingBalance)}</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('equal')}
                className={`p-2.5 rounded-xl border text-left font-bold transition ${
                  paymentMode === 'equal'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-secondary-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <div>Split Equally</div>
                <div className="text-[10px] font-normal text-gray-400">Share with friends</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('itemized')}
                className={`p-2.5 rounded-xl border text-left font-bold transition ${
                  paymentMode === 'itemized'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-secondary-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <div>Pay My Items</div>
                <div className="text-[10px] font-normal text-gray-400">Pick dishes you ate</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode('custom')}
                className={`p-2.5 rounded-xl border text-left font-bold transition ${
                  paymentMode === 'custom'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-200 dark:border-secondary-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                <div>Custom Amount</div>
                <div className="text-[10px] font-normal text-gray-400">Pay partial sum</div>
              </button>
            </div>
          </div>

          {/* Equal Split selector */}
          {paymentMode === 'equal' && (
            <div className="p-3 bg-gray-50 dark:bg-secondary-800 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700 dark:text-gray-300">Split Between</span>
                <span className="font-bold text-primary">{equalSplitCount} Guests</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[2, 3, 4, 5].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setEqualSplitCount(count)}
                    className={`py-1.5 rounded-lg font-bold text-xs transition ${
                      equalSplitCount === count
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-secondary-700 border text-gray-600'
                    }`}
                  >
                    {count} Diners
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Itemized split picker */}
          {paymentMode === 'itemized' && (
            <div className="p-3 bg-gray-50 dark:bg-secondary-800 rounded-xl space-y-2 max-h-48 overflow-y-auto">
              <div className="font-bold text-gray-700 dark:text-gray-300 text-[11px] mb-1">
                Select items you are paying for:
              </div>
              {allOrderedItems.map((item, idx) => {
                const isChecked = selectedItems.some((i) => i.name === item.name);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleItem(item)}
                    className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition ${
                      isChecked
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'bg-white dark:bg-secondary-700 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-primary border-primary text-white' : 'border-gray-300'}`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span>{item.quantity}x {item.name}</span>
                    </div>
                    <span>{formatINR(item.totalPrice)}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom amount input */}
          {paymentMode === 'custom' && (
            <div className="p-3 bg-gray-50 dark:bg-secondary-800 rounded-xl space-y-1.5">
              <label className="font-bold text-gray-700 dark:text-gray-300 block">
                Enter Amount to Pay (₹)
              </label>
              <input
                type="number"
                min="10"
                max={remainingBalance}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full text-base font-black px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white"
              />
            </div>
          )}

          {/* Payment Method Selector (UPI vs Card / Apple Pay) */}
          <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-secondary-800">
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-700 dark:text-gray-300">You Are Paying</span>
              <span className="text-base font-black text-primary">{formatINR(payableAmount)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  paymentMethod === 'upi'
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-gray-200 dark:border-secondary-700 bg-gray-50 dark:bg-secondary-800 text-gray-600'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>UPI / GPay / PhonePe</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary text-white shadow-xs'
                    : 'border-gray-200 dark:border-secondary-700 bg-gray-50 dark:bg-secondary-800 text-gray-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card / Tap to Pay</span>
              </button>
            </div>
          </div>

          {/* UPI QR Display */}
          {paymentMethod === 'upi' && (
            <div className="text-center p-3 bg-gray-50 dark:bg-secondary-800 rounded-2xl border border-gray-200 dark:border-secondary-700 space-y-2">
              <img src={upiQrCode} alt="UPI QR" className="w-32 h-32 mx-auto rounded-xl border" />
              <div className="text-[10px] text-gray-500">
                Scan with any UPI app on your phone to complete payment.
              </div>
            </div>
          )}

          {/* Submit */}
          <Button type="submit" variant="primary" className="w-full py-3.5 font-bold text-sm shadow-md">
            <span>Confirm & Pay {formatINR(payableAmount)}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>
      )}
    </Modal>
  );
};
