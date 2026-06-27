import { Lead, ILead } from '../models/lead.model';
import { logger } from '../utils/logger';
import { config } from '../config';

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
      
      // Suffix matching: check the last 10 digits of the phone number to prevent duplicates (e.g. country codes)
      let existingLead = null;
      if (cleanPhone.length >= 10) {
        const last10 = cleanPhone.substring(cleanPhone.length - 10);
        existingLead = await Lead.findOne({
          phone: { $regex: new RegExp(last10 + '$') }
        });
      } else {
        existingLead = await Lead.findOne({ phone: cleanPhone });
      }

      if (existingLead) {
        logger.info(`Lead already exists for phone suffix match: ${existingLead.phone}. Updating fields.`);
        // Update to the longer country-coded format if cleanPhone is longer
        if (cleanPhone.length > existingLead.phone.length) {
          existingLead.phone = cleanPhone;
        }
        
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

        const savedLead = await existingLead.save();
        this.dispatchCrmWebhook(savedLead);
        return savedLead;
      }

      logger.info(`Creating new lead for phone: ${cleanPhone}`);
      const newLead = new Lead({
        ...leadData,
        phone: cleanPhone,
        status: 'new',
        extractedAt: new Date()
      });

      const savedLead = await newLead.save();
      this.dispatchCrmWebhook(savedLead);
      return savedLead;
    } catch (error) {
      logger.error(`Error in createOrUpdateLead for phone ${phone}:`, error);
      throw error;
    }
  }

  public async updateLeadStatus(id: string, status: ILead['status']): Promise<ILead | null> {
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    if (updatedLead) {
      this.dispatchCrmWebhook(updatedLead);
    }
    return updatedLead;
  }

  public async deleteLead(id: string): Promise<boolean> {
    const result = await Lead.findByIdAndDelete(id);
    return result !== null;
  }

  private async dispatchCrmWebhook(lead: ILead): Promise<void> {
    const url = config.crmWebhookUrl;
    if (!url) return;

    try {
      logger.info(`Dispatching lead details to CRM webhook: ${url}`);
      const payload = {
        id: lead._id,
        name: lead.name,
        business: lead.business,
        phone: lead.phone,
        email: lead.email,
        requirements: lead.requirements,
        status: lead.status,
        sourceConversation: lead.sourceConversation,
        extractedAt: lead.extractedAt,
        updatedAt: lead.updatedAt
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        logger.warn(`CRM Webhook returned non-OK status: ${response.status} ${response.statusText}`);
      } else {
        logger.info('CRM Webhook dispatched successfully.');
      }
    } catch (err: any) {
      logger.error(`Failed to dispatch CRM webhook to ${url}:`, err);
    }
  }
}
