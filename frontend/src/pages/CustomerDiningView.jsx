import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Gamepad2,
  Tag,
  Star,
  Mic
} from 'lucide-react';
import { VoiceAssistant } from '../components/VoiceAssistant';
import { VenkyAvatar } from '../components/VenkyAvatar';
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
  const [activeTab, setActiveTab] = useState('assistant'); // 'menu', 'kids', 'assistant', 'offers', 'review'
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
      <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center space-y-3 text-slate-400">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-300">Connecting to your table's AI Waiter...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-white relative">
      
      {/* Scrollable Viewport Content */}
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col">
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
      </div>

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

      {/* Bottom Floating Navigation Dock: AI Voice Waiter in the CENTER */}
      <nav className="shrink-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-amber-500/20 pt-1.5 pb-2.5 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-around px-2 relative">
          
          {/* 1. Left 1: Menu */}
          <button
            onClick={() => handleTabChange('menu')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              activeTab === 'menu'
                ? 'text-orange-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className={`w-5 h-5 mb-0.5 ${activeTab === 'menu' ? 'stroke-[2.5] text-orange-400' : ''}`} />
            <span className="text-[10px] tracking-tight">Menu</span>
            {activeTab === 'menu' && (
              <span className="w-1 h-1 rounded-full bg-orange-400 mt-0.5 shadow-xs shadow-orange-400"></span>
            )}
          </button>

          {/* 2. Left 2: Kids Zone */}
          <button
            onClick={() => handleTabChange('kids')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              activeTab === 'kids'
                ? 'text-purple-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 className={`w-5 h-5 mb-0.5 ${activeTab === 'kids' ? 'stroke-[2.5] text-purple-400' : ''}`} />
            <span className="text-[10px] tracking-tight">Kids Zone</span>
            {activeTab === 'kids' && (
              <span className="w-1 h-1 rounded-full bg-purple-400 mt-0.5 shadow-xs shadow-purple-400"></span>
            )}
          </button>

          {/* 3. CENTER: Waiter Venky (Elevated Circular Hero Button) */}
          <div className="relative -mt-6 flex flex-col items-center">
            <button
              onClick={() => handleTabChange('assistant')}
              className={`w-14 h-14 rounded-full overflow-hidden shadow-xl ring-4 ring-slate-950 transition-all duration-300 transform active:scale-95 flex items-center justify-center p-0.5 ${
                activeTab === 'assistant'
                  ? 'bg-linear-to-tr from-orange-600 via-amber-500 to-amber-400 shadow-orange-600/50 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:scale-105'
              }`}
              title="Waiter Venky"
            >
              <VenkyAvatar size="sm" />
            </button>
            <span className={`text-[10px] font-black tracking-tight mt-1 ${activeTab === 'assistant' ? 'text-amber-400' : 'text-slate-400'}`}>
              Venky
            </span>
          </div>

          {/* 4. Right 1: Offers */}
          <button
            onClick={() => handleTabChange('offers')}
            className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all ${
              activeTab === 'offers'
                ? 'text-amber-400 font-black scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Tag className={`w-5 h-5 mb-0.5 ${activeTab === 'offers' ? 'stroke-[2.5] text-amber-400' : ''}`} />
            <span className="text-[10px] tracking-tight">Offers</span>
            {activeTab === 'offers' && (
              <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5 shadow-xs shadow-amber-400"></span>
            )}
          </button>

          {/* 5. Right 2: Review */}
          <button
            onClick={() => setIsReviewOpen(true)}
            className="flex flex-col items-center py-1 px-2.5 rounded-2xl text-slate-400 hover:text-amber-300 transition-all"
          >
            <Star className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Review</span>
          </button>

        </div>
      </nav>
    </div>
  );
}

export default CustomerDiningView;
