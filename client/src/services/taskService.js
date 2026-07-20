import api from './api';

export const taskService = {
  getAll: (params) => api.get('/tasks', { params }).then((res) => res.data),
  getById: (id) => api.get(`/tasks/${id}`).then((res) => res.data),
  create: (data) => api.post('/tasks', data).then((res) => res.data),
  update: (id, data) => api.put(`/tasks/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/tasks/${id}`).then((res) => res.data),
  addComment: (id, text) =>
    api.post(`/tasks/${id}/comments`, { text }).then((res) => res.data),
  uploadAttachment: (id, formData) =>
    api
      .post(`/upload/task/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data),
};

export default taskService;
