import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const router = express.Router();

// helper: get or create 1:1 conversation between me and otherId
async function getOrCreate(me, otherId) {
  let convo = await Conversation.findOne({ members: { $all: [me, otherId], $size: 2 } });
  if (!convo) convo = await Conversation.create({ members: [me, otherId] });
  return convo;
}

// POST /conversations/with/:otherId -> returns conversation (creates if missing)
router.post('/with/:otherId', authMiddleware, async (req, res) => {
  const me = req.user.id;
  const { otherId } = req.params;
  const convo = await getOrCreate(me, otherId);
  res.json({ id: convo._id, members: convo.members });
});

// GET /conversations/:id/messages (paginated)
router.get('/:id/messages', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '50', 10);
  const skip = (page - 1) * limit;
  const msgs = await Message.find({ conversation: id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  res.json({ items: msgs.reverse(), page, limit });
});

export default router;
export { getOrCreate };
