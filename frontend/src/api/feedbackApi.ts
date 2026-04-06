import axios from './axios';
import type { Feedback, FeedbackRequest, ApiResponse } from '../types';

export const feedbackApi = {
  submitFeedback: (data: FeedbackRequest) => 
    axios.post<ApiResponse<Feedback>>('feedbacks', data),
    
  getFeedbacks: () => 
    axios.get<ApiResponse<Feedback[]>>('feedbacks'),
    
  approuverFeedback: (id: number) => 
    axios.put<ApiResponse<Feedback>>(`feedbacks/${id}/approuver`),
};
