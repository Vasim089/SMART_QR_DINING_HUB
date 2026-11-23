import React from 'react';
import { QrCode, Download, ExternalLink, ArrowLeft, Smartphone } from 'lucide-react';

export function QrCodesGallery({ onBack }) {
  const tables = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-orange-400 mb-1">
            <QrCode className="w-4 h-4" />
            <span>TABLE QR STANDS • SCAN OR PRINT</span>
          </div>
          <h1 className="text-2xl font-black text-white">Restaurant Table QR Codes</h1>
          <p className="text-xs text-slate-400 mt-1">
            Point your mobile phone camera at any QR code to open the AI Dining Assistant for that table.
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition self-start"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Admin Dashboard</span>
          </button>
        )}
      </div>

      {/* Grid of Table QR Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tables.map((tableNum) => {
          const qrPath = `/qr_codes/Table_${tableNum}_QR.png`;
          const tableUrl = `http://localhost:5173/?restaurant=1&table=${tableNum}`;

          return (
            <div
              key={tableNum}
              className="bg-slate-900 rounded-3xl p-4 border border-slate-800 hover:border-orange-500/60 shadow-xl flex flex-col items-center text-center transition group"
            >
              <div className="w-full flex items-center justify-between text-xs mb-3 px-1">
                <span className="font-extrabold text-white text-sm">Table #{tableNum}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ready to Scan
                </span>
              </div>

              {/* Scannable QR Image */}
              <div className="p-2.5 bg-white rounded-2xl shadow-inner mb-3.5 transition group-hover:scale-105">
                <img
                  src={qrPath}
                  alt={`Table ${tableNum} QR Code`}
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div className="text-[11px] text-slate-400 mb-3 truncate w-full flex items-center justify-center gap-1">
                <Smartphone className="w-3 h-3 text-orange-400" />
                <span>Scan with Phone Camera</span>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex space-x-2">
                <a
                  href={tableUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition flex items-center justify-center space-x-1 shadow-xs"
                >
                  <span>Open Table</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={qrPath}
                  download={`Table_${tableNum}_QR.png`}
                  className="p-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Download Printable PNG"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
