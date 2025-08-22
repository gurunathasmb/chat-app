import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import convoRoutes from './src/routes/conversations.js';
import { createSocketServer } from './socket.js';

const app = express();
app.use(express.json());
app.use(cors({ origin: (process.env.CORS_ORIGIN || '').split(',').filter(Boolean), credentials: true }));

app.get('/', (_, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/conversations', convoRoutes);

const server = http.createServer(app);
createSocketServer(server);

const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGO_URI).then(() => {
  server.listen(PORT, () => console.log(`API running on :${PORT}`));
});
