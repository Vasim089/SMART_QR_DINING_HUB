import React from 'react';
import { Tag, Sparkles, Clock, Percent, Check } from 'lucide-react';
import { trackEvent } from '../services/api';

export function OffersView({ offers, restaurantId, tableId }) {
  const [copiedCode, setCopiedCode] = React.useState(null);

  const handleClaimOffer = (offer) => {
    trackEvent({
      restaurantId,
      tableId,
      eventType: 'offer_click',
      eventData: { offer_id: offer.id, title: offer.title }
    });
    setCopiedCode(offer.id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-3 pb-8">
      <div className="bg-linear-to-r from-amber-600 to-orange-600 p-3.5 rounded-2xl text-white shadow-md">
        <div className="flex items-center space-x-2 mb-0.5">
          <Sparkles className="w-4 h-4 text-amber-200" />
          <h3 className="font-extrabold text-sm tracking-wide">Today's Restaurant Offers</h3>
        </div>
        <p className="text-[11px] text-amber-100">Exclusive discounts for table diners!</p>
      </div>

      <div className="space-y-2.5">
        {offers.length === 0 ? (
          <div className="text-center py-8 bg-slate-900 rounded-2xl border border-slate-800 p-4">
            <p className="text-slate-400 text-xs">No active promotions today.</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 shadow-xs relative overflow-hidden"
            >
              <div className="pr-12">
                <h4 className="font-bold text-white text-sm mb-0.5">{offer.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-2.5">{offer.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>Valid to: <strong className="text-slate-200">{offer.end_date}</strong></span>
                </div>

                <button
                  onClick={() => handleClaimOffer(offer)}
                  className={`px-3 py-1 rounded-xl font-bold flex items-center space-x-1 transition text-xs ${
                    copiedCode === offer.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  {copiedCode === offer.id ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Applied!</span>
                    </>
                  ) : (
                    <>
                      <Tag className="w-3 h-3" />
                      <span>Claim</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
