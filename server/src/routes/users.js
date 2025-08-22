import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /users - all except me
router.get('/', authMiddleware, async (req, res) => {
  const me = req.user.id;
  const users = await User.find({ _id: { $ne: me } }).select('_id username online lastSeen');
  res.json(users);
});

export default router;
