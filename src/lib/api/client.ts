/**
 * API Client
 * Centralized axios instance with interceptors
 * DRY: Single source for all API calls
 */

import axios from 'axios';

const API_BASE_URL = 'http://api.servisca.co.uk';

// Create axios instance with timeout
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

export default apiClient;

