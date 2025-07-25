// Generated by GitHub Copilot
/**
 * Configuration utilities for the application
 */

/**
 * Get the base URL for the backend API
 * This can be extended to use environment variables in the future
 */
export const getBackendUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";
};

/**
 * Get the full URL for the Google OAuth login endpoint
 */
export const getGoogleAuthUrl = (): string => {
  return `${getBackendUrl()}/api/auth/google`;
};
