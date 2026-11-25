import React, { useState, useMemo } from 'react';
import {
  Search,
  Leaf,
  Flame,
  Sparkles,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  X,
  ChevronDown,
  UtensilsCrossed
} from 'lucide-react';

// Format ALL-CAPS DB category names nicely for mobile pills
const formatCatName = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/(^|\s|[-/])([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase())
    .replace(/\bAnd\b/g, '&')
    .replace(/\bVeg\b/g, 'Veg');
};

export function MenuCatalog({ categories, onAddToCart, cartItems }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, veg, nonveg, jain, spicy, special, under14
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryGridOpen, setIsCategoryGridOpen] = useState(false);

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
          if (activeFilter === 'nonveg' && isVeg) return false;
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

  const totalMatchingItems = useMemo(
    () => filteredCategories.reduce((sum, c) => sum + c.items.length, 0),
    [filteredCategories]
  );

  const filterButtons = [
    { id: 'all', label: 'All Items', icon: '🍽️' },
    { id: 'veg', label: 'Pure Veg', icon: '🌱' },
    { id: 'nonveg', label: 'Non-Veg', icon: '🍗' },
    { id: 'spicy', label: 'Spicy', icon: '🌶️' },
    { id: 'special', label: "Today's Special", icon: '⭐' },
    { id: 'under14', label: 'Under $14', icon: '💰' },
    { id: 'jain', label: 'Jain', icon: '✨' },
  ];

  const activeFilterObj = filterButtons.find((f) => f.id === activeFilter);
  const selectedCatObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="space-y-3 pb-8">

      {/* Sleek Sticky Search & Filter Bar (Transparent Glass, No Black BG) */}
      <div className="sticky top-0 z-20 bg-transparent backdrop-blur-xl pt-1 pb-2 space-y-2">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search biryani, dosa, paneer..."
              className="w-full pl-8 pr-7 py-2 text-xs bg-white/10 text-white placeholder-slate-300/70 border border-white/15 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-amber-400/70 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dietary / Price Filter Drawer Toggle */}
          <button
            onClick={() => {
              setIsFilterOpen((v) => !v);
              setIsCategoryGridOpen(false);
            }}
            className={`relative px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition shrink-0 ${
              isFilterOpen || activeFilter !== 'all'
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/15'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeFilter !== 'all' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            )}
          </button>

          {/* All Categories Grid Toggle */}
          <button
            onClick={() => {
              setIsCategoryGridOpen((v) => !v);
              setIsFilterOpen(false);
            }}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold border flex items-center gap-1 transition shrink-0 ${
              isCategoryGridOpen || selectedCategory !== 'all'
                ? 'bg-orange-500/20 text-orange-300 border-orange-400/50'
                : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/15'
            }`}
            title="Browse Categories"
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <ChevronDown className={`w-3 h-3 transition-transform ${isCategoryGridOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expandable Dietary & Price Filter Panel */}
        {isFilterOpen && (
          <div className="bg-slate-800/75 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-xl">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                Dietary & Quick Filters
              </span>
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="text-[10px] font-bold text-amber-300 hover:underline"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {filterButtons.map((btn) => {
                const active = activeFilter === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => {
                      setActiveFilter(btn.id);
                      setIsFilterOpen(false);
                    }}
                    className={`flex items-center justify-center gap-1 px-2 py-2 rounded-xl text-[11px] font-bold border transition ${
                      active
                        ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white border-amber-300 shadow-md'
                        : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15'
                    }`}
                  >
                    <span>{btn.icon}</span>
                    <span className="truncate">{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Expandable Category Grid Picker */}
        {isCategoryGridOpen && (
          <div className="bg-slate-800/75 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 shadow-xl max-h-60 overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                Jump to Category ({categories.length})
              </span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setIsCategoryGridOpen(false);
                  }}
                  className="text-[10px] font-bold text-amber-300 hover:underline"
                >
                  Show All
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setIsCategoryGridOpen(false);
                }}
                className={`px-2.5 py-2 rounded-xl text-[11px] font-bold text-left border transition ${
                  selectedCategory === 'all'
                    ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white border-amber-300'
                    : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCategory(c.id);
                    setIsCategoryGridOpen(false);
                  }}
                  className={`px-2.5 py-2 rounded-xl text-[11px] font-bold text-left border flex items-center justify-between gap-1 transition ${
                    selectedCategory === c.id
                      ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white border-amber-300'
                      : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/15'
                  }`}
                >
                  <span className="truncate">{formatCatName(c.name)}</span>
                  <span className="text-[9px] opacity-75 shrink-0">{c.items.length}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Clean Horizontal Category Pill Strip */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap border transition ${
              selectedCategory === 'all'
                ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white border-amber-300 shadow-sm'
                : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/15'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap border transition flex items-center gap-1.5 ${
                selectedCategory === c.id
                  ? 'bg-linear-to-r from-orange-500 to-amber-500 text-white border-amber-300 shadow-sm'
                  : 'bg-white/10 text-slate-200 border-white/15 hover:bg-white/15'
              }`}
            >
              <span>{formatCatName(c.name)}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === c.id ? 'bg-white/25 text-white' : 'bg-white/10 text-slate-300'
              }`}>
                {c.items.length}
              </span>
            </button>
          ))}
        </div>

        {/* Active Filter Summary Chip */}
        {(activeFilter !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span>
              Showing <strong className="text-amber-300">{totalMatchingItems}</strong> dishes
              {activeFilter !== 'all' && activeFilterObj ? ` • ${activeFilterObj.icon} ${activeFilterObj.label}` : ''}
              {selectedCategory !== 'all' && selectedCatObj ? ` • ${formatCatName(selectedCatObj.name)}` : ''}
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
                setSelectedCategory('all');
              }}
              className="text-amber-400 font-bold hover:underline"
            >
              Clear All
            </button>
          </div>
        )}
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
