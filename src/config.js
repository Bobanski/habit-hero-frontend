/**
 * API base URL configuration
 * - Uses VITE_API_BASE_URL from .env (set automatically by Vite depending on mode)
 * - Falls back to localhost for dev safety
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default API_BASE_URL;
