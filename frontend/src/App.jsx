import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerDiningView } from './pages/CustomerDiningView';
import { OwnerDashboard } from './pages/OwnerDashboard';

export function App() {
  const [mode, setMode] = useState('customer'); // 'customer' or 'owner'
  const [restaurantId, setRestaurantId] = useState(1);
  const [tableNumber, setTableNumber] = useState(1);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState({ language_code: 'en', language_name: 'English' });

  // Parse URL parameters on initial load (Step 1 of PDF: ?restaurant=101&table=5)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restParam = params.get('restaurant') || params.get('restaurant_id');
    const tableParam = params.get('table') || params.get('table_id');
    const modeParam = params.get('mode');

    if (restParam) {
      setRestaurantId(Number(restParam));
    }
    if (tableParam) {
      setTableNumber(Number(tableParam));
    }
    if (modeParam === 'owner' || modeParam === 'admin' || window.location.pathname.includes('admin')) {
      setMode('owner');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start font-sans antialiased selection:bg-orange-500 selection:text-white">
      {mode === 'customer' ? (
        /* Mobile-Only Enclosure: Fullscreen on mobile, centered smartphone simulator on desktop */
        <div className="w-full max-w-[430px] min-h-screen bg-slate-900 flex flex-col relative md:my-5 md:rounded-[44px] md:shadow-[0_25px_70px_rgba(0,0,0,0.8)] md:border-[10px] md:border-slate-800 md:ring-1 md:ring-slate-700/50 overflow-hidden">
          
          {/* Subtle Mobile Speaker Notch on desktop frame */}
          <div className="hidden md:flex justify-center pt-2 pb-1 bg-slate-900 z-50">
            <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center">
              <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
            </div>
          </div>

          {/* Navigation Bar */}
          <Navbar
            restaurant={{ name: "The Royal Spice Bistro" }}
            tableNumber={tableNumber}
            currentLanguage={currentLanguage}
            onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
            mode={mode}
            setMode={setMode}
          />

          {/* Main Customer View */}
          <main className="flex-1 flex flex-col overflow-y-auto">
            <CustomerDiningView
              restaurantId={restaurantId}
              tableNumber={tableNumber}
              onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
              isLanguageModalOpen={isLanguageModalOpen}
              setIsLanguageModalOpen={setIsLanguageModalOpen}
            />
          </main>

          {/* Bottom Home Indicator on desktop frame */}
          <div className="hidden md:flex justify-center pb-2 bg-slate-900 z-50">
            <div className="w-32 h-1 bg-slate-700/60 rounded-full"></div>
          </div>

        </div>
      ) : (
        /* Owner Dashboard: Professional Wide View for Management */
        <div className="w-full min-h-screen bg-slate-50 flex flex-col">
          <Navbar
            restaurant={{ name: "The Royal Spice Bistro" }}
            tableNumber={tableNumber}
            currentLanguage={currentLanguage}
            onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
            mode={mode}
            setMode={setMode}
          />
          <main className="flex-1">
            <OwnerDashboard restaurantId={restaurantId} />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
