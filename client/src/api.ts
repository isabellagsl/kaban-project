import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Interceptor: Injeta o token em TODA requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kanban_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log("⚠️ Atenção: Tentando fazer requisição SEM token!");
  }
  
  return config;
});

export default api;