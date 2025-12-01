import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updatePassword: (passwords) => api.put('/auth/updatepassword', passwords),
};

export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  enroll: (id, data) => api.post(`/students/${id}/enroll`, data),
};

export const teacherAPI = {
  getAll: (params) => api.get('/teachers', { params }),
  getOne: (id) => api.get(`/teachers/${id}`),
  create: (data) => api.post('/teachers', data),
  update: (id, data) => api.put(`/teachers/${id}`, data),
  delete: (id) => api.delete(`/teachers/${id}`),
};

export const classAPI = {
  getAll: (params) => api.get('/classes', { params }),
  getOne: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
};

export const feeAPI = {
  getAll: (params) => api.get('/fees', { params }),
  getOne: (id) => api.get(`/fees/${id}`),
  create: (data) => api.post('/fees', data),
  update: (id, data) => api.put(`/fees/${id}`, data),
  delete: (id) => api.delete(`/fees/${id}`),
  addPayment: (id, data) => api.post(`/fees/${id}/payment`, data),
  getSummary: (academicYearId) => api.get(`/fees/summary/${academicYearId}`),
};

export const feeConfigurationAPI = {
  getAll: (params) => api.get('/fee-configurations', { params }),
  getOne: (id) => api.get(`/fee-configurations/${id}`),
  create: (data) => api.post('/fee-configurations', data),
  update: (id, data) => api.put(`/fee-configurations/${id}`, data),
  delete: (id) => api.delete(`/fee-configurations/${id}`),
  generateFees: (id) => api.post(`/fee-configurations/${id}/generate-fees`),
};

export const feeInstallmentAPI = {
  getAll: (params) => api.get('/fee-installments', { params }),
  getOne: (id) => api.get(`/fee-installments/${id}`),
  getStudentSummary: (studentId, params) => api.get(`/fee-installments/student/${studentId}/summary`, { params }),
  processPayment: (id, data) => api.post(`/fee-installments/${id}/payment`, data),
  skip: (id, data) => api.post(`/fee-installments/${id}/skip`, data),
  unskip: (id) => api.post(`/fee-installments/${id}/unskip`),
  applyDiscount: (id, data) => api.post(`/fee-installments/${id}/discount`, data),
  update: (id, data) => api.put(`/fee-installments/${id}`, data),
  delete: (id) => api.delete(`/fee-installments/${id}`),
  generateForStudent: (data) => api.post('/fee-installments/generate-for-student', data),
  fixExisting: () => api.post('/fee-installments/fix-existing'),
};

export const reportCardAPI = {
  getAll: (params) => api.get('/reportcards', { params }),
  getOne: (id) => api.get(`/reportcards/${id}`),
  create: (data) => api.post('/reportcards', data),
  update: (id, data) => api.put(`/reportcards/${id}`, data),
  delete: (id) => api.delete(`/reportcards/${id}`),
  publish: (id) => api.put(`/reportcards/${id}/publish`),
  getClassPerformance: (classId, params) => api.get(`/reportcards/class/${classId}/performance`, { params }),
};

export const academicYearAPI = {
  getAll: () => api.get('/academicyears'),
  getActive: () => api.get('/academicyears/active'),
  getOne: (id) => api.get(`/academicyears/${id}`),
  create: (data) => api.post('/academicyears', data),
  update: (id, data) => api.put(`/academicyears/${id}`, data),
  delete: (id) => api.delete(`/academicyears/${id}`),
  promote: (id, data) => api.post(`/academicyears/${id}/promote`, data),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id, data) => api.put(`/users/${id}/reset-password`, data),
  toggleStatus: (id) => api.put(`/users/${id}/toggle-status`),
};

export const attendanceAPI = {
  markDaily: (data) => api.post('/attendance/mark-daily', data),
  getByDate: (classId, date) => api.get(`/attendance/daily/${classId}/${date}`),
  getStudentMonthly: (studentId, params) => api.get(`/attendance/student/${studentId}/monthly`, { params }),
  getClassMonthly: (classId, params) => api.get(`/attendance/class/${classId}/monthly`, { params }),
  getStudentStats: (studentId, params) => api.get(`/attendance/student/${studentId}/stats`, { params }),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
};
