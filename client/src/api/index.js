import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for global response handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

// Movie Endpoints
export const movieAPI = {
  getMovies: (params) => api.get('/movies', { params }),
  getFeaturedMovies: () => api.get('/movies/featured'),
  getMovieById: (id) => api.get(`/movies/${id}`),
  createMovie: (movieData) => api.post('/movies', movieData),
  updateMovie: (id, movieData) => api.put(`/movies/${id}`, movieData),
  deleteMovie: (id) => api.delete(`/movies/${id}`),
};

// Theatre Endpoints
export const theatreAPI = {
  getTheatres: (params) => api.get('/theatres', { params }),
  getTheatreById: (id) => api.get(`/theatres/${id}`),
  createTheatre: (theatreData) => api.post('/theatres', theatreData),
  updateTheatre: (id, theatreData) => api.put(`/theatres/${id}`, theatreData),
  deleteTheatre: (id) => api.delete(`/theatres/${id}`),
};

// Show Endpoints
export const showAPI = {
  getShows: (params) => api.get('/shows', { params }),
  getShowById: (id) => api.get(`/shows/${id}`),
  createShow: (showData) => api.post('/shows', showData),
  deleteShow: (id) => api.delete(`/shows/${id}`),
};

// Booking Endpoints
export const bookingAPI = {
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getBookingById: (id) => api.get(`/bookings/${id}`),
  cancelBooking: (id, data) => api.put(`/bookings/${id}/cancel`, data),
  getAllBookings: (params) => api.get('/bookings/admin/all', { params }),
};

// Payment Endpoints
export const paymentAPI = {
  getReceipt: (transactionId) => api.get(`/payments/${transactionId}`),
};

// Notification Endpoints
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (data) => api.put('/notifications/mark-read', data),
};

// Admin Endpoints
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
};

export default api;
