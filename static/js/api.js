const Api = {
  base: '',

  token() { return localStorage.getItem('oxyde_token'); },
  setToken(t) { localStorage.setItem('oxyde_token', t); },
  clearToken() { localStorage.removeItem('oxyde_token'); },
  isLoggedIn() { return !!this.token(); },

  async request(path, { method = 'GET', body = null, form = false, auth = true } = {}) {
    const headers = {};
    if (auth && this.token()) headers['Authorization'] = `Bearer ${this.token()}`;

    let payload = null;
    if (body) {
      if (form) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        payload = new URLSearchParams(body).toString();
      } else {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
      }
    }

    const res = await fetch(this.base + path, { method, headers, body: payload });
    if (res.status === 204) return null;

    let data = null;
    try { data = await res.json(); } catch (e) {}

    if (!res.ok) {
      const message = (data && data.detail) ? formatError(data.detail) : `Error (${res.status})`;
      throw new Error(message);
    }
    return data;
  },

  register(email, password) {
    return this.request('/auth/register', { method: 'POST', body: { email, password }, auth: false });
  },

  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { grant_type: 'password', username: email, password },
      form: true,
      auth: false,
    });
  },

  me() { return this.request('/auth/me'); },
  updateProfile(payload) { return this.request('/auth/me', { method: 'PATCH', body: payload }); },
  changeEmail(new_email, current_password) {
    return this.request('/auth/change-email', { method: 'POST', body: { new_email, current_password } });
  },
  verifyEmailChange(code) { return this.request('/auth/verify-email-change', { method: 'POST', body: { code } }); },
  verifyEmail(code) { return this.request('/auth/verify-email', { method: 'POST', body: { code } }); },
  resendVerification() { return this.request('/auth/resend-verification', { method: 'POST' }); },
  forgotPassword(email) { return this.request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }); },
  resetPassword(email, code, new_password) {
    return this.request('/auth/reset-password', { method: 'POST', body: { email, code, new_password }, auth: false });
  },
  notifications() { return this.request('/account/notifications'); },
  markNotificationsSeen() { return this.request('/account/notifications/seen', { method: 'POST' }); },
  vapidPublicKey() { return this.request('/push/vapid-public-key'); },
  pushSubscribe(sub) { return this.request('/push/subscribe', { method: 'POST', body: sub }); },
  pushUnsubscribe(endpoint) { return this.request(`/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`, { method: 'DELETE' }); },
  listLeads(storeId) { return this.request(`/stores/${storeId}/leads`); },
  supportChat(message, history) { return this.request('/support/chat', { method: 'POST', body: { message, history } }); },

  createDiscountCode(storeId, payload) { return this.request(`/stores/${storeId}/discount-codes`, { method: 'POST', body: payload }); },
  listDiscountCodes(storeId) { return this.request(`/stores/${storeId}/discount-codes`); },
  toggleDiscountCode(storeId, codeId) { return this.request(`/stores/${storeId}/discount-codes/${codeId}`, { method: 'PATCH' }); },
  deleteDiscountCode(storeId, codeId) { return this.request(`/stores/${storeId}/discount-codes/${codeId}`, { method: 'DELETE' }); },

  async importProductsCsv(storeId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    if (this.token()) headers['Authorization'] = `Bearer ${this.token()}`;
    const res = await fetch(`${this.base}/stores/${storeId}/products/import`, { method: 'POST', headers, body: formData });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data && data.detail) ? formatError(data.detail) : `Error (${res.status})`;
      throw new Error(message);
    }
    return data;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    if (this.token()) headers['Authorization'] = `Bearer ${this.token()}`;
    const res = await fetch(`${this.base}/auth/me/avatar`, { method: 'POST', headers, body: formData });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data && data.detail) ? formatError(data.detail) : `Error (${res.status})`;
      throw new Error(message);
    }
    return data;
  },

  deleteAvatar() { return this.request('/auth/me/avatar', { method: 'DELETE' }); },
  createLead(storeId, payload) { return this.request(`/stores/${storeId}/leads`, { method: 'POST', body: payload }); },
  updateLead(storeId, leadId, payload) { return this.request(`/stores/${storeId}/leads/${leadId}`, { method: 'PATCH', body: payload }); },
  deleteLead(storeId, leadId) { return this.request(`/stores/${storeId}/leads/${leadId}`, { method: 'DELETE' }); },
  myStores() { return this.request('/stores/me'); },

  createStore(name, subdomain, template = 'default', redeem_code = null) {
    return this.request('/stores', { method: 'POST', body: { name, subdomain, template, redeem_code } });
  },

  updateStore(storeId, updates) {
    return this.request(`/stores/${storeId}`, { method: 'PATCH', body: updates });
  },

  deleteStore(storeId) {
    return this.request(`/stores/${storeId}`, { method: 'DELETE' });
  },

  storeProducts(storeId) {
    return this.request(`/stores/${storeId}/products`);
  },

  createProduct(storeId, product) {
    return this.request(`/stores/${storeId}/products`, { method: 'POST', body: product });
  },

  updateProduct(storeId, productId, updates) {
    return this.request(`/stores/${storeId}/products/${productId}`, { method: 'PATCH', body: updates });
  },

  deleteProduct(storeId, productId) {
    return this.request(`/stores/${storeId}/products/${productId}`, { method: 'DELETE' });
  },
  createVariant(storeId, productId, payload) {
    return this.request(`/stores/${storeId}/products/${productId}/variants`, { method: 'POST', body: payload });
  },
  updateVariant(storeId, productId, variantId, payload) {
    return this.request(`/stores/${storeId}/products/${productId}/variants/${variantId}`, { method: 'PATCH', body: payload });
  },
  deleteVariant(storeId, productId, variantId) {
    return this.request(`/stores/${storeId}/products/${productId}/variants/${variantId}`, { method: 'DELETE' });
  },

  storeOrders(storeId) {
    return this.request(`/stores/${storeId}/orders`);
  },

  updateOrderStatus(storeId, orderId, status) {
    return this.request(`/stores/${storeId}/orders/${orderId}`, { method: 'PATCH', body: { status } });
  },

  analytics(storeId, opts = {}) {
    const params = new URLSearchParams();
    if (opts.range) params.set('range', opts.range);
    else params.set('days', opts.days || 30);
    return this.request(`/stores/${storeId}/analytics?${params.toString()}`);
  },

  // ---------- Courier Integrations ----------
  courierIntegrations(storeId) {
    return this.request(`/stores/${storeId}/courier-integrations`);
  },
  saveCourierIntegration(storeId, code, credentials) {
    return this.request(`/stores/${storeId}/courier-integrations/${code}`, { method: 'PUT', body: { credentials } });
  },
  disconnectCourierIntegration(storeId, code) {
    return this.request(`/stores/${storeId}/courier-integrations/${code}`, { method: 'DELETE' });
  },

  // ---------- Delivery Prices (with stop-desk) ----------
  updateDeliveryPriceV2(storeId, province, price, stopDeskPrice) {
    return this.request(`/stores/${storeId}/delivery-prices`, { method: 'PATCH', body: { province, price, stop_desk_price: stopDeskPrice } });
  },

  // ---------- Bundles ----------
  bundles(storeId) {
    return this.request(`/stores/${storeId}/bundles`);
  },
  createBundle(storeId, payload) {
    return this.request(`/stores/${storeId}/bundles`, { method: 'POST', body: payload });
  },
  updateBundle(storeId, bundleId, payload) {
    return this.request(`/stores/${storeId}/bundles/${bundleId}`, { method: 'PATCH', body: payload });
  },
  deleteBundle(storeId, bundleId) {
    return this.request(`/stores/${storeId}/bundles/${bundleId}`, { method: 'DELETE' });
  },

  // ---------- Staff ----------
  staffList(storeId) {
    return this.request(`/stores/${storeId}/staff`);
  },
  createStaff(storeId, payload) {
    return this.request(`/stores/${storeId}/staff`, { method: 'POST', body: payload });
  },
  deleteStaff(storeId, staffId) {
    return this.request(`/stores/${storeId}/staff/${staffId}`, { method: 'DELETE' });
  },
  assignOrderStaff(storeId, orderId, staffId) {
    return this.request(`/stores/${storeId}/orders/${orderId}/assign-staff`, { method: 'PATCH', body: { staff_id: staffId } });
  },

  shipOrder(storeId, orderId, payload) {
    return this.request(`/stores/${storeId}/orders/${orderId}/ship`, { method: 'POST', body: payload });
  },

  deliveryPrices(storeId, lang = 'ar') {
    return this.request(`/stores/${storeId}/delivery-prices?lang=${lang}`);
  },

  updateDeliveryPrice(storeId, province, price) {
    return this.request(`/stores/${storeId}/delivery-prices`, {
      method: 'PATCH',
      body: { province, price: Math.round(price * 100) },
    });
  },

  async uploadImage(storeId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    if (this.token()) headers['Authorization'] = `Bearer ${this.token()}`;

    const res = await fetch(`${this.base}/stores/${storeId}/upload-image`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data && data.detail) ? formatError(data.detail) : `Error (${res.status})`;
      throw new Error(message);
    }
    return data.url;
  },

  async addProductImage(storeId, productId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const headers = {};
    if (this.token()) headers['Authorization'] = `Bearer ${this.token()}`;

    const res = await fetch(`${this.base}/stores/${storeId}/products/${productId}/images`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = (data && data.detail) ? formatError(data.detail) : `Error (${res.status})`;
      throw new Error(message);
    }
    return data;
  },

  deleteProductImage(storeId, productId, imageId) {
    return this.request(`/stores/${storeId}/products/${productId}/images/${imageId}`, { method: 'DELETE' });
  },

  createOrder(storeId, productId, order) {
    return this.request(`/stores/${storeId}/products/${productId}/orders`, {
      method: 'POST', body: order, auth: false,
    });
    
  },
  redeemStoreCode(storeId, code) {
    return this.request(`/stores/${storeId}/redeem`, {
      method: 'POST',
      body: { code },
    });
  },
  saveCustomDomain(storeId, domain) {
    return this.request(`/stores/${storeId}/custom-domain`, {
      method: 'PATCH',
      body: { domain },
    });
  },

  customDomainStatus(storeId) {
    return this.request(`/stores/${storeId}/custom-domain`);
  },

  verifyCustomDomain(storeId) {
    return this.request(`/stores/${storeId}/custom-domain/verify`, { method: 'POST' });
  },
  aiGenerateProduct(storeId, product_name, keywords, generate_image, lang = 'ar') {
    return this.request(`/stores/${storeId}/products/ai-generate`, {
      method: 'POST',
      body: { product_name, keywords, generate_image, lang },
    });
  },
  accountOverview() { return this.request('/account/overview'); },
  listFunnels(storeId) { return this.request(`/stores/${storeId}/funnels`); },
  createFunnel(storeId, payload) {
    return this.request(`/stores/${storeId}/funnels`, { method: 'POST', body: payload });
  },
  updateFunnel(storeId, funnelId, payload) {
    return this.request(`/stores/${storeId}/funnels/${funnelId}`, { method: 'PATCH', body: payload });
  },
  deleteFunnel(storeId, funnelId) {
    return this.request(`/stores/${storeId}/funnels/${funnelId}`, { method: 'DELETE' });
  },
};


function formatError(detail) {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(d => d.msg).join(', ');
  return 'An unexpected error occurred';
}

function requireAuth() {
  if (!Api.isLoggedIn()) window.location.href = 'login.html';
}

function showAlert(el, message) { el.textContent = message; el.style.display = 'block'; }
function hideAlert(el) { el.style.display = 'none'; }
