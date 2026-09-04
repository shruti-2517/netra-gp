/**
 * NETRA-GP: Centralized Environment & API Configuration
 * Supports environment overrides via VITE_API_BASE_URL and VITE_WS_BASE_URL
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || API_BASE_URL.replace(/^http/, 'ws');
