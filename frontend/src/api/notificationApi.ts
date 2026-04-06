import api from './axios';
import type { Notification, ApiResponse } from '../types';

export const notificationApi = {
  getNotifications: () => 
    api.get<ApiResponse<Notification[]>>('notifications'),
    
  markAsRead: (id: number) => 
    api.put<ApiResponse<void>>(`notifications/${id}/read`),
    
  markAllAsRead: () => 
    api.put<ApiResponse<void>>('notifications/read-all'),
};
