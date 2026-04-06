import api from './axios';
import type { Ticket, ApiResponse } from '../types';

export const ticketApi = {
  creerTicket: (data: { fileAttenteId: number, motif: string, estUrgence: boolean, justificationUrgence?: string, consultationType: string }) => {
    return api.post<ApiResponse<Ticket>>('tickets', data);
  },
    
  getTicket: (id: number) => {
    return api.get<ApiResponse<Ticket>>(`tickets/${id}`);
  },
    
  getTicketsByFile: (fileAttenteId: number) => {
    return api.get<ApiResponse<Ticket[]>>(`tickets/file/${fileAttenteId}`);
  },
    
  getTousLesTicketsActifs: () => {
    return api.get<ApiResponse<Ticket[]>>('tickets/actifs');
  },
    
  getMesTickets: () => {
    return api.get<ApiResponse<Ticket[]>>('tickets/mes-tickets');
  },
    
  confirmerPresence: (id: number) => {
    return api.patch<ApiResponse<void>>(`tickets/${id}/confirmer-presence`);
  },
    
  signalerAbsence: (id: number) => {
    return api.patch<ApiResponse<void>>(`tickets/${id}/signaler-absence`);
  },
    
  annulerTicket: (id: number) => {
    return api.delete<ApiResponse<void>>(`tickets/${id}`);
  },
    
  insererUrgence: (data: any) => {
    return api.post<ApiResponse<Ticket>>('tickets/urgence', data);
  },
    
  appellerPatient: (id: number) => {
    return api.post<ApiResponse<Ticket>>(`tickets/${id}/appeler`);
  },
    
  getConsoleTickets: () => {
    return api.get<ApiResponse<Ticket[]>>('tickets/console');
  },
};
