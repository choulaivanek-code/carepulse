import api from './axios';
import type { AuthResponse, LoginRequest, RegisterRequest, ApiResponse, User } from '../types';

export const authApi = {
  login: (data: LoginRequest) => 
    api.post<ApiResponse<AuthResponse>>('auth/login', data),
    
  register: (data: RegisterRequest) => 
    api.post<ApiResponse<AuthResponse>>('auth/register', data),
    
  getMe: () => 
    api.get<ApiResponse<User>>('auth/me'),
};
