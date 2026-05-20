export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001';

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL;

export const toApiUrl = (path) => `${API_BASE_URL}${path}`;

export const toAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
};
