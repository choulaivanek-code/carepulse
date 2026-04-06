import axios from './axios';
import type { StatsDashboard, ApiResponse } from '../types';

export const statsApi = {
  getDashboardStats: () => 
    axios.get<ApiResponse<StatsDashboard>>('stats/dashboard'),
    
  getEvolutionTickets: (jours: number) => 
    axios.get<ApiResponse<any>>(`stats/evolution?jours=${jours}`),
};
