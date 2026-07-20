import api from './api';

export const projectService = {
  getAll: (params) => api.get('/projects', { params }).then((res) => res.data),
  getById: (id) => api.get(`/projects/${id}`).then((res) => res.data),
  create: (data) => api.post('/projects', data).then((res) => res.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/projects/${id}`).then((res) => res.data),
  recalculateProgress: (id) =>
    api.put(`/projects/${id}/recalculate-progress`).then((res) => res.data),
};

export default projectService;
