import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api'
);

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Auto attach JWT token from localStorage to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('psg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const bookAPI = {
  // Books CRUD
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id, force = false) => api.delete(`/books/${id}?force=${force}`),
  getStats: () => api.get('/books/stats'),
  returnBookByBookId: (bookId, rollNumber) => api.post(`/books/${bookId}/return`, { rollNumber }),

  // Student & Faculty Self-Service Circulation
  getMyLoans: (rollNumber) => api.get('/issues/my-loans', { params: { rollNumber } }),
  selfIssueBook: (bookId) => api.post('/issues/self-issue', { bookId }),
  selfReturnBook: (issueId) => api.put(`/issues/${issueId}/self-return`),

  // Librarian Circulation Desk
  getIssues: (params) => api.get('/issues', { params }),
  issueBook: (data) => api.post('/issues', data),
  returnIssue: (id, remarks) => api.put(`/issues/${id}/return`, { remarks }),

  // Utilities & Demo
  seedDatabase: () => api.post('/seed'),
  checkHealth: () => api.get('/health'),
};

export default api;
