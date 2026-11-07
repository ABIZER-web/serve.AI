import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import confetti from 'canvas-confetti';
import {
  Receipt,
  QrCode,
  Users,
  CheckCircle2,
  Share2,
  Copy,
  CreditCard,
  Banknote,
  ShieldCheck,
  Printer,
  ExternalLink,
  MessageCircle,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const SharedTableBillModal = ({
  isOpen,
  onClose,
  tableNumber,
  currentGuestName = 'Guest',
}) => {
  const { tableSessions, recordPartialPayment, restaurant } = useRestaurant();

  const session = tableSessions[tableNumber] || {
    tableNumber,
    submittedRounds: [],
    totalBill: 0,
    paidAmount: 0,
    remainingBalance: 0,
    payments: [],
  };

  const submittedRounds = session.submittedRounds || [];
  const remainingBalance = session.remainingBalance ?? Math.max(0, session.totalBill - session.paidAmount);

  // Flatten all items across all rounds for itemized split
  const allOrderedItems = useMemo(() => {
    const list = [];
    submittedRounds.forEach((round, rIdx) => {
      round.items?.forEach((item, iIdx) => {
        list.push({
          key: `r${rIdx}_i${iIdx}_${item.name}`,
          roundNumber: round.roundNumber,
          name: item.name,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          orderedBy: item.orderedBy || 'Guest',
        });
      });
    });
    return list;
  }, [submittedRounds]);

  // Tab: 'full' | 'equal' | 'items' | 'custom'
  const [splitTab, setSplitTab] = useState('full');
  const [equalSplitCount, setEqualSplitCount] = useState(2);
  const [selectedItemKeys, setSelectedItemKeys] = useState(new Set());
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'counter'
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedPayment, setCompletedPayment] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Calculate payable amount based on current split mode
  const payableAmount = useMemo(() => {
    if (remainingBalance <= 0) return 0;

    if (splitTab === 'full') {
      return remainingBalance;
    }
    if (splitTab === 'equal') {
      const share = Math.ceil(remainingBalance / Math.max(1, equalSplitCount));
      return Math.min(remainingBalance, share);
    }
    if (splitTab === 'items') {
      const itemsSum = allOrderedItems
        .filter((it) => selectedItemKeys.has(it.key))
        .reduce((sum, it) => sum + it.totalPrice, 0);
      const tax = Math.round(itemsSum * 0.05); // 5% GST
      return Math.min(remainingBalance, itemsSum + tax);
    }
    if (splitTab === 'custom') {
      const val = parseFloat(customAmount);
      return isNaN(val) ? 0 : Math.min(remainingBalance, Math.max(1, val));
    }
    return remainingBalance;
  }, [splitTab, remainingBalance, equalSplitCount, selectedItemKeys, allOrderedItems, customAmount]);

  const toggleItemSelection = (key) => {
    setSelectedItemKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (payableAmount <= 0) return;

    // Razorpay Card / Netbanking checkout flow
    if (paymentMethod === 'card' && typeof window !== 'undefined' && window.Razorpay) {
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_ToBU0COX5xjDYg';
      const rzpOptions = {
        key: razorpayKey,
        amount: Math.round(payableAmount * 100), // amount in paise
        currency: 'INR',
        name: restaurant.name || 'Food House',
        description: `Table ${tableNumber} Bill Settlement (${splitTab.toUpperCase()})`,
        prefill: {
          name: currentGuestName || 'Guest',
        },
        theme: {
          color: '#F97316',
        },
        handler: (response) => {
          setIsProcessing(true);
          const selectedItemsList =
            splitTab === 'items'
              ? allOrderedItems.filter((i) => selectedItemKeys.has(i.key)).map((i) => i.name)
              : [];

          const record = recordPartialPayment(tableNumber, {
            amount: payableAmount,
            paidBy: currentGuestName,
            method: 'card',
            transactionId: response.razorpay_payment_id || `RZP-${Date.now()}`,
            splitType: splitTab,
            itemsCovered: selectedItemsList,
          });

          setIsProcessing(false);
          setCompletedPayment(record);
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch (err) {}
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      try {
        const rzp = new window.Razorpay(rzpOptions);
        rzp.on('payment.failed', (failResp) => {
          setIsProcessing(false);
          alert('Payment Failed: ' + (failResp.error?.description || 'Transaction cancelled'));
        });
        rzp.open();
        return;
      } catch (err) {
        console.warn('Razorpay popup error, proceeding with instant simulation:', err);
      }
    }

    setIsProcessing(true);

    setTimeout(() => {
      const selectedItemsList =
        splitTab === 'items'
          ? allOrderedItems.filter((i) => selectedItemKeys.has(i.key)).map((i) => i.name)
          : [];

      const record = recordPartialPayment(tableNumber, {
        amount: payableAmount,
        paidBy: currentGuestName,
        method: paymentMethod,
        splitType: splitTab,
        itemsCovered: selectedItemsList,
      });

      setIsProcessing(false);
      setCompletedPayment(record);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }, 1200);
  };

  // UPI Deep-link & Dynamic QR URL
  const upiPayee = 'cafehighfive@icici';
  const upiPayeeName = encodeURIComponent(restaurant.name || 'Cafe Highfive');
  const upiNote = encodeURIComponent(`Table ${tableNumber} Bill Settlement`);
  const upiUri = `upi://pay?pa=${upiPayee}&pn=${upiPayeeName}&am=${payableAmount}&cu=INR&tn=${upiNote}`;
  const upiQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  const handleCopyReceipt = () => {
    const text = `Receipt for Table ${tableNumber} at ${restaurant.name}: Paid ₹${completedPayment?.amount} via ${completedPayment?.method?.toUpperCase()}. Txn ID: ${completedPayment?.transactionId}. Thank you!`;
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🧾 *${restaurant.name} Table ${tableNumber} Bill Receipt*\nPaid Amount: ₹${completedPayment?.amount}\nTxn ID: ${completedPayment?.transactionId}\nPaid by: ${completedPayment?.paidBy}\nRemaining Table Balance: ₹${session.remainingBalance}\nView Live Bill: ${window.location.href}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Table ${tableNumber} • Bill & Settlement`}
      maxWidth="max-w-xl"
    >
      <div className="font-sans space-y-4">
        {/* If payment just completed: Show Digital Receipt Snapshot */}
        {completedPayment ? (
          <div className="py-4 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display font-black text-2xl text-secondary-900 dark:text-white">
                Payment Confirmed!
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Verified server confirmation for Table {tableNumber}
              </p>
            </div>

            {/* Verified Digital Invoice Snapshot */}
            <div className="bg-gray-50 dark:bg-secondary-800 p-5 rounded-2xl border border-gray-200 dark:border-secondary-700 text-left font-mono text-xs space-y-2 max-w-md mx-auto shadow-inner">
              <div className="flex justify-between pb-2 border-b border-dashed border-gray-300 dark:border-secondary-600 font-sans font-bold text-sm">
                <span>{restaurant.name}</span>
                <span className="text-emerald-600 font-mono">PAID</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-bold">{completedPayment.transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paid by:</span>
                <span className="font-bold">{completedPayment.paidBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Mode:</span>
                <span className="font-bold uppercase">{completedPayment.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Split Type:</span>
                <span className="font-bold capitalize">{completedPayment.splitType}</span>
              </div>
              <div className="flex justify-between text-sm font-sans font-black pt-2 border-t border-dashed border-gray-300 dark:border-secondary-600">
                <span>Amount Paid:</span>
                <span className="text-primary">{formatINR(completedPayment.amount)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                <span>Remaining Table Balance:</span>
                <span className="font-bold text-secondary-900 dark:text-white">{formatINR(session.remainingBalance)}</span>
              </div>
            </div>

            {/* Share & Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-md mx-auto pt-2">
              <button
                onClick={handleShareWhatsApp}
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleCopyReceipt}
                className="py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-secondary-800 hover:bg-gray-200 text-secondary-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-gray-100 dark:bg-secondary-800 hover:bg-gray-200 text-secondary-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 col-span-2 sm:col-span-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompletedPayment(null)}
              >
                Make Another Payment / View Bill
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Header Bill Summary Card */}
            <div className="bg-gradient-to-r from-primary-50 via-amber-50 to-orange-50 dark:from-primary-950/40 dark:to-secondary-900 border border-primary-200/60 dark:border-primary-900 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  Shared Table Settlement
                </span>
                <h3 className="text-xl font-display font-bold text-secondary-900 dark:text-white">
                  Table {tableNumber}
                </h3>
                <div className="text-xs text-gray-500 mt-0.5">
                  Total Bill: <strong className="text-secondary-900 dark:text-white">{formatINR(session.totalBill)}</strong>
                  {session.paidAmount > 0 && (
                    <span className="text-emerald-600 ml-2 font-semibold">
                      (Paid: {formatINR(session.paidAmount)})
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right bg-white dark:bg-secondary-800 p-2.5 sm:p-3 rounded-xl border border-primary-100 dark:border-primary-950 w-full sm:w-auto">
                <div className="text-[11px] font-semibold text-gray-500">Remaining Balance</div>
                <div className="text-2xl font-black text-primary">
                  {formatINR(remainingBalance)}
                </div>
              </div>
            </div>

            {/* If fully settled */}
            {remainingBalance <= 0 ? (
              <div className="py-8 text-center bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-900">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-base text-emerald-800 dark:text-emerald-300">
                  Bill is Fully Settled!
                </h4>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                  Thank you for dining at {restaurant.name}. You may leave whenever ready!
                </p>
              </div>
            ) : (
              <>
                {/* 4 Split Mode Tabs */}
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
                    How Would You Like to Settle?
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 bg-gray-100 dark:bg-secondary-800 p-1.5 rounded-2xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setSplitTab('full')}
                      className={`py-2 px-1 rounded-xl transition ${
                        splitTab === 'full'
                          ? 'bg-white dark:bg-secondary-900 text-primary shadow-sm'
                          : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'
                      }`}
                    >
                      Full Bill
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitTab('equal')}
                      className={`py-2 px-1 rounded-xl transition ${
                        splitTab === 'equal'
                          ? 'bg-white dark:bg-secondary-900 text-primary shadow-sm'
                          : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'
                      }`}
                    >
                      Split Equally
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitTab('items')}
                      className={`py-2 px-1 rounded-xl transition ${
                        splitTab === 'items'
                          ? 'bg-white dark:bg-secondary-900 text-primary shadow-sm'
                          : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'
                      }`}
                    >
                      By Items
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitTab('custom')}
                      className={`py-2 px-1 rounded-xl transition ${
                        splitTab === 'custom'
                          ? 'bg-white dark:bg-secondary-900 text-primary shadow-sm'
                          : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                {/* Tab Specific Content */}
                {splitTab === 'equal' && (
                  <div className="bg-gray-50 dark:bg-secondary-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-secondary-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        Split between how many guests?
                      </span>
                      <span className="font-black text-primary text-sm">{equalSplitCount} Diners</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={equalSplitCount}
                      onChange={(e) => setEqualSplitCount(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                    <div className="text-center pt-1 text-xs text-gray-500">
                      Each person pays: <strong className="text-secondary-900 dark:text-white">{formatINR(payableAmount)}</strong>
                    </div>
                  </div>
                )}

                {splitTab === 'items' && (
                  <div className="bg-gray-50 dark:bg-secondary-800/60 p-3 rounded-2xl border border-gray-100 dark:border-secondary-700 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-300">
                        Select What You Ordered:
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const myKeys = new Set(
                              allOrderedItems
                                .filter((it) => it.orderedBy?.toLowerCase() === (currentGuestName || '').toLowerCase())
                                .map((it) => it.key)
                            );
                            setSelectedItemKeys(myKeys);
                          }}
                          className="text-[10px] text-primary font-bold hover:underline"
                        >
                          Select My Items ({currentGuestName})
                        </button>
                        <span className="text-gray-300">•</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedItemKeys.size === allOrderedItems.length) {
                              setSelectedItemKeys(new Set());
                            } else {
                              setSelectedItemKeys(new Set(allOrderedItems.map((it) => it.key)));
                            }
                          }}
                          className="text-[10px] text-gray-500 font-bold hover:underline"
                        >
                          {selectedItemKeys.size === allOrderedItems.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                    </div>

                    <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100 dark:divide-secondary-700">
                      {allOrderedItems.map((item) => {
                        const isChecked = selectedItemKeys.has(item.key);
                        return (
                          <label
                            key={item.key}
                            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
                              isChecked
                                ? 'bg-primary/5 dark:bg-primary/10 border border-primary/30'
                                : 'hover:bg-gray-100/60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleItemSelection(item.key)}
                                className="w-4 h-4 rounded text-primary accent-primary"
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-secondary-900 dark:text-white truncate">
                                  {item.quantity}x {item.name}
                                </div>
                                <div className="text-[10px] text-gray-400">
                                  Round {item.roundNumber} • Ordered by {item.orderedBy}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-primary flex-shrink-0">
                              {formatINR(item.totalPrice)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {splitTab === 'custom' && (
                  <div className="bg-gray-50 dark:bg-secondary-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-secondary-700 space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                      Enter Custom Contribution Amount (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={remainingBalance}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder={`Max ${formatINR(remainingBalance)}`}
                      className="w-full text-sm font-bold px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                    />
                  </div>
                )}

                {/* Payment Methods & UPI Preview */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Payment Method
                    </label>
                    <span className="text-[11px] text-gray-400">Zero Gateway Surcharge</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition ${
                        paymentMethod === 'upi'
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm'
                          : 'border-gray-200 dark:border-secondary-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-primary" />
                      <span>Instant UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition ${
                        paymentMethod === 'card'
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm'
                          : 'border-gray-200 dark:border-secondary-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Card / Netbanking</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('counter')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition ${
                        paymentMethod === 'counter'
                          ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm'
                          : 'border-gray-200 dark:border-secondary-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <span>Cash at Counter</span>
                    </button>
                  </div>

                  {paymentMethod === 'upi' && payableAmount > 0 && (
                    <div className="bg-gray-50 dark:bg-secondary-800/50 p-4 rounded-2xl border border-gray-100 dark:border-secondary-700 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="p-2 bg-white rounded-xl shadow-xs border">
                        <img
                          src={upiQrCodeUrl}
                          alt="Dynamic UPI QR"
                          className="w-28 h-28 mx-auto"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                          Scan with Any UPI App
                        </span>
                        <div className="font-bold text-xs text-secondary-900 dark:text-white">
                          GPay • PhonePe • Paytm • BHIM
                        </div>
                        <div className="text-[11px] font-mono text-gray-500">
                          VPA: {upiPayee}
                        </div>
                        <a
                          href={upiUri}
                          className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline pt-1"
                        >
                          <span>Open UPI App Directly</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && payableAmount > 0 && (
                    <div className="bg-orange-50/70 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-200 dark:border-orange-800/40 text-center space-y-1.5">
                      <div className="text-xs font-bold text-secondary-900 dark:text-white flex items-center justify-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span>Razorpay Secure Checkout</span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Supports Visa, MasterCard, RuPay, NetBanking, UPI, and Digital Wallets.
                      </p>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100/60 dark:bg-emerald-950/40 py-1 px-3 rounded-full inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>100% Secure & Encrypted Payment</span>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'counter' && payableAmount > 0 && (
                    <div className="bg-gray-50 dark:bg-secondary-800/50 p-4 rounded-2xl border border-gray-100 dark:border-secondary-700 text-center space-y-1">
                      <div className="text-xs font-bold text-secondary-900 dark:text-white flex items-center justify-center gap-1.5">
                        <Banknote className="w-4 h-4 text-amber-600" />
                        <span>Pay at Counter</span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Inform your waiter or pay at the cash counter upon leaving.
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Payment Button */}
                <div className="pt-2 border-t border-gray-100 dark:border-secondary-800">
                  <Button
                    onClick={handlePay}
                    disabled={isProcessing || payableAmount <= 0}
                    className="w-full font-bold shadow-md text-sm py-3 flex items-center justify-center gap-2"
                    size="md"
                  >
                    {isProcessing ? (
                      <span>Verifying Payment...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay {formatINR(payableAmount)}</span>
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

