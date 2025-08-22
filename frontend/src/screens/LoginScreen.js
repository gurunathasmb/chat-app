import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/auth';

export default function LoginScreen({ navigation }) {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const { login } = useAuthStore();

  const onLogin = async () => {
    try {
      await login(username.trim(), password);
      navigation.replace('Home');
    } catch (e) { alert('Login failed'); }
  };

  return (
    <View style={{ flex:1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 20 }}>Welcome back</Text>
      <TextInput placeholder="Username" autoCapitalize="none" style={{ borderWidth: 1, borderColor: '#cfd8dc', borderRadius: 8, padding: 12, marginBottom: 12 }} onChangeText={setU} />
      <TextInput placeholder="Password" secureTextEntry style={{ borderWidth: 1, borderColor: '#cfd8dc', borderRadius: 8, padding: 12, marginBottom: 20 }} onChangeText={setP} />
      <Button title="Login" onPress={onLogin} />
      <TouchableOpacity onPress={() => navigation.replace('Register')} style={{ marginTop: 14 }}>
        <Text>New here? Create account</Text>
      </TouchableOpacity>
    </View>
  );
}
