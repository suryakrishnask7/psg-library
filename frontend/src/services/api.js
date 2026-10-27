import axios from 'axios';

// Get API base URL from Vite env or fallback to relative /api or localhost:5000/api
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

export const bookAPI = {
  // Books CRUD
  getAll: (params) => api.get('/books', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id, force = false) => api.delete(`/books/${id}?force=${force}`),
  getStats: () => api.get('/books/stats'),
  returnBookByBookId: (bookId, rollNumber) => api.post(`/books/${bookId}/return`, { rollNumber }),

  // Circulation / Loans
  getIssues: (params) => api.get('/issues', { params }),
  issueBook: (data) => api.post('/issues', data),
  returnIssue: (id, remarks) => api.put(`/issues/${id}/return`, { remarks }),

  // Utilities & Demo
  seedDatabase: () => api.post('/seed'),
  checkHealth: () => api.get('/health'),
};

export default api;
