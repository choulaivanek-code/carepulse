import api from './axios';

export const adminApi = {
  getUsers: () => api.get('admin/utilisateurs'),
  createMedecin: (data: any) => api.post('admin/users/medecin', data),
  createAgent: (data: any) => api.post('admin/users/agent', data),
  updateUser: (id: number, data: any) => api.put(`admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`admin/users/${id}`),
  toggleUser: (id: number) => api.post(`admin/utilisateurs/${id}/toggle`),
  getRegles: () => api.get('admin/regles'),
  creerRegle: (data: any) => api.post('admin/regles', data),
  updateRegle: (id: number, data: any) => api.put(`admin/regles/${id}`, data),
  getParametres: () => api.get('admin/parametres'),
  updateParametre: (data: any) => api.put('admin/parametres', data),
  getFeedbacksNonModeres: () => api.get('admin/feedbacks/non-moderes'),
  modererFeedback: (id: number, approuve: boolean) => api.put(`admin/feedbacks/${id}/moderer`, { approuve }),
  getDashboardStats: () => api.get('stats/dashboard'),
  getMLStatus: () => api.get('ml/status'),
  triggerMLTraining: () => api.post('ml/train'),
  lancerBackup: () => api.post('admin/backup'),
};