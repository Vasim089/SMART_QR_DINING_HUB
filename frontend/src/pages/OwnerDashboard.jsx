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
  Utensils
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
  getAdminAnalytics,
  getAdminDailyMenu,
  updateDailyMenuAvailability,
  getAdminTables,
  addAdminTable,
  getAdminChatSessions
} from '../services/api';

const COLORS = ['#ea580c', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export function OwnerDashboard({ restaurantId = 1 }) {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [email, setEmail] = useState('admin@dininghub.com');
  const [password, setPassword] = useState('admin123');
  const [loginError, setLoginError] = useState('');
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('daily_menu'); // 'overview', 'daily_menu', 'tables', 'chats'
  const [analytics, setAnalytics] = useState(null);
  const [dailyMenu, setDailyMenu] = useState([]);
  const [tables, setTables] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [newTableNum, setNewTableNum] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Perform login
  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoginError('');
    try {
      const data = await adminLogin(email, password);
      setToken(data.access_token);
      localStorage.setItem('admin_token', data.access_token);
    } catch (err) {
      setLoginError(err.message || 'Login failed');
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
      const [analyticsData, menuData, tablesData, chatsData] = await Promise.all([
        getAdminAnalytics(restaurantId, token),
        getAdminDailyMenu(restaurantId, token),
        getAdminTables(restaurantId, token),
        getAdminChatSessions(restaurantId, token)
      ]);
      setAnalytics(analyticsData);
      setDailyMenu(menuData);
      setTables(tablesData);
      setChatSessions(chatsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      if (err.message.includes('401') || err.message.includes('credentials')) {
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

    // Optimistic UI update
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

  // If not authenticated, show login form
  if (!token) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <div className="bg-white p-7 rounded-3xl shadow-xl border border-slate-200/80 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Utensils className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Restaurant Owner Login</h2>
            <p className="text-xs text-slate-500 mt-1">Manage daily menu availability, QR codes, and analytics</p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md text-sm transition"
            >
              Sign In to Owner Portal
            </button>
          </form>

          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
            <strong>Default Credentials:</strong><br />
            Email: <code>admin@dininghub.com</code><br />
            Password: <code>admin123</code>
          </div>
        </div>
      </div>
    );
  }

  // Activity chart data
  const kpiData = [
    { name: 'QR Scans', count: analytics?.total_qr_scans || 0 },
    { name: 'Menu Views', count: analytics?.total_menu_views || 0 },
    { name: 'AI Chats', count: analytics?.total_ai_conversations || 0 },
    { name: 'Voice Talk', count: analytics?.total_voice_interactions || 0 },
    { name: 'Kids Games', count: analytics?.total_game_activity || 0 },
    { name: 'Offer Clicks', count: analytics?.total_offer_clicks || 0 },
    { name: 'Reviews', count: analytics?.total_review_clicks || 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-20">
      
      {/* Top Bar */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Owner Management Hub</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-0.5">The Royal Spice Bistro — Dashboard</h2>
          <p className="text-xs text-slate-400">Live table QR codes, daily menu stock, and AI dining analytics</p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('daily_menu')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'daily_menu'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Daily Menu Availability (Step 5/6)</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Engagement (Step 12)</span>
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'tables'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Table QR Codes ({tables.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('chats')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'chats'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Customer AI Interactions</span>
        </button>
      </div>

      {/* TAB 1: DAILY MENU AVAILABILITY (Pages 5-6 of Roadmap PDF) */}
      {activeTab === 'daily_menu' && (
        <div className="space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-xs text-orange-950 leading-relaxed">
              <strong>Real-Time AI Menu Synchronization:</strong> When you mark an item <strong>Sold Out</strong>,
              the AI Assistant will immediately stop recommending it to customers. Marking an item as <strong>Today's Special</strong> will
              cause the AI to highlight it with your special price!
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Today's Menu Item Controls ({dailyMenu.length} dishes)</h3>
              <span className="text-xs text-slate-500">Date: {new Date().toISOString().split('T')[0]}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {dailyMenu.map((item) => (
                <div
                  key={item.menu_item_id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/60 transition"
                >
                  <div className="flex items-center space-x-3">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                        <span>Base Price: <strong>${item.base_price.toFixed(2)}</strong></span>
                        {item.is_today_special && item.special_price && (
                          <span className="text-orange-600 font-bold">
                            • Special: ${item.special_price.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-3">
                    
                    {/* Available / Sold out Toggle */}
                    <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => handleToggleAvailability(item, true)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                          item.is_available
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Available
                      </button>
                      <button
                        onClick={() => handleToggleAvailability(item, false)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg transition ${
                          !item.is_available
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Sold Out
                      </button>
                    </div>

                    {/* Today's Special Toggle */}
                    <button
                      onClick={() => handleToggleSpecial(item, !item.is_today_special)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition flex items-center space-x-1 ${
                        item.is_today_special
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <span>⭐ Today's Special</span>
                    </button>

                    {/* Special Price Input if special */}
                    {item.is_today_special && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-slate-500">$</span>
                        <input
                          type="number"
                          step="0.5"
                          defaultValue={item.special_price || +(item.base_price * 0.85).toFixed(2)}
                          onBlur={(e) => handleUpdatePrice(item, e.target.value)}
                          className="w-18 px-2 py-1 text-xs border border-amber-300 rounded-lg bg-amber-50/50 text-slate-900 font-bold focus:ring-1 focus:ring-amber-500"
                          title="Press tab or click out to save special price"
                        />
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: OVERVIEW & ANALYTICS (Step 12 of Roadmap PDF) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Total QR Scans</span>
                <QrCode className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{analytics?.total_qr_scans || 0}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">+18% today</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Menu Views</span>
                <Eye className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{analytics?.total_menu_views || 0}</div>
              <span className="text-[10px] text-slate-400">Digital menu browsing</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>AI Conversations</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{analytics?.total_ai_conversations || 0}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Qwen 2.5 3B Engine</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Voice Interactions</span>
                <Mic className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{analytics?.total_voice_interactions || 0}</div>
              <span className="text-[10px] text-slate-400">Web Speech API</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Kids Zone Activity</span>
                <Gamepad2 className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{analytics?.total_game_activity || 0}</div>
              <span className="text-[10px] text-purple-600 font-semibold">Games played</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Offer Clicks</span>
                <Tag className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{analytics?.total_offer_clicks || 0}</div>
              <span className="text-[10px] text-slate-400">Promotions claimed</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                <span>Review Clicks</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-2xl font-black text-slate-900">{analytics?.total_review_clicks || 0}</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Customer satisfaction</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Activity Bar Chart */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <h3 className="font-extrabold text-sm text-slate-900 mb-4 flex items-center justify-between">
                <span>Feature Engagement Breakdown</span>
                <span className="text-xs text-slate-400 font-normal">Events count</span>
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpiData}>
                    <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                    <YAxis fontSize={11} stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ea580c" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
              <h3 className="font-extrabold text-sm text-slate-900 mb-4">
                Popular Menu Categories & Distribution
              </h3>
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

          {/* Recent Analytics Events Log */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-900 mb-3">Live Customer Interaction Feed</h3>
            <div className="divide-y divide-slate-100">
              {(analytics?.recent_events || []).map((e, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {e.event_type.replace('_', ' ')}
                    </span>
                    <span className="text-slate-500 truncate max-w-xs">
                      {JSON.stringify(e.event_data)}
                    </span>
                  </div>
                  <span className="text-slate-400 whitespace-nowrap">{e.created_at}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: TABLE QR CODES (Step 1 of Roadmap PDF) */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Table QR Code Manager</h3>
              <p className="text-xs text-slate-500">Every restaurant table has its own unique QR code to link customers instantly.</p>
            </div>

            <form onSubmit={handleAddTable} className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Table #"
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                className="w-24 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                required
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Table</span>
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((t) => (
              <div
                key={t.id}
                className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center text-center hover:shadow-md transition"
              >
                <div className="w-full flex items-center justify-between text-xs mb-2">
                  <span className="font-extrabold text-slate-900 text-sm">Table #{t.table_number}</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                {/* QR Image */}
                {t.qr_code_image && (
                  <div className="p-2 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                    <img
                      src={t.qr_code_image}
                      alt={`Table ${t.table_number} QR Code`}
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                )}

                <div className="text-[11px] text-slate-400 mb-3 truncate w-full">
                  ID: {t.qr_identifier}
                </div>

                <div className="w-full flex space-x-2">
                  <a
                    href={`/?restaurant=${restaurantId}&table=${t.table_number}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-2 rounded-xl text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
                  >
                    Open View
                  </a>
                  <a
                    href={t.qr_code_image}
                    download={`Table_${t.table_number}_QR.png`}
                    className="p-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                    title="Download QR Image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOMER AI INTERACTIONS */}
      {activeTab === 'chats' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-base text-slate-900">Recent Customer AI Sessions</h3>
            <p className="text-xs text-slate-500">Live conversation transcripts between diners and the AI waiter</p>
          </div>

          {chatSessions.length === 0 ? (
            <p className="text-center py-8 text-xs text-slate-400">No active chat sessions recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {chatSessions.map((session, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      📍 Table {session.table_number} • {session.started_at}
                    </span>
                    <span className="text-slate-500">{session.message_count} messages</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    {session.messages.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className={`text-xs p-2 rounded-xl max-w-[85%] ${
                          m.sender === 'customer'
                            ? 'bg-orange-100 text-orange-950 ml-auto'
                            : 'bg-white text-slate-800 border border-slate-200 mr-auto'
                        }`}
                      >
                        <span className="font-bold capitalize">{m.sender}: </span>
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
  );
}
