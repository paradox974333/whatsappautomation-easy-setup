import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  chatId: string;
  messageId: string;
  role: 'user' | 'assistant';
  body: string;
  type: string;
  mediaPath?: string;
  mimeType?: string;
  fileName?: string;
  latitude?: string;
  longitude?: string;
  locationTitle?: string;
  vcardData?: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  chatId: string;
  contactName?: string;
  lastMessageAt: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage & Document>({
  chatId: { type: String, required: true, index: true },
  messageId: { type: String, required: true, unique: true, index: true },
  role: { type: String, required: true, enum: ['user', 'assistant'] },
  body: { type: String, required: true },
  type: { type: String, required: true, default: 'chat' },
  mediaPath: { type: String },
  mimeType: { type: String },
  fileName: { type: String },
  latitude: { type: String },
  longitude: { type: String },
  locationTitle: { type: String },
  vcardData: { type: String },
  timestamp: { type: Date, required: true, default: Date.now },
}, {
  timestamps: true
});

const ConversationSchema = new Schema<IConversation>({
  chatId: { type: String, required: true, unique: true, index: true },
  contactName: { type: String },
  lastMessageAt: { type: Date, required: true, default: Date.now },
  metadata: { type: Schema.Types.Mixed },
}, {
  timestamps: true
});

// Compound index to search for messages belonging to a chat sorted by timestamp
MessageSchema.index({ chatId: 1, timestamp: -1 });

export const Message = mongoose.model<IMessage & Document>('Message', MessageSchema);
export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
