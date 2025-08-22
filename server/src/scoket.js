import { Server } from 'socket.io';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import User from './models/User.js';
import { getOrCreate } from './routes/conversations.js';
import { verifyJWT } from './utils/jwt.js';

const onlineUsers = new Map(); // userId -> socketId

export function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: (process.env.CORS_ORIGIN || '').split(',').filter(Boolean),
      credentials: true
    }
  });

  // auth for sockets
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));
      const user = verifyJWT(token, process.env.JWT_SECRET);
      socket.user = user; // { id, username }
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const { id: userId } = socket.user;
    onlineUsers.set(String(userId), socket.id);
    await User.findByIdAndUpdate(userId, { online: true, lastSeen: new Date() });

    io.emit('presence:update', { userId, online: true, lastSeen: new Date() });

    // message:send { to, body, clientId }
    socket.on('message:send', async (payload, cb) => {
      try {
        const { to, body, clientId } = payload;
        const convo = await getOrCreate(userId, to);
        const msg = await Message.create({
          conversation: convo._id,
          from: userId,
          to,
          body,
          status: 'sent',
          clientId: clientId || null
        });

        await Conversation.findByIdAndUpdate(convo._id, { lastMessage: msg._id });

        const data = { ...msg.toObject() };

        // emit to recipient
        const toSocket = onlineUsers.get(String(to));
        if (toSocket) {
          io.to(toSocket).emit('message:new', data);

          // mark delivered
          await Message.findByIdAndUpdate(msg._id, { status: 'delivered' });
          const delivered = { ...data, status: 'delivered' };
          io.to(toSocket).emit('message:update', delivered);
          io.to(socket.id).emit('message:update', delivered);
        } else {
          // sender mirror at least shows sent
          io.to(socket.id).emit('message:new', data);
        }

        cb && cb({ ok: true, message: data });
      } catch (e) {
        cb && cb({ ok: false, error: 'send_failed' });
      }
    });

    // typing indicators
    socket.on('typing:start', ({ to }) => {
      const toSocket = onlineUsers.get(String(to));
      if (toSocket) io.to(toSocket).emit('typing:start', { from: userId });
    });
    socket.on('typing:stop', ({ to }) => {
      const toSocket = onlineUsers.get(String(to));
      if (toSocket) io.to(toSocket).emit('typing:stop', { from: userId });
    });

    // read receipts
    socket.on('message:read', async ({ conversationId, messageIds }) => {
      await Message.updateMany({ _id: { $in: messageIds } }, { $set: { status: 'read' } });
      const msgs = await Message.find({ _id: { $in: messageIds } });
      for (const m of msgs) {
        const fromSocket = onlineUsers.get(String(m.from));
        const toSocket = onlineUsers.get(String(m.to));
        const payload = { ...m.toObject(), status: 'read' };
        if (fromSocket) io.to(fromSocket).emit('message:update', payload);
        if (toSocket) io.to(toSocket).emit('message:update', payload);
      }
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(String(userId));
      await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
      io.emit('presence:update', { userId, online: false, lastSeen: new Date() });
    });
  });

  return io;
}
