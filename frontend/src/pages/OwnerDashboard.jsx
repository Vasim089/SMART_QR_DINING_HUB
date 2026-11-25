import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  QrCode,
  CalendarCheck2,
  TrendingUp,
  MessageSquare,
  Mic,
  Gamepad2,
  Tag,
  Star,
  Eye,
  LogOut,
  Save,
  CheckCircle2,
  Sparkles,
  Download,
  Plus,
  RefreshCw,
  Utensils,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  Trash2,
  Search,
  X,
  Pencil
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  adminLogin,
  getAdminProfile,
  getAdminAnalytics,
  getAdminDailyMenu,
  updateDailyMenuAvailability,
  getAdminTables,
  addAdminTable,
  getAdminChatSessions,
  getAdminCategories,
  createAdminMenuItem,
  updateAdminMenuItem,
  deleteAdminMenuItem,
  deleteAdminTable
} from '../services/api';

const COLORS = ['#ea580c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export function OwnerDashboard({ restaurantId = 1, onOpenGallery }) {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [email, setEmail] = useState('admin@dininghub.com');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('daily_menu'); // 'daily_menu', 'overview', 'tables', 'chats'
  const [restaurantName, setRestaurantName] = useState('Bawarchi Indian Cuisine');
  const [analytics, setAnalytics] = useState(null);
  const [dailyMenu, setDailyMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tables, setTables] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [newTableNum, setNewTableNum] = useState('');
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [newDish, setNewDish] = useState({
    name: '',
    category_id: '',
    category_name: '',
    price: '',
    description: '',
    ingredients: '',
    image_url: '',
    tags: ['Vegetarian']
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Perform login
  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const data = await adminLogin(email, password);
      setToken(data.access_token);
      localStorage.setItem('admin_token', data.access_token);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-Click login with default credentials
  const handleQuickLogin = async () => {
    setEmail('admin@dininghub.com');
    setPassword('admin123');
    setLoginError('');
    setLoading(true);
    try {
      const data = await adminLogin('admin@dininghub.com', 'admin123');
      setToken(data.access_token);
      localStorage.setItem('admin_token', data.access_token);
    } catch (err) {
      setLoginError(err.message || 'Auto-login failed.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click reset/repair default admin in backend
  const handleResetAdmin = async () => {
    try {
      setLoading(true);
      setLoginError('');
      const res = await fetch('/api/admin/reset-default-admin', { method: 'POST' });
      const data = await res.json();
      setEmail('admin@dininghub.com');
      setPassword('admin123');
      alert('Default admin account verified & restored! Logging in now...');
      await handleQuickLogin();
    } catch (err) {
      alert('Reset error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('admin_token');
  };

  // Fetch dashboard data
  const loadDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [profileData, analyticsData, menuData, catsData, tablesData, chatsData] = await Promise.all([
        getAdminProfile(token),
        getAdminAnalytics(restaurantId, token),
        getAdminDailyMenu(restaurantId, token),
        getAdminCategories(restaurantId, token),
        getAdminTables(restaurantId, token),
        getAdminChatSessions(restaurantId, token)
      ]);
      if (profileData?.restaurant_name) {
        setRestaurantName(profileData.restaurant_name);
      }
      setAnalytics(analyticsData);
      setDailyMenu(menuData);
      setCategories(catsData);
      setTables(tablesData);
      setChatSessions(chatsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      if (
        err.message.includes('401') ||
        err.message.includes('403') ||
        err.message.includes('credentials') ||
        err.message.includes('Forbidden')
      ) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  // Update daily menu item
  const handleToggleAvailability = async (item, newStatus) => {
    const updated = {
      menu_item_id: item.menu_item_id,
      is_available: newStatus,
      is_today_special: item.is_today_special,
      special_price: item.special_price
    };

    setDailyMenu((prev) =>
      prev.map((i) => (i.menu_item_id === item.menu_item_id ? { ...i, is_available: newStatus } : i))
    );

    try {
      await updateDailyMenuAvailability(updated, token);
      setSaveSuccessMsg(`Updated ${item.name} availability!`);
      setTimeout(() => setSaveSuccessMsg(''), 2000);
    } catch (err) {
      alert('Error updating availability');
      loadDashboardData();
    }
  };

  const handleToggleSpecial = async (item, newSpecialStatus) => {
    const defaultSpecialPrice = newSpecialStatus ? +(item.base_price * 0.85).toFixed(2) : null;
    const updated = {
      menu_item_id: item.menu_item_id,
      is_available: item.is_available,
      is_today_special: newSpecialStatus,
      special_price: defaultSpecialPrice
    };

    setDailyMenu((prev) =>
      prev.map((i) =>
        i.menu_item_id === item.menu_item_id
          ? { ...i, is_today_special: newSpecialStatus, special_price: defaultSpecialPrice }
          : i
      )
    );

    try {
      await updateDailyMenuAvailability(updated, token);
      setSaveSuccessMsg(`Updated ${item.name} daily special!`);
      setTimeout(() => setSaveSuccessMsg(''), 2000);
    } catch (err) {
      alert('Error updating special');
      loadDashboardData();
    }
  };

  const handleUpdatePrice = async (item, specialPriceVal) => {
    const updated = {
      menu_item_id: item.menu_item_id,
      is_available: item.is_available,
      is_today_special: true,
      special_price: parseFloat(specialPriceVal) || item.base_price
    };

    setDailyMenu((prev) =>
      prev.map((i) =>
        i.menu_item_id === item.menu_item_id
          ? { ...i, is_today_special: true, special_price: updated.special_price }
          : i
      )
    );

    try {
      await updateDailyMenuAvailability(updated, token);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNum) return;
    try {
      await addAdminTable(restaurantId, newTableNum, token);
      setNewTableNum('');
      loadDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteTable = async (table) => {
    if (!window.confirm(`Delete Table #${table.table_number}?`)) return;
    try {
      await deleteAdminTable(table.id, token);
      setTables((prev) => prev.filter((t) => t.id !== table.id));
      setSaveSuccessMsg(`Deleted Table #${table.table_number}`);
      setTimeout(() => setSaveSuccessMsg(''), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleNewDishTag = (tag) => {
    setNewDish((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag]
    }));
  };

  const openAddDishModal = () => {
    setEditingDishId(null);
    setNewDish({
      name: '',
      category_id: '',
      category_name: '',
      price: '',
      description: '',
      ingredients: '',
      image_url: '',
      tags: ['Vegetarian']
    });
    setShowAddDishModal(true);
  };

  const openEditDishModal = (item) => {
    setEditingDishId(item.menu_item_id);
    setNewDish({
      name: item.name || '',
      category_id: item.category_id ? String(item.category_id) : '',
      category_name: '',
      price: item.base_price != null ? String(item.base_price) : '',
      description: item.description || '',
      ingredients: '',
      image_url: item.image_url || '',
      tags: item.tags || []
    });
    setShowAddDishModal(true);
  };

  const handleCreateDish = async (e) => {
    e.preventDefault();
    if (!newDish.name.trim() || !newDish.price) return;
    const payload = {
      name: newDish.name.trim(),
      category_id: newDish.category_id ? parseInt(newDish.category_id, 10) : null,
      category_name: !newDish.category_id && newDish.category_name.trim() ? newDish.category_name.trim() : null,
      price: parseFloat(newDish.price),
      description: newDish.description.trim() || null,
      ingredients: newDish.ingredients.trim() || null,
      image_url: newDish.image_url.trim() || null,
      tags: newDish.tags
    };
    try {
      if (editingDishId) {
        await updateAdminMenuItem(editingDishId, payload, token);
        setSaveSuccessMsg(`Updated "${payload.name}"!`);
      } else {
        await createAdminMenuItem(restaurantId, payload, token);
        setSaveSuccessMsg('New dish added to menu!');
      }
      setShowAddDishModal(false);
      setEditingDishId(null);
      setNewDish({
        name: '',
        category_id: '',
        category_name: '',
        price: '',
        description: '',
        ingredients: '',
        image_url: '',
        tags: ['Vegetarian']
      });
      setTimeout(() => setSaveSuccessMsg(''), 2500);
      loadDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteDish = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from the menu?`)) return;
    try {
      await deleteAdminMenuItem(item.menu_item_id, token);
      setDailyMenu((prev) => prev.filter((i) => i.menu_item_id !== item.menu_item_id));
      setSaveSuccessMsg(`Deleted "${item.name}"`);
      setTimeout(() => setSaveSuccessMsg(''), 2000);
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredMenu = dailyMenu.filter((item) => {
    const matchesCat = selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;
    const q = menuSearch.trim().toLowerCase();
    const matchesSearch = !q || item.name.toLowerCase().includes(q) || (item.category || '').toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // If not authenticated, show luxury dark login card
  if (!token) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 bg-slate-950">
        <div className="bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-800 max-w-md w-full relative overflow-hidden">
          
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-600/30">
              <Utensils className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white">Owner & Admin Portal</h2>
            <p className="text-xs text-slate-400 mt-1">
              Table QR Standees, Real-Time Menu Availability & AI Analytics
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-950/80 text-rose-300 text-xs font-semibold border border-rose-800/80 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-black bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-600/30 text-sm transition flex items-center justify-center space-x-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          {/* Quick 1-Click Login Option */}
          <div className="mt-5 pt-4 border-t border-slate-800 space-y-2.5">
            <button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>1-Click Auto Login (admin@dininghub.com)</span>
              <ArrowRight className="w-3 h-3 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={handleResetAdmin}
              className="w-full text-center text-[11px] text-slate-500 hover:text-slate-300 transition py-1"
            >
              Getting 403 or password error? Tap to auto-reset admin
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col md:flex-row">

      {/* LEFT DESKTOP / LAPTOP SIDEBAR */}
      <aside className="w-full md:w-72 shrink-0 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between p-5 md:sticky md:top-0 md:h-screen">
        <div className="space-y-6">
          {/* Restaurant Brand Header */}
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] uppercase font-extrabold text-orange-400 tracking-wider">Admin Portal</span>
              </div>
              <h2 className="text-sm font-black text-white truncate">{restaurantName}</h2>
            </div>
          </div>

          {/* Vertical Sidebar Navigation */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('daily_menu')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs transition ${
                activeTab === 'daily_menu'
                  ? 'bg-linear-to-r from-orange-600 to-amber-600 text-white font-black shadow-lg shadow-orange-600/25'
                  : 'text-slate-300 hover:bg-slate-800/80 font-bold'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <CalendarCheck2 className="w-4 h-4" />
                <span>Menu & Daily Stock</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === 'daily_menu' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {dailyMenu.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tables')}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs transition ${
                activeTab === 'tables'
                  ? 'bg-linear-to-r from-orange-600 to-amber-600 text-white font-black shadow-lg shadow-orange-600/25'
                  : 'text-slate-300 hover:bg-slate-800/80 font-bold'
              }`}
            >
              <span className="flex items-center space-x-2.5">
                <QrCode className="w-4 h-4" />
                <span>Table QR Codes</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === 'tables' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {tables.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl text-xs transition ${
                activeTab === 'overview'
                  ? 'bg-linear-to-r from-orange-600 to-amber-600 text-white font-black shadow-lg shadow-orange-600/25'
                  : 'text-slate-300 hover:bg-slate-800/80 font-bold'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics & Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`w-full flex items-center space-x-2.5 px-3.5 py-3 rounded-2xl text-xs transition ${
                activeTab === 'chats'
                  ? 'bg-linear-to-r from-orange-600 to-amber-600 text-white font-black shadow-lg shadow-orange-600/25'
                  : 'text-slate-300 hover:bg-slate-800/80 font-bold'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Customer AI Transcripts</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="pt-4 mt-6 border-t border-slate-800 space-y-2">
          <div className="px-2 pb-1 text-[11px] text-slate-400 truncate">
            Signed in: <strong className="text-slate-200">{email}</strong>
          </div>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 p-5 md:p-8 space-y-6 overflow-y-auto">
        {saveSuccessMsg && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-800 text-emerald-300 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

      {/* TAB 1: DAILY MENU AVAILABILITY + ADD/DELETE */}
      {activeTab === 'daily_menu' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-white">Menu Management & Daily Kitchen Stock</h3>
                <p className="text-xs text-slate-400">
                  Add new dishes, delete items, or mark items Available / Sold Out. Changes sync live with Waiter Venky.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="text-xs bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-slate-300 font-bold">
                  Dishes: <span className="text-orange-400 font-black">{filteredMenu.length}</span> / {dailyMenu.length}
                </div>
                <button
                  type="button"
                  onClick={openAddDishModal}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-600/30 transition flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dish</span>
                </button>
              </div>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search dish name or category..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-800 text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-950 border border-slate-800 text-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
              >
                <option value="ALL">All Categories ({categories.length})</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.item_count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden divide-y divide-slate-800">
            {filteredMenu.map((item) => (
              <div
                key={item.menu_item_id}
                className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center space-x-3.5">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-700"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-white text-sm">{item.name}</h4>
                      <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-full font-bold">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2.5 text-xs text-slate-400 mt-1">
                      <span>Base: <strong className="text-white">${item.base_price.toFixed(2)}</strong></span>
                      {item.is_today_special && item.special_price && (
                        <span className="text-amber-400 font-black">
                          • Today's Special: ${item.special_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Available / Sold out Toggle */}
                  <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                    <button
                      onClick={() => handleToggleAvailability(item, true)}
                      className={`text-xs font-black px-3 py-1.5 rounded-xl transition ${
                        item.is_available
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(item, false)}
                      className={`text-xs font-black px-3 py-1.5 rounded-xl transition ${
                        !item.is_available
                          ? 'bg-rose-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sold Out
                    </button>
                  </div>

                  {/* Today's Special Toggle */}
                  <button
                    onClick={() => handleToggleSpecial(item, !item.is_today_special)}
                    className={`text-xs font-extrabold px-3.5 py-2 rounded-2xl border transition flex items-center space-x-1.5 ${
                      item.is_today_special
                        ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                    }`}
                  >
                    <span>⭐ Today's Special</span>
                  </button>

                  {/* Special Price Input if special */}
                  {item.is_today_special && (
                    <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-xl border border-amber-500/40">
                      <span className="text-xs text-amber-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.5"
                        defaultValue={item.special_price || +(item.base_price * 0.85).toFixed(2)}
                        onBlur={(e) => handleUpdatePrice(item, e.target.value)}
                        className="w-16 px-1.5 py-1 text-xs bg-transparent text-amber-300 font-black focus:outline-none"
                        title="Special price (blur to save)"
                      />
                    </div>
                  )}

                  {/* Edit Dish Button */}
                  <button
                    type="button"
                    onClick={() => openEditDishModal(item)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-amber-500/40 transition"
                    title={`Edit ${item.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {/* Delete Dish Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteDish(item)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-700/60 transition"
                    title={`Delete ${item.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            ))}
          </div>

          {/* Add New Dish Modal */}
          {showAddDishModal && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    {editingDishId ? (
                      <Pencil className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Plus className="w-4 h-4 text-orange-400" />
                    )}
                    <span>{editingDishId ? 'Edit Menu Dish' : 'Add New Menu Dish'}</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddDishModal(false)}
                    className="p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateDish} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Dish Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Paneer Tikka"
                        value={newDish.name}
                        onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="13.51"
                        value={newDish.price}
                        onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">Existing Category</label>
                      <select
                        value={newDish.category_id}
                        onChange={(e) => setNewDish({ ...newDish, category_id: e.target.value, category_name: '' })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">-- Or type new category --</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1">New Category Name</label>
                      <input
                        type="text"
                        disabled={!!newDish.category_id}
                        placeholder="e.g. Chef Specials"
                        value={newDish.category_name}
                        onChange={(e) => setNewDish({ ...newDish, category_name: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Short appetizing description for diners & Waiter Venky..."
                      value={newDish.description}
                      onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5">Dietary & Spice Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['Vegetarian', 'Non-Vegetarian', 'Spicy', 'Mild', 'Seafood', 'Gluten-Free', 'Jain'].map((tag) => {
                        const active = newDish.tags.includes(tag);
                        return (
                          <button
                            type="button"
                            key={tag}
                            onClick={() => toggleNewDishTag(tag)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition ${
                              active
                                ? 'bg-orange-600 text-white border-orange-400'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDishModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl text-xs font-black bg-linear-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/30"
                    >
                      {editingDishId ? 'Update Dish' : 'Save Dish to DB'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TABLE QR CODES (Admin Only Standee Generator) */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-base text-white">Table QR Code Manager</h3>
              <p className="text-xs text-slate-400">
                Every table standee has its own unique QR code for diners to scan.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {onOpenGallery && (
                <button
                  type="button"
                  onClick={onOpenGallery}
                  className="px-4 py-2.5 rounded-2xl text-xs font-black bg-orange-600 hover:bg-orange-500 text-white transition flex items-center space-x-1.5 shadow-lg shadow-orange-600/30"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Print All Table Standees</span>
                </button>
              )}

              <form onSubmit={handleAddTable} className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Table #"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="w-24 px-3 py-2 text-xs bg-slate-950 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  required
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Table</span>
                </button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-4 shadow-xl flex flex-col items-center text-center hover:border-orange-500/40 transition group"
              >
                <div className="w-full flex items-center justify-between text-xs mb-2.5">
                  <span className="font-black text-white text-sm">Table #{t.table_number}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTable(t)}
                      className="p-1 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition"
                      title={`Delete Table #${t.table_number}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scannable High-Res QR Image */}
                {t.qr_code_image && (
                  <div className="p-3 bg-white rounded-2xl shadow-inner mb-3 transition group-hover:scale-105">
                    <img
                      src={t.qr_code_image}
                      alt={`Table ${t.table_number} QR Code`}
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                )}

                <div className="text-[11px] text-slate-400 mb-3 truncate w-full font-mono">
                  ID: {t.qr_identifier}
                </div>

                <div className="w-full flex space-x-2">
                  <a
                    href={`/?restaurant=${restaurantId}&table=${t.table_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-black bg-orange-600 hover:bg-orange-500 text-white transition flex items-center justify-center space-x-1 shadow-md shadow-orange-600/30"
                  >
                    <span>Open Table</span>
                  </a>
                  <a
                    href={t.qr_code_image}
                    download={`Table_${t.table_number}_QR.png`}
                    className="p-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                    title="Download Standee PNG"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Total QR Scans</span>
                <QrCode className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics?.total_qr_scans || 0}</div>
              <span className="text-[10px] text-emerald-400 font-bold">Diners seated via QR</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Menu Views</span>
                <Eye className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics?.total_menu_views || 0}</div>
              <span className="text-[10px] text-slate-400">Digital menu browsing</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>AI Interactions</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics?.total_ai_conversations || 0}</div>
              <span className="text-[10px] text-amber-400 font-bold">Voice & query sessions</span>
            </div>

            <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Kids Fun Zone</span>
                <Gamepad2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white">{analytics?.total_game_activity || 0}</div>
              <span className="text-[10px] text-purple-400 font-bold">Mini-game plays</span>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="font-black text-sm text-white mb-4">Popular Menu Categories & Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics?.popular_categories || []}
                    dataKey="interest_score"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name }) => name}
                  >
                    {(analytics?.popular_categories || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER AI INTERACTIONS */}
      {activeTab === 'chats' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-black text-base text-white">Recent Customer AI Sessions</h3>
            <p className="text-xs text-slate-400">Live conversation transcripts between diners and the AI waiter</p>
          </div>

          {chatSessions.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-500">No active chat sessions recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {chatSessions.map((session, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-orange-400">
                      📍 Table #{session.table_number} • {session.started_at}
                    </span>
                    <span className="text-slate-400">{session.message_count} messages</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {session.messages.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className={`text-xs p-2.5 rounded-xl max-w-[85%] leading-relaxed ${
                          m.sender === 'customer'
                            ? 'bg-orange-600/20 text-orange-200 border border-orange-500/30 ml-auto'
                            : 'bg-slate-800/80 text-slate-200 border border-slate-700 mr-auto'
                        }`}
                      >
                        <span className="font-black capitalize text-amber-400">{m.sender}: </span>
                        {m.message}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default OwnerDashboard;
