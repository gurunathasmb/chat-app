// Read from .env at runtime via Metro inline replace (simple approach)
// Replace these strings manually or ensure you copy .env example and edit.
export const API_URL = process.env.API_URL || 'http://192.168.1.10:4000';
export const SOCKET_URL = process.env.SOCKET_URL || 'http://192.168.1.10:4000';
