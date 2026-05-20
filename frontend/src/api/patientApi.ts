import API from './axios';

export const patientApi = {
  getPoints: () => API.get('/patients/moi/points'),
};
