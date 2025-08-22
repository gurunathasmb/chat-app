import React from 'react';
import { View, Text } from 'react-native';

export default function MessageBubble({ mine, body, status }) {
  const bg = mine ? '#bbdefb' : '#eceff1';
  const align = mine ? 'flex-end' : 'flex-start';
  return (
    <View style={{ marginVertical: 4, flexDirection: 'row', justifyContent: align }}>
      <View style={{ maxWidth: '80%', backgroundColor: bg, padding: 10, borderRadius: 12 }}>
        <Text style={{ fontSize: 16 }}>{body}</Text>
        {mine && (
          <Text style={{ fontSize: 10, color: '#607d8b', textAlign: 'right', marginTop: 4 }}>
            {status === 'read' ? '✓✓' : status === 'delivered' ? '✓✓ (grey)' : '✓'}
          </Text>
        )}
      </View>
    </View>
  );
}
