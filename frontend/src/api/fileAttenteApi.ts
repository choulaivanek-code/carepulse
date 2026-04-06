import api from './axios';
import type { FileAttente, ApiResponse } from '../types';

export const fileAttenteApi = {
  getFiles: () => 
    api.get<ApiResponse<FileAttente[]>>('files'),
    
  getFileById: (id: number) => 
    api.get<ApiResponse<FileAttente>>(`files/${id}`),
    
  getPosition: (id: number) => 
    api.get<ApiResponse<number>>(`files/${id}/position`),
    
  getTempsAttente: (id: number) => 
    api.get<ApiResponse<number>>(`files/${id}/temps-attente`),
};
