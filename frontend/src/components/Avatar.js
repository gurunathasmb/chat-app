import React from 'react';
import { View, Text } from 'react-native';

export default function Avatar({ name = '', size = 40, online = false }) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <View style={{
      width: size, height: size, borderRadius: size/2,
      backgroundColor: '#cfd8dc', alignItems: 'center', justifyContent: 'center'
    }}>
      <Text style={{ fontWeight: '700' }}>{initials}</Text>
      {online && (
        <View style={{
          width: size/4, height: size/4, borderRadius: size/8,
          backgroundColor: '#4caf50', position: 'absolute', bottom: 0, right: 0, borderWidth: 2, borderColor: '#fff'
        }}/>
      )}
    </View>
  );
}
