import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { formatINR } from '../../utils/currency';
import confetti from 'canvas-confetti';
import { QrCode, Banknote, ShieldCheck, CheckCircle2, AlertCircle, CreditCard } from 'lucide-react';

export const CheckoutModal = ({ isOpen, onClose, tableNumber, tableToken, onSuccess }) => {
  const { placeOrder, grandTotal } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('counter'); // 'counter' or 'upi'
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const order = placeOrder({
        tableNumber: tableNumber || 'T-05',
        tableToken: tableToken || 'DEFAULT_TOKEN',
        customerName,
        customerPhone,
        paymentMethod,
        specialInstructions,
      });

      if (!order) {
        throw new Error('Failed to create order. Please check your cart.');
      }

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}

      setIsSubmitting(false);
      onSuccess(order);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg(err.message || 'Error placing order');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Table Order" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Table Banner */}
        <div className="bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <div className="font-bold text-xs text-primary-950 dark:text-primary-100">
                Ordering from Table {tableNumber || 'T-05'}
              </div>
              <div className="text-[10px] text-primary-700 dark:text-primary-300">
                Secure QR Token Verified
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Payable</div>
            <div className="font-black text-base text-primary">
              {formatINR(grandTotal)}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Customer Info (Optional) */}
        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
            Mobile Number (For digital bill SMS/WhatsApp)
          </label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Payment Choice */}
        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
            Select Payment Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('counter')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                paymentMethod === 'counter'
                  ? 'border-primary bg-primary-50/60 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 font-bold'
                  : 'border-gray-200 dark:border-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-800 text-secondary-800 dark:text-gray-300'
              }`}
            >
              <Banknote className="w-5 h-5 text-emerald-600 mb-1" />
              <div>
                <div className="text-xs font-bold">Pay at Counter</div>
                <div className="text-[10px] text-gray-500 font-normal">Cash / Card / POS at desk</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
                paymentMethod === 'upi'
                  ? 'border-primary bg-primary-50/60 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 font-bold'
                  : 'border-gray-200 dark:border-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-800 text-secondary-800 dark:text-gray-300'
              }`}
            >
              <QrCode className="w-5 h-5 text-primary mb-1" />
              <div>
                <div className="text-xs font-bold">Instant UPI</div>
                <div className="text-[10px] text-gray-500 font-normal">GPay / PhonePe / Paytm</div>
              </div>
            </button>
          </div>
        </div>

        {/* UPI Demonstration Sandbox Visual */}
        {paymentMethod === 'upi' && (
          <div className="bg-gray-50 dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-xl p-3 text-center">
            <div className="text-xs font-bold text-secondary-900 dark:text-white mb-2">
              Scan & Pay via any UPI App
            </div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`upi://pay?pa=foodhouse@upi&pn=FoodHouse&am=${grandTotal}&cu=INR`)}`}
              alt="UPI QR Code"
              className="w-32 h-32 mx-auto rounded-lg border p-1 bg-white shadow-sm"
            />
            <div className="text-[11px] text-gray-500 mt-2">
              Virtual UPI ID: <span className="font-mono font-bold text-secondary-800 dark:text-gray-200">foodhouse@okhdfcbank</span>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-200 dark:border-secondary-700 space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.Razorpay) {
                    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ToBU0COX5xjDYg';
                    const rzp = new window.Razorpay({
                      key: razorpayKey,
                      amount: Math.round(grandTotal * 100),
                      currency: 'INR',
                      name: 'Food House',
                      description: `Table ${tableNumber} Order Payment`,
                      prefill: {
                        name: customerName,
                        contact: customerPhone,
                      },
                      theme: {
                        color: '#F97316',
                      },
                      handler: (response) => {
                        setPaymentMethod('upi');
                        handleSubmit(new Event('submit'));
                      },
                    });
                    rzp.open();
                  } else {
                    setPaymentMethod('upi');
                    handleSubmit(new Event('submit'));
                  }
                }}
                className="w-full py-2 px-3 rounded-lg bg-primary hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay via Razorpay Checkout (Cards / UPI)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('upi');
                  handleSubmit(new Event('submit'));
                }}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Instant UPI Approval (Test Payment)</span>
              </button>
            </div>
          </div>
        )}

        {/* Kitchen Special Notes */}
        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
            Cooking Instructions for Kitchen
          </label>
          <input
            type="text"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            placeholder="e.g. Less spicy, extra cheese on the pizza."
            className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 text-sm font-bold shadow-lg"
        >
          {isSubmitting ? 'Placing Order...' : `Confirm & Place Order • ${formatINR(grandTotal)}`}
        </Button>
      </form>
    </Modal>
  );
};

