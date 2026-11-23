import React from 'react';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle2 } from 'lucide-react';

export function CartSummary({ cartItems, onUpdateQuantity, onClearCart, restaurantName, tableNumber }) {
  const total = cartItems.reduce((acc, item) => acc + item.effective_price * item.quantity, 0);

  if (cartItems.length === 0) return null;

  return (
    <div className="fixed bottom-16 inset-x-0 z-30 max-w-lg mx-auto px-4 pointer-events-none">
      <div className="bg-slate-950 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 pointer-events-auto flex items-center justify-between animate-fadeIn">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
            {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
          </div>
          <div>
            <div className="text-xs text-slate-400">Order Total (Table {tableNumber || '1'}):</div>
            <div className="text-base font-extrabold text-white">${total.toFixed(2)}</div>
          </div>
        </div>

        <button
          onClick={() => {
            alert(`Order sent to kitchen for Table ${tableNumber || 1}! Total: $${total.toFixed(2)}. Your food is being prepared!`);
            onClearCart();
          }}
          className="py-2 px-4 rounded-xl font-bold bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md text-xs flex items-center space-x-1.5 transition"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Place Order</span>
        </button>
      </div>
    </div>
  );
}
