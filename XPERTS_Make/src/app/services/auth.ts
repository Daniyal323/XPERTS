import api from './api';

export const authService = {
  register: async (email: string, password: string, role: 'SME' | 'EXPERT') => {
    const response = await api.post('/auth/register', { email, password, role });
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    // Form data is required by OAuth2PasswordRequestForm in backend
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
