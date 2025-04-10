/**
 * API base URL configuration for deployment
 * Uses environment variable in production, empty string in development
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export default API_BASE_URL;