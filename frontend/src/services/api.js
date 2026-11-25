const API_HOST = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const API_BASE = `http://${API_HOST}:8000/api`;

export function getNeuralTtsUrl(text, language = 'en') {
  return `${API_BASE}/chat/tts?text=${encodeURIComponent(text)}&language=${encodeURIComponent(language)}`;
}

// Public endpoints
export async function getRestaurantInfo(restaurantId = 1) {
  const res = await fetch(`${API_BASE}/public/restaurant/${restaurantId}`);
  if (!res.ok) throw new Error('Failed to load restaurant information');
  return res.json();
}

export async function getTableInfo(restaurantId = 1, tableNumber = 1) {
  const res = await fetch(`${API_BASE}/public/restaurant/${restaurantId}/table/${tableNumber}`);
  if (!res.ok) throw new Error('Table not found');
  return res.json();
}

export async function getMenu(restaurantId = 1, filters = {}) {
  const params = new URLSearchParams();
  if (filters.dietary) params.append('dietary', filters.dietary);
  if (filters.max_price) params.append('max_price', filters.max_price);

  const res = await fetch(`${API_BASE}/public/restaurant/${restaurantId}/menu?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load menu');
  return res.json();
}

export async function getOffers(restaurantId = 1) {
  const res = await fetch(`${API_BASE}/public/restaurant/${restaurantId}/offers`);
  if (!res.ok) throw new Error('Failed to load offers');
  return res.json();
}

export async function getLanguages() {
  const res = await fetch(`${API_BASE}/public/languages`);
  if (!res.ok) throw new Error('Failed to load languages');
  return res.json();
}

export async function getOllamaStatus() {
  try {
    const res = await fetch(`${API_BASE}/chat/ollama-status`);
    if (!res.ok) return { online: false, message: 'Ollama offline' };
    return res.json();
  } catch (e) {
    return { online: false, message: 'Ollama offline' };
  }
}

// AI Chat endpoint
export async function sendChatMessage({ restaurantId, tableId, sessionToken, message, languageCode = 'en' }) {
  const res = await fetch(`${API_BASE}/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      restaurant_id: Number(restaurantId),
      table_id: tableId ? Number(tableId) : null,
      session_token: sessionToken || null,
      message,
      language_code: languageCode
    })
  });
  if (!res.ok) throw new Error('Failed to send message to AI assistant');
  return res.json();
}

// Analytics tracking
export async function trackEvent({ restaurantId = 1, tableId = null, eventType, eventData = {} }) {
  try {
    await fetch(`${API_BASE}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: Number(restaurantId),
        table_id: tableId ? Number(tableId) : null,
        event_type: eventType,
        event_data: eventData
      })
    });
  } catch (err) {
    console.debug('Analytics error:', err);
  }
}

// Admin / Owner Dashboard endpoints
export async function adminLogin(email, password) {
  const res = await fetch(`${API_BASE}/admin/json-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Login failed');
  }
  return res.json();
}

export async function getAdminDailyMenu(restaurantId = 1, token) {
  const res = await fetch(`${API_BASE}/admin/restaurant/${restaurantId}/daily-menu`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch daily menu');
  return res.json();
}

export async function updateDailyMenuAvailability(updateData, token) {
  const res = await fetch(`${API_BASE}/admin/daily-menu/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error('Failed to update daily menu availability');
  return res.json();
}

export async function getAdminTables(restaurantId = 1, token) {
  const res = await fetch(`${API_BASE}/admin/restaurant/${restaurantId}/tables`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch tables and QR codes');
  return res.json();
}

export async function addAdminTable(restaurantId = 1, tableNumber, token) {
  const res = await fetch(`${API_BASE}/admin/restaurant/${restaurantId}/tables?table_number=${tableNumber}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to add table');
  return res.json();
}

export async function getAdminProfile(token) {
  const res = await fetch(`${API_BASE}/admin/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch admin profile');
  return res.json();
}

export async function getAdminAnalytics(restaurantId = 1, token) {
  const res = await fetch(`${API_BASE}/admin/restaurant/${restaurantId}/analytics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function getAdminChatSessions(restaurantId = 1, token) {
  const res = await fetch(`${API_BASE}/admin/restaurant/${restaurantId}/chat-sessions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch AI chat sessions');
  return res.json();
}

export async function getAdminCategories(restaurantId = 1, token) {
  const res = await fetch(`${API_BASE}/admin/restaurant/${restaurantId}/categories`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function createAdminCategory(restaurantId = 1, data, token) {
  const res = await fetch(`${API_BASE}/admin/restaurant/${restaurantId}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create category');
  }
  return res.json();
}

export async function deleteAdminCategory(categoryId, token) {
  const res = await fetch(`${API_BASE}/admin/categories/${categoryId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete category');
  return res.json();
}

export async function createAdminMenuItem(restaurantId = 1, itemData, token) {
  const res = await fetch(`${API_BASE}/admin/restaurant/${restaurantId}/menu-items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(itemData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to add menu item');
  }
  return res.json();
}

export async function updateAdminMenuItem(menuItemId, itemData, token) {
  const res = await fetch(`${API_BASE}/admin/menu-items/${menuItemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(itemData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update menu item');
  }
  return res.json();
}

export async function deleteAdminMenuItem(menuItemId, token) {
  const res = await fetch(`${API_BASE}/admin/menu-items/${menuItemId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete menu item');
  return res.json();
}

export async function deleteAdminTable(tableId, token) {
  const res = await fetch(`${API_BASE}/admin/tables/${tableId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete table');
  return res.json();
}
