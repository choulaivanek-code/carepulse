import api from './axios';
import type { User, ApiResponse } from '../types';

export const medecinApi = {
  getMedecinsByFile: (fileAttenteId: number) => 
    api.get<ApiResponse<User[]>>(`medecins/par-file/${fileAttenteId}`),
  getMoi: () => 
    api.get<ApiResponse<any>>('medecins/moi'),
  togglePause: () => 
    api.patch<ApiResponse<any>>('medecins/pause'),
};
