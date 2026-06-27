import { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service';

export class LeadController {
  private leadService = new LeadService();

  public getLeads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const leads = await this.leadService.getLeads();
      res.json({
        success: true,
        data: leads,
      });
    } catch (error) {
      next(error);
    }
  };

  public getLeadById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const lead = await this.leadService.getLeadById(id);
      
      if (!lead) {
        res.status(404).json({
          success: false,
          message: `Lead with ID ${id} not found`,
        });
        return;
      }

      res.json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateLeadStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['new', 'contacted', 'lost', 'qualified'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status. Status must be one of: new, contacted, lost, qualified',
        });
        return;
      }

      const updatedLead = await this.leadService.updateLeadStatus(id, status);
      
      if (!updatedLead) {
        res.status(404).json({
          success: false,
          message: `Lead with ID ${id} not found`,
        });
        return;
      }

      res.json({
        success: true,
        data: updatedLead,
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const success = await this.leadService.deleteLead(id);

      if (!success) {
        res.status(404).json({
          success: false,
          message: `Lead with ID ${id} not found`,
        });
        return;
      }

      res.json({
        success: true,
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
