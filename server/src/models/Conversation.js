import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null }
  },
  { timestamps: true }
);

ConversationSchema.index({ members: 1 }, { unique: false });

export default mongoose.model('Conversation', ConversationSchema);
