import api from './axios';
import type { Message, ApiResponse } from '../types';

export const messageApi = {
  envoyer: (ticketId: number, contenu: string) => 
    api.post<ApiResponse<Message>>('messages', { ticketId, contenu }),
    
  getByTicket: (ticketId: number) => 
    api.get<ApiResponse<Message[]>>(`messages/conversation/${ticketId}`),
    
  marquerCommeLu: (id: number) => 
    api.put<ApiResponse<void>>(`messages/conversation/${id}/lire`),
};
