import React, { useEffect, useRef, useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import client from '../api/client';
import { getSocket } from '../store/socket';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import TypingDots from '../components/TypingDots';
import { useAuthStore } from '../store/auth';

export default function ChatScreen({ route }) {
  const { conversationId, peer } = route.params;
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]); // ascending
  const [typingFromPeer, setTypingFromPeer] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    client.get(`/conversations/${conversationId}/messages?limit=50`).then(r => {
      setMessages(r.data.items || []);
      setTimeout(scrollToEnd, 0);
    });
  }, [conversationId]);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onNew = (msg) => {
      if (msg.conversation !== conversationId) return;
      setMessages((prev) => [...prev, msg]);
      scrollToEnd();
    };
    const onUpdate = (msg) => {
      if (msg.conversation !== conversationId) return;
      setMessages((prev) => prev.map(m => m._id === msg._id ? { ...m, status: msg.status } : m));
    };
    const onTypingStart = ({ from }) => { if (from === peer.id) setTypingFromPeer(true); };
    const onTypingStop = ({ from }) => { if (from === peer.id) setTypingFromPeer(false); };

    s.on('message:new', onNew);
    s.on('message:update', onUpdate);
    s.on('typing:start', onTypingStart);
    s.on('typing:stop', onTypingStop);

    return () => {
      s.off('message:new', onNew);
      s.off('message:update', onUpdate);
      s.off('typing:start', onTypingStart);
      s.off('typing:stop', onTypingStop);
    };
  }, [conversationId, peer?.id]);

  const scrollToEnd = () => {
    listRef.current?.scrollToEnd({ animated: true });
  };

  const send = (text) => {
    const s = getSocket();
    const clientId = `c_${Date.now()}`;
    // optimistic render
    const temp = {
      _id: clientId,
      conversation: conversationId,
      from: user.id,
      to: peer.id,
      body: text,
      status: 'sent',
      createdAt: new Date().toISOString(),
      clientId
    };
    setMessages((prev) => [...prev, temp]);
    scrollToEnd();

    s.emit('message:send', { to: peer.id, body: text, clientId }, (ack) => {
      if (!ack?.ok) return; // leave optimistic
      // server will also send message:new and message:update
    });
  };

  const typingStart = () => {
    const s = getSocket();
    s.emit('typing:start', { to: peer.id });
  };
  const typingStop = () => {
    const s = getSocket();
    s.emit('typing:stop', { to: peer.id });
  };

  // Mark all peer messages as read
  useEffect(() => {
    const mine = user.id;
    const unreadIds = messages.filter(m => m.to === mine && m.status !== 'read').map(m => m._id);
    if (unreadIds.length) {
      const s = getSocket();
      s.emit('message:read', { conversationId, messageIds: unreadIds });
    }
  }, [messages]);

  const renderItem = ({ item }) => (
    <MessageBubble mine={item.from === user.id} body={item.body} status={item.status} />
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1 }}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
          onContentSizeChange={scrollToEnd}
        />
        {typingFromPeer ? <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}><TypingDots/></View> : null}
        <MessageInput onSend={send} onTypingStart={typingStart} onTypingStop={typingStop} />
      </View>
    </KeyboardAvoidingView>
  );
}
