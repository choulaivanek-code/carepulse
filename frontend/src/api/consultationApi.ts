import api from './axios';
import type { Consultation, ApiResponse } from '../types';

export const consultationApi = {
  demarrer: (ticketId: number) => 
    api.post<ApiResponse<Consultation>>(`consultations/demarrer/${ticketId}`),
    
  updateContenu: (ticketId: number, data: { symptomes?: string, diagnostic?: string, traitement?: string, examens?: string }) => 
    api.put<ApiResponse<Consultation>>(`consultations/${ticketId}/contenu`, data),
    
  cloturer: (ticketId: number) => 
    api.post<ApiResponse<Consultation>>(`consultations/${ticketId}/cloturer`),
    
  getByPatient: (patientId: number) => 
    api.get<ApiResponse<Consultation[]>>(`consultations/patient/${patientId}`),
    
  getByMedecin: (medecinId: number) => 
    api.get<ApiResponse<Consultation[]>>(`consultations/medecin/${medecinId}`),
};
