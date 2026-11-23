import React, { useState } from 'react';
import { Star, MessageSquareHeart, ExternalLink, X, Check } from 'lucide-react';
import { trackEvent } from '../services/api';

export function ReviewModal({ isOpen, onClose, restaurant, tableId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitReview = () => {
    trackEvent({
      restaurantId: restaurant?.id || 1,
      tableId,
      eventType: 'review_click',
      eventData: { rating, comment, target: 'Google Review / Feedback' }
    });
    setSubmitted(true);
    setTimeout(() => {
      // If restaurant has google review link, open in new tab
      if (restaurant?.settings?.review_url) {
        window.open(restaurant.settings.review_url, '_blank');
      }
      onClose();
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Rate Your Experience</h3>
              <p className="text-xs text-slate-500">{restaurant?.name || 'Dining Hub'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center text-emerald-600 animate-fadeIn">
            <Check className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
            <h4 className="font-bold text-base text-slate-900">Thank you for dining with us!</h4>
            <p className="text-xs text-slate-500 mt-1">Redirecting to Google Reviews...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              How was your food and dining experience today? Your feedback helps us serve you better.
            </p>

            {/* Stars */}
            <div className="flex justify-center space-x-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you loved (optional)..."
              rows={3}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />

            <button
              onClick={handleSubmitReview}
              className="w-full py-3 px-4 rounded-xl font-bold bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md shadow-orange-600/20 flex items-center justify-center space-x-2 transition text-sm"
            >
              <span>Submit & Open Google Review</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
