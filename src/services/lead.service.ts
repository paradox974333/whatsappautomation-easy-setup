import { Lead, ILead } from '../models/lead.model';
import { logger } from '../utils/logger';

export class LeadService {
  public async getLeads(): Promise<ILead[]> {
    return Lead.find().sort({ extractedAt: -1 });
  }

  public async getLeadById(id: string): Promise<ILead | null> {
    return Lead.findById(id);
  }

  public async getLeadByPhone(phone: string): Promise<ILead | null> {
    return Lead.findOne({ phone });
  }

  public async createOrUpdateLead(phone: string, leadData: Partial<ILead>): Promise<ILead> {
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const existingLead = await Lead.findOne({ phone: cleanPhone });

      if (existingLead) {
        logger.info(`Lead already exists for phone: ${cleanPhone}. Updating fields.`);
        
        // Merge fields if they are provided and non-empty
        if (leadData.name) existingLead.name = leadData.name;
        if (leadData.business) existingLead.business = leadData.business;
        if (leadData.email) existingLead.email = leadData.email;
        
        if (leadData.requirements) {
          // Append new requirements to existing ones if they are different
          if (existingLead.requirements) {
            if (!existingLead.requirements.includes(leadData.requirements)) {
              existingLead.requirements = `${existingLead.requirements} | New requirements: ${leadData.requirements}`;
            }
          } else {
            existingLead.requirements = leadData.requirements;
          }
        }
        
        existingLead.extractedAt = new Date();
        if (leadData.sourceConversation) {
          existingLead.sourceConversation = leadData.sourceConversation;
        }

        return await existingLead.save();
      }

      logger.info(`Creating new lead for phone: ${cleanPhone}`);
      const newLead = new Lead({
        ...leadData,
        phone: cleanPhone,
        status: 'new',
        extractedAt: new Date()
      });

      return await newLead.save();
    } catch (error) {
      logger.error(`Error in createOrUpdateLead for phone ${phone}:`, error);
      throw error;
    }
  }

  public async updateLeadStatus(id: string, status: ILead['status']): Promise<ILead | null> {
    return Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
  }

  public async deleteLead(id: string): Promise<boolean> {
    const result = await Lead.findByIdAndDelete(id);
    return result !== null;
  }
}
