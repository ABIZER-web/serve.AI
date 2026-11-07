import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRestaurant } from '../../context/RestaurantContext';
import { GUEST_PORTAL_CONFIG } from '../../lib/mockData';
import { formatINR } from '../../utils/currency';
import confetti from 'canvas-confetti';
import {
  Wifi,
  Copy,
  Check,
  Gift,
  HelpCircle,
  Sparkles,
  Flame,
  Award,
  Star,
  MessageSquare,
  Volume2,
  UtensilsCrossed,
  Tag,
  ThumbsUp,
  RotateCw,
} from 'lucide-react';

export const DigitalGuestPortalModal = ({
  isOpen,
  onClose,
  tableNumber,
  currentGuestName = 'Guest',
}) => {
  const { restaurant, loyalty, submitReview } = useRestaurant();
  const [activeTab, setActiveTab] = useState('wifi'); // 'wifi', 'specials', 'wheel', 'trivia', 'feedback'
  const [wifiCopied, setWifiCopied] = useState(false);

  // Spin the Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState(null);
  const [hasSpun, setHasSpun] = useState(false);

  // Trivia Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Feedback state
  const [foodRating, setFoodRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const wifiInfo = restaurant.wifi || GUEST_PORTAL_CONFIG.wifi;
  const prizes = GUEST_PORTAL_CONFIG.spinWheelPrizes;
  const trivia = GUEST_PORTAL_CONFIG.triviaQuiz;

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(wifiInfo.password);
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2000);
  };

  const handleSpinWheel = () => {
    if (isSpinning || hasSpun) return;

    setIsSpinning(true);
    // Choose winning prize randomly
    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const sliceDeg = 360 / prizes.length;
    // Extra rotations for thrilling animation + land on target slice
    const totalRotation = wheelRotation + 1800 + (prizes.length - prizeIndex) * sliceDeg;
    setWheelRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      const prize = prizes[prizeIndex];
      setWonPrize(prize);

      if (prize.coupon) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
    }, 3800);
  };

  const handleSelectQuizAnswer = (optionIdx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optionIdx);

    const isCorrect = optionIdx === trivia[currentQuizIdx].correctAnswer;
    if (isCorrect) setScore((prev) => prev + 1);

    setTimeout(() => {
      if (currentQuizIdx < trivia.length - 1) {
        setCurrentQuizIdx((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setQuizFinished(true);
      }
    }, 2000);
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    submitReview({
      customerName: currentGuestName,
      rating: Math.round((foodRating + serviceRating) / 2),
      foodRating,
      serviceRating,
      comment: feedbackComment || 'Delightful experience with Smart Table service!',
      tableNumber,
    });
    setFeedbackSubmitted(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Table Experience & Guest Hub"
      maxWidth="max-w-xl"
    >
      <div className="font-sans space-y-4">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-5 gap-1 bg-gray-100 dark:bg-secondary-800 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('wifi')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeTab === 'wifi'
                ? 'bg-white dark:bg-secondary-900 text-primary shadow-xs'
                : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            <span>Wi-Fi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specials')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeTab === 'specials'
                ? 'bg-white dark:bg-secondary-900 text-primary shadow-xs'
                : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-primary" />
            <span>Specials</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wheel')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeTab === 'wheel'
                ? 'bg-white dark:bg-secondary-900 text-primary shadow-xs'
                : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-amber-500" />
            <span>Spin & Win</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trivia')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeTab === 'trivia'
                ? 'bg-white dark:bg-secondary-900 text-primary shadow-xs'
                : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
            <span>Quiz</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`py-2 px-1 rounded-xl flex flex-col sm:flex-row items-center justify-center gap-1 transition ${
              activeTab === 'feedback'
                ? 'bg-white dark:bg-secondary-900 text-primary shadow-xs'
                : 'text-gray-500 hover:text-secondary-900 dark:hover:text-white'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Feedback</span>
          </button>
        </div>

        {/* 1. WI-FI & ANNOUNCEMENTS */}
        {activeTab === 'wifi' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-primary-50 via-amber-50 to-orange-50 dark:from-primary-950/40 dark:to-secondary-900 border border-primary-200/60 dark:border-primary-900 rounded-3xl p-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white mx-auto flex items-center justify-center shadow-md mb-2">
                <Wifi className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-xl text-secondary-900 dark:text-white">
                Complimentary Dining Wi-Fi
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {wifiInfo.speed || '150 Mbps High-Speed Fiber'}
              </p>

              <div className="bg-white dark:bg-secondary-800 p-4 rounded-2xl border border-primary-100 dark:border-secondary-700 mt-4 max-w-sm mx-auto shadow-xs text-left space-y-2.5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Network Name (SSID)
                  </span>
                  <div className="font-mono font-bold text-sm text-secondary-900 dark:text-white">
                    {wifiInfo.ssid}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Password
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-primary">
                      {wifiInfo.password}
                    </span>
                    <button
                      onClick={handleCopyWifi}
                      className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition active:scale-95"
                    >
                      {wifiCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{wifiCopied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Announcements */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                Today's Table Announcements
              </span>
              <div className="space-y-2">
                {GUEST_PORTAL_CONFIG.announcements.map((ann, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-secondary-800/60 rounded-xl border border-gray-100 dark:border-secondary-700 text-xs text-secondary-800 dark:text-gray-200 flex items-center gap-2"
                  >
                    <span>{ann}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. SPECIAL OFFERS & RECOMMENDATIONS */}
        {activeTab === 'specials' && (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
                Active Promo Coupons
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {loyalty.coupons?.map((c) => (
                  <div
                    key={c.code}
                    className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-secondary-800 dark:to-secondary-800 border border-amber-200 dark:border-secondary-700 rounded-2xl relative overflow-hidden shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-black text-primary text-xs tracking-wider bg-white dark:bg-secondary-900 px-2 py-0.5 rounded-lg border border-primary/20">
                        {c.code}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">Min ₹{c.minAmount}</span>
                    </div>
                    <div className="font-bold text-xs text-secondary-900 dark:text-white">
                      {c.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chef Highlights */}
            <div className="pt-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
                Head Chef's Table Recommendations
              </span>
              <div className="space-y-2">
                <div className="p-3 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-2xl flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80"
                    alt="Latte"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-secondary-900 dark:text-white">
                      Iced Spanish Latte (Single Origin)
                    </h5>
                    <p className="text-[11px] text-gray-500">
                      Slow-extracted espresso shaken with cold milk and sweet condensed cream.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-2xl flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&auto=format&fit=crop&q=80"
                    alt="Burger"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h5 className="font-bold text-xs text-secondary-900 dark:text-white">
                      Highfive Double Cheeseburger
                    </h5>
                    <p className="text-[11px] text-gray-500">
                      House brioche bun, double patties, melted cheddar, and secret caramelized glaze.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. FREE PROMOTIONAL SPIN-THE-WHEEL */}
        {activeTab === 'wheel' && (
          <div className="text-center space-y-4 py-2">
            <div>
              <h3 className="font-display font-black text-xl text-secondary-900 dark:text-white">
                Lucky Table Spin-the-Wheel! 🎡
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 max-w-sm mx-auto">
                Complimentary dining perk for Table {tableNumber}. 1 free spin per session. Win instant discounts or treats!
              </p>
            </div>

            {/* Visual Spin Wheel */}
            <div className="relative w-56 h-56 mx-auto my-2">
              {/* Pointer Indicator */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-secondary-900 dark:border-t-white drop-shadow-md" />

              {/* The Wheel Circle */}
              <div
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                }}
                className="w-full h-full rounded-full border-4 border-secondary-900 dark:border-white shadow-xl relative overflow-hidden flex items-center justify-center bg-secondary-900"
              >
                {prizes.map((p, idx) => {
                  const deg = idx * (360 / prizes.length);
                  return (
                    <div
                      key={p.id}
                      style={{
                        transform: `rotate(${deg}deg)`,
                        transformOrigin: 'bottom center',
                        backgroundColor: p.color,
                      }}
                      className="absolute top-0 w-28 h-28 origin-bottom flex items-start justify-center pt-2 text-[10px] font-black text-white text-center leading-tight drop-shadow-xs"
                    >
                      <span className="max-w-[70px] -rotate-90 origin-center block pt-4">
                        {p.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Center Hub */}
              <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-white dark:bg-secondary-900 border-2 border-secondary-900 dark:border-white shadow-md z-10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            </div>

            {/* Result Announcement */}
            {wonPrize && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl max-w-sm mx-auto">
                <span className="text-[10px] uppercase font-bold text-primary tracking-widest block">
                  You Won!
                </span>
                <div className="font-display font-black text-lg text-secondary-900 dark:text-white">
                  {wonPrize.label}
                </div>
                {wonPrize.coupon && (
                  <div className="text-xs font-mono font-bold text-primary mt-1">
                    Coupon: {wonPrize.coupon} (Auto-applied to table bill!)
                  </div>
                )}
              </div>
            )}

            <div className="pt-2">
              <Button
                onClick={handleSpinWheel}
                disabled={isSpinning || hasSpun}
                className="w-full max-w-xs mx-auto font-bold shadow-md"
                size="md"
              >
                {isSpinning ? 'Spinning...' : hasSpun ? 'Already Spun This Table Session' : 'Spin the Wheel!'}
              </Button>
            </div>
          </div>
        )}

        {/* 4. FOOD TRIVIA QUIZ */}
        {activeTab === 'trivia' && (
          <div className="space-y-4 py-1">
            {quizFinished ? (
              <div className="py-6 text-center space-y-3 bg-purple-50 dark:bg-purple-950/30 rounded-3xl p-6 border border-purple-200 dark:border-purple-900">
                <div className="w-14 h-14 rounded-full bg-purple-600 text-white mx-auto flex items-center justify-center text-xl shadow-md">
                  🏆
                </div>
                <h4 className="font-display font-black text-2xl text-secondary-900 dark:text-white">
                  Foodie Master!
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  You scored <strong>{score} out of {trivia.length}</strong> in the Food Trivia Challenge!
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentQuizIdx(0);
                      setSelectedAnswer(null);
                      setScore(0);
                      setQuizFinished(false);
                    }}
                  >
                    Play Again
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                  <span>Question {currentQuizIdx + 1} of {trivia.length}</span>
                  <span className="text-purple-600 font-black">Score: {score}</span>
                </div>

                <div className="p-4 bg-white dark:bg-secondary-800 rounded-2xl border border-gray-200 dark:border-secondary-700 shadow-xs mb-3">
                  <h4 className="font-bold text-sm text-secondary-900 dark:text-white">
                    {trivia[currentQuizIdx].question}
                  </h4>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-2">
                  {trivia[currentQuizIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswer === oIdx;
                    const isCorrect = oIdx === trivia[currentQuizIdx].correctAnswer;
                    let btnStyle = 'border-gray-200 dark:border-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-800';

                    if (selectedAnswer !== null) {
                      if (isCorrect) btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold';
                      else if (isSelected) btnStyle = 'border-red-500 bg-red-50 text-red-800';
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={selectedAnswer !== null}
                        onClick={() => handleSelectQuizAnswer(oIdx)}
                        className={`p-3 rounded-xl border text-left text-xs transition flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {selectedAnswer !== null && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Educational Fact Box */}
                {selectedAnswer !== null && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-200 mt-3 animate-in fade-in">
                    <strong>💡 Chef Fact:</strong> {trivia[currentQuizIdx].fact}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 5. GUEST FEEDBACK */}
        {activeTab === 'feedback' && (
          <div>
            {feedbackSubmitted ? (
              <div className="py-8 text-center space-y-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl p-6 border border-emerald-200 dark:border-emerald-900">
                <Check className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-display font-bold text-xl text-secondary-900 dark:text-white">
                  Thank You, {currentGuestName}!
                </h4>
                <p className="text-xs text-gray-500">
                  Your feedback helps our kitchen & serving staff keep standards world-class.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3">
                <div className="bg-gray-50 dark:bg-secondary-800/60 p-4 rounded-2xl border border-gray-100 dark:border-secondary-700 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Food & Flavor Experience
                    </label>
                    <div className="flex gap-2 text-2xl cursor-pointer">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFoodRating(st)}
                          className={st <= foodRating ? 'text-amber-400 scale-110 transition' : 'text-gray-300'}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Floor & Waiter Service Speed
                    </label>
                    <div className="flex gap-2 text-2xl cursor-pointer">
                      {[1, 2, 3, 4, 5].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setServiceRating(st)}
                          className={st <= serviceRating ? 'text-amber-400 scale-110 transition' : 'text-gray-300'}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Any Suggestions for Our Chef?
                    </label>
                    <textarea
                      rows={2}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Loved the Spanish latte! Quick service."
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder-gray-400"
                    />
                  </div>
                </div>

                <Button type="submit" size="md" className="w-full font-bold shadow-md">
                  Submit Feedback
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

