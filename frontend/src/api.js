import axios from 'axios';

// Base URL for API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * API client for communicating with the backend
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds for ML processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Ensure headers object exists
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // If sending FormData, delete Content-Type to let browser set it with boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  
  return config;
});

/**
 * Match products based on uploaded image or image URL
 * @param {Object} imageData - Object with type ('file' or 'url') and data
 * @param {Object} options - Optional parameters (limit, minScore)
 * @returns {Promise} - Response with matches
 */
export const matchProducts = async (imageData, options = {}) => {
  try {
    const { type, data } = imageData;
    const { limit = 10, minScore = 0 } = options;

    let response;

    if (type === 'file') {
      // File upload - use FormData
      const formData = new FormData();
      formData.append('image', data);

      response = await api.post('/match', formData, {
        // Don't manually set Content-Type - let browser set it with boundary
        // Don't set headers here - let interceptor add Authorization
        params: {
          limit,
          minScore,
        },
      });
    } else if (type === 'url') {
      // Image URL - send as JSON
      response = await api.post('/match', {
        imageUrl: data,
      }, {
        params: {
          limit,
          minScore,
        },
      });
    } else {
      throw new Error('Invalid image data type');
    }

    return response.data;
  } catch (error) {
    console.error('Error matching products:', error);
    throw error.response?.data || error;
  }
};

export default api;
