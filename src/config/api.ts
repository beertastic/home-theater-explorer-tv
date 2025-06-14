
// API Configuration
const getApiBaseUrl = (): string => {
  // Check if we're running in development mode
  if (import.meta.env.DEV) {
    return 'http://192.168.1.94:3001/api';
  }
  
  // In production, try to detect the current host
  const currentHost = window.location.hostname;
  
  // If accessing via domain, use the domain
  if (currentHost === 'test1.trisflix.com') {
    return 'http://test1.trisflix.com/api';
  }
  
  // If accessing via IP, use the IP
  if (currentHost === '192.168.1.94') {
    return 'http://192.168.1.94:3001/api';
  }
  
  // Fallback to IP address
  return 'http://192.168.1.94:3001/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Export for debugging
export const getCurrentApiUrl = () => {
  console.log('Current API URL:', API_BASE_URL);
  console.log('Current hostname:', window.location.hostname);
  return API_BASE_URL;
};
