import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerDiningView } from './pages/CustomerDiningView';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { QrCodesGallery } from './pages/QrCodesGallery';

export function App() {
  const [mode, setMode] = useState('customer'); // 'customer', 'owner', 'qrcodes'
  const [restaurantId, setRestaurantId] = useState(1);
  const [tableNumber, setTableNumber] = useState(1);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState({ language_code: 'en', language_name: 'English' });

  // Parse URL parameters on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const restParam = params.get('restaurant') || params.get('restaurant_id');
    const tableParam = params.get('table') || params.get('table_id');
    const modeParam = params.get('mode');
    const viewParam = params.get('view');

    if (restParam) {
      setRestaurantId(Number(restParam));
    }
    if (tableParam) {
      setTableNumber(Number(tableParam));
    }
    if (viewParam === 'qrcodes' || viewParam === 'qr' || window.location.pathname === '/qr') {
      setMode('qrcodes');
    } else if (modeParam === 'owner' || modeParam === 'admin' || window.location.pathname.includes('admin')) {
      setMode('owner');
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans antialiased selection:bg-orange-500 selection:text-white">
      
      {/* 1. All QR Codes Gallery View (Admin Only) */}
      {mode === 'qrcodes' ? (
        <QrCodesGallery onBack={() => setMode('owner')} />
      ) : mode === 'customer' ? (
        /* 2. Customer View: Strictly Mobile-First Dining Experience (No QR codes or admin options) */
        <div className="flex-1 flex items-center justify-center p-0 sm:p-4 bg-slate-950">
          
          {/* Mobile Smartphone Frame - Fullscreen on real phones, centered smartphone frame on desktop */}
          <div className="w-full max-w-[430px] h-[100dvh] sm:h-[844px] bg-slate-900 flex flex-col relative sm:rounded-[44px] sm:shadow-[0_25px_80px_rgba(0,0,0,0.8)] sm:border-[8px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/50 overflow-hidden">
            
            {/* Notch / Speaker on desktop frame */}
            <div className="hidden sm:flex justify-center pt-2 pb-1 bg-slate-900 z-50 shrink-0">
              <div className="w-24 h-4 bg-slate-950 rounded-full flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
              </div>
            </div>

            {/* Navbar (Customer: Only Brand, Table Pill, AI Indicator, Language) */}
            <Navbar
              restaurant={{ name: "The Royal Spice Bistro" }}
              tableNumber={tableNumber}
              currentLanguage={currentLanguage}
              onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
              mode={mode}
              setMode={setMode}
            />

            {/* Mobile Viewport Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
              <CustomerDiningView
                restaurantId={restaurantId}
                tableNumber={tableNumber}
                onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
                isLanguageModalOpen={isLanguageModalOpen}
                setIsLanguageModalOpen={setIsLanguageModalOpen}
              />
            </main>

            {/* Bottom Home Indicator */}
            <div className="hidden sm:flex justify-center pb-2 bg-slate-900 z-50 shrink-0">
              <div className="w-32 h-1 bg-slate-700/60 rounded-full"></div>
            </div>
          </div>

        </div>
      ) : (
        /* 3. Owner / Admin Dashboard View (Where all QR codes, Daily Menu & Analytics live) */
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
            <OwnerDashboard
              restaurantId={restaurantId}
              onOpenGallery={() => setMode('qrcodes')}
            />
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
