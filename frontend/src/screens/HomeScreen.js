import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import client from '../api/client';
import Avatar from '../components/Avatar';
import { useAuthStore } from '../store/auth';
import { connectSocket, getSocket, disconnectSocket } from '../store/socket';
import { timeAgo } from '../utils/time';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [presence, setPresence] = useState({}); // userId -> {online,lastSeen}
  const [lasts, setLasts] = useState({}); // userId -> lastMessage text/time

  useEffect(() => {
    client.get('/users').then(r => setUsers(r.data));
  }, []);

  useEffect(() => {
    let s;
    (async () => {
      s = await connectSocket();
      s.on('presence:update', ({ userId, online, lastSeen }) => {
        setPresence(p => ({ ...p, [userId]: { online, lastSeen } }));
      });
      s.on('message:new', (msg) => {
        const peer = msg.from === user.id ? msg.to : msg.from;
        setLasts((m) => ({ ...m, [peer]: { body: msg.body, createdAt: msg.createdAt } }));
      });
    })();
    return () => { if (s) s.removeAllListeners(); disconnectSocket(); };
  }, []);

  const openChat = async (other) => {
    // ensure conversation exists
    const { data } = await client.post(`/conversations/with/${other._id}`);
    navigation.navigate('Chat', {
      conversationId: data.id,
      peer: { id: other._id, username: other.username },
      title: other.username
    });
  };

  const renderItem = ({ item }) => {
    const pr = presence[item._id] || { online: item.online, lastSeen: item.lastSeen };
    const last = lasts[item._id];
    return (
      <TouchableOpacity onPress={() => openChat(item)} style={{ flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderColor: '#eceff1', alignItems: 'center' }}>
        <Avatar name={item.username} online={pr?.online} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>{item.username}</Text>
          <Text style={{ color: '#607d8b' }}>
            {last ? last.body : pr?.online ? 'Online' : pr?.lastSeen ? `Last seen ${timeAgo(pr.lastSeen)}` : 'Offline'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex:1 }}>
      <View style={{ padding: 12, borderBottomWidth: 1, borderColor: '#eceff1', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '800' }}>Hello, {user.username}</Text>
        <Text onPress={logout} style={{ color: '#e53935' }}>Logout</Text>
      </View>
      <FlatList data={users} keyExtractor={(u) => u._id} renderItem={renderItem} />
    </View>
  );
}
