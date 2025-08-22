import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent', index: true },
    clientId: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model('Message', MessageSchema);
