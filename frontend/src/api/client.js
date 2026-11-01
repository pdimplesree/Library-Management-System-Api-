// API Client for Aditya Smart Library System
const BASE_URL = '/api';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('aditya_library_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Server returned non-JSON response' }));

  if (!response.ok) {
    throw new Error(data.message || `API error (${response.status})`);
  }

  return data;
}

export const api = {
  // Auth
  login: (identifier, password, role) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, role }),
    }),

  getCurrentUser: () => apiRequest('/auth/me'),

  logout: () => {
    localStorage.removeItem('aditya_library_token');
    localStorage.removeItem('aditya_library_user');
    return apiRequest('/auth/logout', { method: 'POST' }).catch(() => {});
  },

  // Library & Occupancy
  getOccupancy: () => apiRequest('/library/occupancy'),
  getSeats: () => apiRequest('/library/seats'),
  scanQR: (studentId, scanMethod = 'QR_SCAN') =>
    apiRequest('/library/scan', {
      method: 'POST',
      body: JSON.stringify({ studentId, scanMethod }),
    }),
  getVisits: () => apiRequest('/library/visits'),

  // Seat Reservations
  reserveSeat: (seatId) =>
    apiRequest('/reservations', {
      method: 'POST',
      body: JSON.stringify({ seatId }),
    }),
  getMyReservation: () => apiRequest('/reservations/me'),
  checkInReservation: (reservationId) =>
    apiRequest(`/reservations/${reservationId}/checkin`, { method: 'POST' }),
  cancelReservation: (reservationId) =>
    apiRequest(`/reservations/${reservationId}`, { method: 'DELETE' }),

  // Books
  getBooks: (category) =>
    apiRequest(`/books${category && category !== 'ALL' ? `?category=${encodeURIComponent(category)}` : ''}`),
  searchBooks: (query) =>
    apiRequest(`/books/search?q=${encodeURIComponent(query)}`),
  getCategories: () => apiRequest('/books/categories'),

  // Loans
  getMyLoans: () => apiRequest('/loans/me'),
  getOverdueLoans: () => apiRequest('/loans/overdue'),
  returnBook: (loanId) => apiRequest(`/loans/${loanId}/return`, { method: 'POST' }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id) =>
    apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () =>
    apiRequest('/notifications/mark-all-read', { method: 'POST' }),

  // Admin
  getAdminDashboard: () => apiRequest('/admin/dashboard'),
  addBook: (bookData) =>
    apiRequest('/admin/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),
  updateBook: (id, bookData) =>
    apiRequest(`/admin/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    }),
  issueAdminLoan: (loanData) =>
    apiRequest('/admin/loans', {
      method: 'POST',
      body: JSON.stringify(loanData),
    }),
  getAdminStudents: () => apiRequest('/admin/students'),
  registerStudent: (studentData) =>
    apiRequest('/admin/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),
  triggerReminders: () => apiRequest('/admin/trigger-reminders', { method: 'POST' }),
  getAdminLibrarians: () => apiRequest('/admin/librarians'),
  registerLibrarian: (librarianData) =>
    apiRequest('/admin/librarians', {
      method: 'POST',
      body: JSON.stringify(librarianData),
    }),

  // Librarian operations
  getLibrarianDashboard: () => apiRequest('/librarian/dashboard'),
  getLibrarianStudents: () => apiRequest('/librarian/students'),
  getLibrarianReservations: () => apiRequest('/librarian/reservations'),
  cancelStudentReservation: (reservationId) =>
    apiRequest(`/librarian/reservations/${reservationId}`, { method: 'DELETE' }),
  assignStudentSeat: (studentId, seatId) =>
    apiRequest('/librarian/reservations', {
      method: 'POST',
      body: JSON.stringify({ studentId, seatId }),
    }),
  verifyStudentEntry: (studentId, scanMethod = 'MANUAL_VERIFICATION') =>
    apiRequest('/librarian/scan', {
      method: 'POST',
      body: JSON.stringify({ studentId, scanMethod }),
    }),
};
