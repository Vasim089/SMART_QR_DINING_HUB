import React, { useState, useMemo } from 'react';
import {
  Search,
  Leaf,
  Flame,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function MenuCatalog({ categories, onAddToCart, cartItems }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, veg, jain, spicy, special, under14

  // Flatten and filter items
  const filteredCategories = useMemo(() => {
    return categories
      .map((cat) => {
        if (selectedCategory !== 'all' && cat.id !== selectedCategory) {
          return null;
        }

        const items = cat.items.filter((item) => {
          // Search query match
          const matchesSearch =
            !searchQuery.trim() ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.ingredients && item.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));

          if (!matchesSearch) return false;

          // Dietary / Special filters
          const tagNames = item.tags.map((t) => t.tag_name.toLowerCase());
          const isVeg = tagNames.some((t) => t.includes('veg') && !t.includes('non'));
          const isJain = tagNames.some((t) => t.includes('jain'));
          const isSpicy = tagNames.some((t) => t.includes('spic') || t.includes('hot'));

          if (activeFilter === 'veg' && !isVeg) return false;
          if (activeFilter === 'jain' && !isJain) return false;
          if (activeFilter === 'spicy' && !isSpicy) return false;
          if (activeFilter === 'special' && !item.is_today_special) return false;
          if (activeFilter === 'under14' && item.effective_price > 14) return false;

          return true;
        });

        if (items.length === 0) return null;

        return {
          ...cat,
          items
        };
      })
      .filter(Boolean);
  }, [categories, selectedCategory, searchQuery, activeFilter]);

  const filterButtons = [
    { id: 'all', label: 'All Items' },
    { id: 'veg', label: '🌱 Pure Veg' },
    { id: 'special', label: '⭐ Today\'s Special' },
    { id: 'under14', label: '💰 Under $14' },
    { id: 'spicy', label: '🌶️ Spicy' },
    { id: 'jain', label: '✨ Jain' },
  ];

  return (
    <div className="space-y-3 pb-8">
      
      {/* Mobile Search & Filter Box */}
      <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes, curries, drinks..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800/90 text-white placeholder-slate-400 border border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500 transition"
          />
        </div>

        {/* Dietary Filters Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setActiveFilter(btn.id)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                activeFilter === btn.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Swipeable Category Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              selectedCategory === c.id
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Mobile Dish Listings */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-10 bg-slate-850 rounded-2xl border border-slate-800 p-4">
          <p className="text-slate-400 text-xs">No menu items match your search.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveFilter('all');
              setSelectedCategory('all');
            }}
            className="mt-2 text-xs font-bold text-orange-400 underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        filteredCategories.map((cat) => (
          <div key={cat.id} className="space-y-2 pt-1">
            <div className="flex items-baseline justify-between px-1">
              <h3 className="font-extrabold text-white text-sm tracking-wide">{cat.name}</h3>
              <span className="text-[10px] text-slate-400">{cat.items.length} items</span>
            </div>

            <div className="space-y-2.5">
              {cat.items.map((item) => {
                const inCart = cartItems?.find((c) => c.id === item.id);
                const tagNames = item.tags.map((t) => t.tag_name.toLowerCase());
                const isVeg = tagNames.some((t) => t.includes('veg') && !t.includes('non'));
                const isSpicy = tagNames.some((t) => t.includes('spic') || t.includes('hot'));

                return (
                  <div
                    key={item.id}
                    className={`bg-slate-900/90 rounded-2xl p-3 border transition-all flex flex-col justify-between ${
                      item.is_available
                        ? 'border-slate-800 hover:border-orange-500/60 shadow-xs'
                        : 'border-slate-800/60 opacity-50 bg-slate-950/60'
                    }`}
                  >
                    <div className="flex space-x-3">
                      {/* Thumbnail */}
                      {item.image_url ? (
                        <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-800">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {!item.is_available && (
                            <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-1">
                              <span className="text-[9px] font-black text-white uppercase bg-rose-600 px-1 py-0.5 rounded-xs">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-xs leading-snug">{item.name}</h4>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-1 my-1">
                          {isVeg && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-xs bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-0.5">
                              <Leaf className="w-2.5 h-2.5" /> Veg
                            </span>
                          )}
                          {isSpicy && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-xs bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5" /> Spicy
                            </span>
                          )}
                          {item.is_today_special && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-xs bg-amber-950 text-amber-300 border border-amber-800">
                              ⭐ Special
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">{item.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Price & 1-Tap Add Button */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <div>
                        {item.is_today_special && item.special_price ? (
                          <div className="flex items-baseline space-x-1.5">
                            <span className="font-black text-orange-400 text-sm">
                              ${item.special_price.toFixed(2)}
                            </span>
                            <span className="text-[11px] text-slate-500 line-through">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-black text-white text-sm">
                            ${item.effective_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {item.is_available ? (
                        <button
                          onClick={() => onAddToCart && onAddToCart(item)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
                            inCart
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
                          }`}
                        >
                          {inCart ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Added ({inCart.quantity})</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-400 px-2 py-0.5 bg-rose-950/60 border border-rose-900 rounded-md">
                          Unavailable Today
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
