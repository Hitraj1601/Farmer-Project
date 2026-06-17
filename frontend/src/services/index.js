import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

export const cropService = {
  getAll: (params) => api.get('/crops', { params }),
  getMyCrops: () => api.get('/crops/my'),
  getById: (id) => api.get(`/crops/${id}`),
  create: (formData) =>
    api.post('/crops', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) =>
    api.put(`/crops/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/crops/${id}`),
  getStockAlerts: () => api.get('/crops/alerts'),
  bulkUpload: (formData) =>
    api.post('/crops/bulk-upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export const orderService = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

export const paymentService = {
  createOrder: (orderId) => api.post('/payments/create-order', { orderId }),
  verify: (data) => api.post('/payments/verify', data),
  processFree: (orderId) => api.post('/payments/free', { orderId }),
};

export const reviewService = {
  create: (formData) =>
    api.post('/reviews', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getFarmerReviews: (farmerId) => api.get(`/reviews/farmer/${farmerId}`),
  getCropReviews: (cropId) => api.get(`/reviews/crop/${cropId}`),
};

export const profileService = {
  getFarmerProfile: () => api.get('/profile/farmer'),
  upsertFarmerProfile: (data) => api.post('/profile/farmer', data),
  getBuyerProfile: () => api.get('/profile/buyer'),
  upsertBuyerProfile: (data) => api.post('/profile/buyer', data),
};

export const adminService = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
};

export const analyticsService = {
  getPriceTrend: (params) => api.get('/analytics/price-trend', { params }),
  getDemandForecast: (params) => api.get('/analytics/demand-forecast', { params }),
  getSuggestedPrice: (params) => api.get('/analytics/suggested-price', { params }),
  getOrderTracking: (orderId) => api.get(`/analytics/tracking/${orderId}`),
  simulateLocation: (orderId) => api.post(`/analytics/tracking/${orderId}/simulate`),
};

export const wishlistService = {
  getAll: () => api.get('/wishlist'),
  getIds: () => api.get('/wishlist/ids'),
  add: (cropId) => api.post(`/wishlist/${cropId}`),
  remove: (cropId) => api.delete(`/wishlist/${cropId}`),
  checkPriceDrops: () => api.get('/wishlist/price-drops'),
};

export const chatService = {
  getOrCreateConversation: (farmerId, cropId) =>
    api.post('/chat/conversation', { farmerId, cropId }),
  sendMessage: (conversationId, content) =>
    api.post('/chat/message', { conversationId, content }),
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}`),
  getUnreadCount: () => api.get('/chat/unread-count'),
};
