import React, { useState } from 'react';
import { View, TextInput, Button, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/auth';

export default function RegisterScreen({ navigation }) {
  const [username, setU] = useState('');
  const [password, setP] = useState('');
  const { register } = useAuthStore();

  const onRegister = async () => {
    try {
      await register(username.trim(), password);
      navigation.replace('Home');
    } catch (e) { alert('Registration failed'); }
  };

  return (
    <View style={{ flex:1, padding: 24, justifyContent: 'center' }}>
      <Text style={{ fontSize: 28, fontWeight: '800', marginBottom: 20 }}>Create account</Text>
      <TextInput placeholder="Username" autoCapitalize="none" style={{ borderWidth: 1, borderColor: '#cfd8dc', borderRadius: 8, padding: 12, marginBottom: 12 }} onChangeText={setU} />
      <TextInput placeholder="Password" secureTextEntry style={{ borderWidth: 1, borderColor: '#cfd8dc', borderRadius: 8, padding: 12, marginBottom: 20 }} onChangeText={setP} />
      <Button title="Register" onPress={onRegister} />
      <TouchableOpacity onPress={() => navigation.replace('Login')} style={{ marginTop: 14 }}>
        <Text>Have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
