import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const propertyService = {
  // Get filtered properties
  getProperties: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] && filters[key] !== 'any' && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const response = await api.get(`/properties?${params.toString()}`);
    return response.data;
  },

  // Get single property
  getProperty: async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
  },
};

export const preferenceService = {
  // Get user preferences
  getPreferences: async (userId) => {
    const response = await api.get(`/preferences/${userId}`);
    return response.data;
  },

  // Save preferences
  savePreferences: async (userId, data) => {
    const response = await api.post(`/preferences`, { userId, ...data });
    return response.data;
  },

  // Save property to favorites
  saveProperty: async (userId, propertyId) => {
    const response = await api.post(`/preferences/${userId}/save`, { propertyId });
    return response.data;
  },

  // Remove property from favorites
  removeProperty: async (userId, propertyId) => {
    const response = await api.delete(`/preferences/${userId}/save/${propertyId}`);
    return response.data;
  },
};

// ... existing code ...

export const nlpService = {
  // Extract filters from natural language
  extractFilters: async (message, conversationHistory = []) => {
    const response = await api.post('/nlp/extract', { message, conversationHistory });
    return response.data;
  },

  // Generate chatbot response
  generateResponse: async (message, context = {}) => {
    const response = await api.post('/nlp/chat', { message, context });
    return response.data;
  },
};