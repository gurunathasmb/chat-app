import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';
import { useState, useEffect } from 'react';

// Tiny custom store (no external state lib)
let _listeners = [];
let _state = { user: null, token: null };

function setState(next) {
  _state = { ..._state, ...next };
  _listeners.forEach((l) => l(_state));
}

export function useAuthStore() {
  const [state, setLocal] = useState(_state);
  useEffect(() => {
    const l = (s) => setLocal(s);
    _listeners.push(l);
    return () => { _listeners = _listeners.filter((x) => x !== l); };
  }, []);
  return {
    ...state,
    async login(username, password) {
      const res = await client.post('/auth/login', { username, password });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      setState({ token: res.data.token, user: res.data.user });
    },
    async register(username, password) {
      const res = await client.post('/auth/register', { username, password });
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      setState({ token: res.data.token, user: res.data.user });
    },
    async restore() {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user')
      ]);
      setState({ token, user: userStr ? JSON.parse(userStr) : null });
    },
    async logout() {
      await AsyncStorage.multiRemove(['token', 'user']);
      setState({ token: null, user: null });
    }
  };
}
