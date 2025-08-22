import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket = null;

export async function connectSocket() {
  const token = await AsyncStorage.getItem('token');
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token }
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
  socket = null;
}
