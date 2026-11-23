import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Gamepad2,
  Tag,
  Star
} from 'lucide-react';
import { VoiceAssistant } from '../components/VoiceAssistant';
import { MenuCatalog } from '../components/MenuCatalog';
import { KidsZone } from '../components/KidsZone';
import { OffersView } from '../components/OffersView';
import { ReviewModal } from '../components/ReviewModal';
import { LanguageModal } from '../components/LanguageModal';
import { CartSummary } from '../components/CartSummary';
import {
  getRestaurantInfo,
  getMenu,
  getOffers,
  getLanguages,
  trackEvent
} from '../services/api';

export function CustomerDiningView({ restaurantId, tableNumber, onOpenLanguageModal, isLanguageModalOpen, setIsLanguageModalOpen }) {
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [currentLanguageCode, setCurrentLanguageCode] = useState('en');
  const [activeTab, setActiveTab] = useState('assistant'); // 'assistant', 'menu', 'kids', 'offers'
  const [sessionToken, setSessionToken] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load restaurant & menu data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [restData, menuData, offersData, langsData] = await Promise.all([
          getRestaurantInfo(restaurantId),
          getMenu(restaurantId),
          getOffers(restaurantId),
          getLanguages()
        ]);

        setRestaurant(restData);
        setCategories(menuData);
        setOffers(offersData);
        setLanguages(langsData);

        // Record initial QR Scan analytics event
        trackEvent({
          restaurantId,
          tableId: tableNumber,
          eventType: 'qr_scan',
          eventData: { table_number: tableNumber, user_agent: navigator.userAgent }
        });
      } catch (err) {
        console.error('Failed to load dining hub data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [restaurantId, tableNumber]);

  // Cart actions
  const handleAddToCart = (dish) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === dish.id);
      if (existing) {
        return prev.map((i) => (i.id === dish.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (dishId, delta) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === dishId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const handleClearCart = () => setCartItems([]);

  // Track tab change analytics
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    if (newTab === 'menu') {
      trackEvent({
        restaurantId,
        tableId: tableNumber,
        eventType: 'menu_view',
        eventData: { view: 'full_catalog' }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-300">Connecting to your table's AI Waiter...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative px-3 py-2 pb-24 text-white">
      
      {/* Active Tab View */}
      {activeTab === 'assistant' && (
        <VoiceAssistant
          restaurantId={restaurantId}
          tableId={tableNumber}
          languageCode={currentLanguageCode}
          sessionToken={sessionToken}
          setSessionToken={setSessionToken}
          onAddToCart={handleAddToCart}
          cartItems={cartItems}
        />
      )}

      {activeTab === 'menu' && (
        <MenuCatalog
          categories={categories}
          onAddToCart={handleAddToCart}
          cartItems={cartItems}
        />
      )}

      {activeTab === 'kids' && (
        <KidsZone
          restaurantId={restaurantId}
          tableId={tableNumber}
        />
      )}

      {activeTab === 'offers' && (
        <OffersView
          offers={offers}
          restaurantId={restaurantId}
          tableId={tableNumber}
        />
      )}

      {/* Cart Summary Drawer Pill */}
      <CartSummary
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onClearCart={handleClearCart}
        restaurantName={restaurant?.name}
        tableNumber={tableNumber}
      />

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        languages={languages}
        selectedCode={currentLanguageCode}
        onSelectLanguage={(code) => setCurrentLanguageCode(code)}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        restaurant={restaurant}
        tableId={tableNumber}
      />

      {/* Bottom Floating Navigation Bar (Strictly Mobile First) */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 py-1.5 shadow-2xl max-w-[430px] mx-auto">
        <div className="flex items-center justify-around px-1">
          
          <button
            onClick={() => handleTabChange('assistant')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition ${
              activeTab === 'assistant'
                ? 'text-orange-500 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className={`w-5 h-5 mb-0.5 ${activeTab === 'assistant' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] tracking-tight">AI Waiter</span>
          </button>

          <button
            onClick={() => handleTabChange('menu')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition ${
              activeTab === 'menu'
                ? 'text-orange-500 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className={`w-5 h-5 mb-0.5 ${activeTab === 'menu' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] tracking-tight">Menu</span>
          </button>

          <button
            onClick={() => handleTabChange('kids')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition ${
              activeTab === 'kids'
                ? 'text-purple-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className={`w-5 h-5 mb-0.5 ${activeTab === 'kids' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] tracking-tight">Kids Zone</span>
          </button>

          <button
            onClick={() => handleTabChange('offers')}
            className={`flex flex-col items-center py-1 px-3 rounded-2xl transition ${
              activeTab === 'offers'
                ? 'text-amber-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className={`w-5 h-5 mb-0.5 ${activeTab === 'offers' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] tracking-tight">Offers</span>
          </button>

          <button
            onClick={() => setIsReviewOpen(true)}
            className="flex flex-col items-center py-1 px-3 rounded-2xl text-slate-400 hover:text-amber-300 transition"
          >
            <Star className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Review</span>
          </button>

        </div>
      </div>
    </div>
  );
}
