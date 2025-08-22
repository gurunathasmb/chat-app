import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

export default function MessageInput({ onSend, onTypingStart, onTypingStop }) {
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);

  const handleChange = (t) => {
    setText(t);
    if (!typing) {
      setTyping(true);
      onTypingStart && onTypingStart();
    }
    // debounce stop typing
    clearTimeout(MessageInput._t);
    MessageInput._t = setTimeout(() => {
      setTyping(false);
      onTypingStop && onTypingStop();
    }, 800);
  };

  const send = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
    onTypingStop && onTypingStop();
    setTyping(false);
  };

  return (
    <View style={{ flexDirection: 'row', padding: 8, alignItems: 'center', borderTopWidth: 1, borderColor: '#eceff1' }}>
      <TextInput
        value={text}
        onChangeText={handleChange}
        placeholder="Type a message"
        style={{ flex: 1, padding: 10, backgroundColor: '#fafafa', borderRadius: 8 }}
      />
      <TouchableOpacity onPress={send} style={{ marginLeft: 8, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#1976d2', borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Send</Text>
      </TouchableOpacity>
    </View>
  );
}
