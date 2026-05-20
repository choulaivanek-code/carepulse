import api from './axios';
import type { User, ApiResponse } from '../types';

export const medecinApi = {
  getMedecinsByFile: (fileAttenteId: number) => 
    api.get<ApiResponse<User[]>>(`medecins/par-file/${fileAttenteId}`),
  getMedecinsDisponibles: () =>
    api.get<ApiResponse<any[]>>('medecins/disponibles'),
  getMoi: () => 
    api.get<ApiResponse<any>>('medecins/moi'),
  togglePause: () => 
    api.patch<ApiResponse<any>>('medecins/pause'),
};
