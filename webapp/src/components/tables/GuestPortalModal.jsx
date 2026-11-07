import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { GUEST_PORTAL_CONFIG } from '../../lib/mockData';
import {
  Wifi,
  Gift,
  HelpCircle,
  Copy,
  Check,
  Sparkles,
  Trophy,
  RotateCw,
  Bell,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GuestPortalModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('wifi'); // 'wifi' | 'spin' | 'quiz' | 'announcements'
  const [isCopied, setIsCopied] = useState(false);

  // Spin wheel states
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Trivia states
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const handleCopyWifi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(GUEST_PORTAL_CONFIG.wifi.password).catch(() => {});
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSpinWheel = () => {
    if (isSpinning || wonPrize) return;
    setIsSpinning(true);

    const randomDegrees = 1440 + Math.floor(Math.random() * 360);
    const newRotation = wheelRotation + randomDegrees;
    setWheelRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      // Pick a winning prize
      const prize = GUEST_PORTAL_CONFIG.spinWheelPrizes[0]; // Flat ₹50 OFF
      setWonPrize(prize);
      try {
        confetti({ particleCount: 80, spread: 70 });
      } catch {}
    }, 3000);
  };

  const handleAnswerQuiz = (qId, optionIdx) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Guest Portal" maxWidth="max-w-md">
      <div className="space-y-4 font-sans text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-secondary-800 rounded-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'wifi', label: 'Wi-Fi Access', icon: Wifi },
            { id: 'spin', label: 'Spin & Win', icon: Gift },
            { id: 'quiz', label: 'Food Trivia', icon: HelpCircle },
            { id: 'announcements', label: 'Specials', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition whitespace-nowrap ${
                  isSelected
                    ? 'bg-white dark:bg-secondary-900 text-primary shadow-xs'
                    : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Wi-Fi Access */}
        {activeTab === 'wifi' && (
          <div className="space-y-4 py-2">
            <div className="p-5 rounded-3xl bg-gradient-to-tr from-amber-50 to-orange-50 dark:from-secondary-900 dark:to-secondary-850 border border-amber-200/80 dark:border-secondary-700 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary text-white mx-auto flex items-center justify-center shadow-md">
                <Wifi className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-secondary-900 dark:text-white">
                  High-Speed Guest Wi-Fi
                </h4>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  Complimentary ultra-fast connection for all table diners
                </p>
              </div>

              <div className="bg-white dark:bg-secondary-800 rounded-2xl p-4 border border-gray-200 dark:border-secondary-700 text-left space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Network Name (SSID)</span>
                  <span className="font-mono font-bold text-secondary-900 dark:text-white">
                    {GUEST_PORTAL_CONFIG.wifi.ssid}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-100 dark:border-secondary-700">
                  <span className="text-gray-400 font-medium">Password</span>
                  <span className="font-mono font-bold text-primary">
                    {GUEST_PORTAL_CONFIG.wifi.password}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopyWifi}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-600 active:scale-98 text-white font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{isCopied ? 'Wi-Fi Password Copied!' : 'Copy Wi-Fi Password'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Spin & Win Promotional Reward Game */}
        {activeTab === 'spin' && (
          <div className="space-y-4 py-2 text-center">
            <div>
              <h4 className="font-bold text-base text-secondary-900 dark:text-white">
                Dine-In Spin & Win! 🎡
              </h4>
              <p className="text-gray-500 text-[11px]">
                Free promotional prize draw for table guests. Every spin wins a treat!
              </p>
            </div>

            {/* Wheel Canvas representation */}
            <div className="relative w-48 h-48 mx-auto my-3 flex items-center justify-center">
              <div
                className="w-48 h-48 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden relative transition-transform duration-3000 ease-out"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  background: 'conic-gradient(#F97316 0deg 60deg, #D97706 60deg 120deg, #EA580C 120deg 180deg, #C2410C 180deg 240deg, #FB923C 240deg 300deg, #9A3412 300deg 360deg)',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center font-bold text-xs text-primary">
                    Cafe
                  </div>
                </div>
              </div>

              {/* Indicator Arrow */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-12 border-t-red-600 z-10 drop-shadow" />
            </div>

            {wonPrize ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-center space-y-1.5 animate-in zoom-in-95">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Prize Unlocked!
                </span>
                <div className="font-display text-xl font-bold text-emerald-800 dark:text-emerald-300">
                  {wonPrize.label}
                </div>
                {wonPrize.coupon && (
                  <div className="font-mono font-black text-sm bg-white dark:bg-secondary-800 px-3 py-1 rounded-lg inline-block border border-emerald-300">
                    Use Code: {wonPrize.coupon}
                  </div>
                )}
                <p className="text-[10px] text-gray-500">
                  Apply at checkout to claim your reward instantly.
                </p>
              </div>
            ) : (
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-primary to-orange-600 hover:opacity-90 active:scale-98 text-white font-extrabold text-sm shadow-md transition"
              >
                {isSpinning ? 'Wheel is Spinning...' : '🎡 Spin the Wheel for Free!'}
              </button>
            )}
          </div>
        )}

        {/* TAB 3: Food Trivia Quiz */}
        {activeTab === 'quiz' && (
          <div className="space-y-4 py-1">
            <div>
              <h4 className="font-bold text-sm text-secondary-900 dark:text-white">
                Specialty Coffee & Culinary Trivia
              </h4>
              <p className="text-gray-500 text-[11px]">
                Test your foodie knowledge while waiting for your order!
              </p>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {GUEST_PORTAL_CONFIG.triviaQuiz.map((q, idx) => {
                const selectedOpt = quizAnswers[q.id];
                const isAnswered = selectedOpt !== undefined;

                return (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 space-y-2"
                  >
                    <div className="font-bold text-xs text-secondary-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOpt === optIdx;
                        const isCorrect = q.correctAnswer === optIdx;

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleAnswerQuiz(q.id, optIdx)}
                            className={`p-2 rounded-xl text-[11px] font-semibold text-left transition border ${
                              isAnswered
                                ? isCorrect
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-400 font-bold'
                                  : isChosen
                                  ? 'bg-red-100 text-red-800 border-red-300'
                                  : 'bg-white dark:bg-secondary-900 opacity-60'
                                : isChosen
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white dark:bg-secondary-900 hover:bg-gray-100'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <p className="text-[10px] text-gray-500 italic mt-1 bg-white dark:bg-secondary-900 p-2 rounded-lg">
                        💡 {q.fact}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Announcements & Specials */}
        {activeTab === 'announcements' && (
          <div className="space-y-3 py-1">
            <h4 className="font-bold text-sm text-secondary-900 dark:text-white">
              Today's Cafe Highlights
            </h4>
            {GUEST_PORTAL_CONFIG.announcements.map((ann, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-amber-50 dark:bg-secondary-800 border border-amber-200 dark:border-secondary-700 text-xs font-medium text-secondary-800 dark:text-gray-200"
              >
                {ann}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};
