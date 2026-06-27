import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name?: string;
  business?: string;
  phone: string;
  email?: string;
  requirements?: string;
  status: 'new' | 'contacted' | 'lost' | 'qualified';
  followUpStatus: 'pending' | 'sent' | 'skipped';
  sourceConversation: string; // references conversation chatId
  extractedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>({
  name: { type: String, trim: true },
  business: { type: String, trim: true },
  phone: { type: String, required: true, index: true },
  email: { type: String, trim: true, lowercase: true },
  requirements: { type: String },
  status: { 
    type: String, 
    required: true, 
    enum: ['new', 'contacted', 'lost', 'qualified'], 
    default: 'new' 
  },
  followUpStatus: {
    type: String,
    enum: ['pending', 'sent', 'skipped'],
    default: 'pending'
  },
  sourceConversation: { type: String, required: true, index: true },
  extractedAt: { type: Date, required: true, default: Date.now }
}, {
  timestamps: true
});

// Avoid duplicate lead entries for the same chat or phone number by updating it if it already exists, or indexing it
LeadSchema.index({ phone: 1 });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
export default Lead;
