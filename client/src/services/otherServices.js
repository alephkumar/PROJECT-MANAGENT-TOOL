import api from './api';

export const userService = {
  getAll: (params) => api.get('/users', { params }).then((res) => res.data),
  getById: (id) => api.get(`/users/${id}`).then((res) => res.data),
  update: (id, data) => api.put(`/users/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/users/${id}`).then((res) => res.data),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard').then((res) => res.data),
};

export const notificationService = {
  getAll: () => api.get('/notifications').then((res) => res.data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`).then((res) => res.data),
  markAllAsRead: () => api.put('/notifications/read-all').then((res) => res.data),
  delete: (id) => api.delete(`/notifications/${id}`).then((res) => res.data),
};

export const reportService = {
  getTaskReport: (params) => api.get('/reports/tasks', { params }).then((res) => res.data),
  getProjectReport: () => api.get('/reports/projects').then((res) => res.data),
  getPerformanceReport: () => api.get('/reports/performance').then((res) => res.data),
};

const services = { userService, dashboardService, notificationService, reportService };
export default services;
