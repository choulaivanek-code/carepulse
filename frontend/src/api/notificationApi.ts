import api from './axios';
import type { Notification } from '../types';

export const notificationApi = {
  getNotifications: () => 
    api.get<Notification[]>('/notifications'),
    
  markAsRead: (id: number) => 
    api.patch(`/notifications/${id}/lu`),
    
  markAllAsRead: () => 
    api.patch('/notifications/tout-lire'),

  deleteNotification: (id: number) =>
    api.delete(`/notifications/${id}`),
};
