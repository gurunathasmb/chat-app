import React from 'react';
import { View } from 'react-native';

export default function PresenceDot({ online }) {
  return (
    <View style={{
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: online ? '#4caf50' : '#b0bec5'
    }}/>
  );
}
