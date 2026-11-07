import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRestaurant } from '../../context/RestaurantContext';
import { Star, Sparkles, CheckCircle2, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CustomerFeedbackModal = ({ isOpen, onClose, order }) => {
  const { submitReview, loyalty } = useRestaurant();
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Super Fast Service', 'Hot & Fresh']);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScratched, setIsScratched] = useState(false);

  const availableTags = [
    'Super Fast Service',
    'Hot & Fresh',
    'Crispy Crust',
    'Delicious Cold Coffee',
    'Easy QR Ordering',
    'Polite Waiters',
    'Great Ambience',
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitReview({
      orderNumber: order?.orderNumber || 'ORD-1001',
      customerName: order?.customerName || 'Guest Diner',
      rating,
      sentiment: rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative',
      tags: selectedTags,
      comment,
    });

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    setIsSubmitted(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Your Dining Experience" maxWidth="max-w-md">
      {isSubmitted ? (
        <div className="py-4 text-center space-y-4 font-sans text-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-md animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="font-display text-2xl font-bold text-secondary-900 dark:text-white">
            Thank You for Your Feedback!
          </h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            {rating >= 4
              ? 'We are thrilled you had a fantastic experience! Would you mind leaving a quick 5-star review on Google Maps?'
              : 'Thank you for your candid feedback. Your comments have been routed privately to our General Manager for immediate service quality review.'}
          </p>

          {/* Tapiloo-Style Google Review Gating: High ratings trigger Google Maps Review button */}
          {rating >= 4 && (
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-2xl text-left space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  G
                </div>
                <div>
                  <span className="font-bold text-blue-950 dark:text-blue-100 block">
                    Share your experience on Google
                  </span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300">
                    Get an extra 50 bonus loyalty points when posted!
                  </span>
                </div>
              </div>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition block text-center"
              >
                <span>⭐ Post Review on Google Maps</span>
              </a>
            </div>
          )}

          {/* Low rating manager inbox guarantee */}
          {rating <= 3 && (
            <div className="p-3 bg-gray-50 dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 rounded-2xl text-left text-[11px] text-gray-600 dark:text-gray-300">
              <span className="font-bold text-secondary-900 dark:text-white block mb-0.5">
                🛡️ Manager Escalation Ticket #{Math.floor(100000 + Math.random() * 900000)}
              </span>
              Our manager Marco Rossi has received your private report. We value your feedback and will use it to retrain our kitchen and service team.
            </div>
          )}

          {/* Digital Scratch Card / Loyalty Reward */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-primary text-white shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-amber-200 animate-pulse" />
              <span className="font-bold text-xs uppercase tracking-wider">
                Dining Reward Unlocked
              </span>
            </div>

            {!isScratched ? (
              <button
                onClick={() => {
                  setIsScratched(true);
                  try {
                    confetti({ particleCount: 50, spread: 50 });
                  } catch {}
                }}
                className="w-full py-4 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 font-bold text-sm tracking-wide transition active:scale-98"
              >
                ✨ Tap to Scratch & Reveal Coupon
              </button>
            ) : (
              <div className="bg-white text-secondary-900 rounded-xl p-3 shadow-inner text-center animate-in zoom-in-95">
                <div className="text-[10px] uppercase font-bold text-gray-400">Coupon Code</div>
                <div className="font-mono text-lg font-black text-primary tracking-widest my-0.5">
                  TASTY50
                </div>
                <div className="text-[11px] font-semibold text-gray-600">
                  Flat ₹50 OFF on your next visit! Plus +67 ServePoints added.
                </div>
              </div>
            )}
          </div>

          <Button onClick={onClose} variant="outline" className="w-full mt-2 font-bold">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          {/* Star Rating Selector */}
          <div className="text-center py-2">
            <div className="text-gray-500 font-semibold mb-2">How was your food & service?</div>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition"
                >
                  <Star
                    className={`w-8 h-8 transition ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400 drop-shadow'
                        : 'text-gray-200 dark:text-secondary-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-primary mt-1">
              {rating === 5 ? 'Exceptional! ⭐⭐⭐⭐⭐' : rating === 4 ? 'Very Good! ⭐⭐⭐⭐' : 'Good ⭐⭐⭐'}
            </div>
          </div>

          {/* Quick Compliment Tags */}
          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
              What did you love most?
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition ${
                      isSelected
                        ? 'bg-primary text-white shadow-xs'
                        : 'bg-gray-100 dark:bg-secondary-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Detailed Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell our chef what you enjoyed or how we can do better..."
              className="w-full text-xs p-3 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Submit */}
          <Button type="submit" variant="primary" className="w-full py-3 font-bold text-xs shadow-md">
            <span>Submit Review & Claim Reward</span>
          </Button>
        </form>
      )}
    </Modal>
  );
};

