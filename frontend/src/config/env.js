const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (
  configuredApiBaseUrl ||
  (import.meta.env.DEV ? 'http://localhost:4001' : window.location.origin)
).replace(/\/+$/, '');

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL?.trim().replace(/\/+$/, '') || API_BASE_URL;

export const toApiUrl = (path) => `${API_BASE_URL}${path}`;

export const toAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE_URL}${path}`;
};
