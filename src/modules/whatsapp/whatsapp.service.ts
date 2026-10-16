import { db } from '../../db/index.js';
import { WhatsAppService as WhatsAppUtil } from '../../utils/whatsapp.js';

export class WhatsAppModuleService {
  static async sendOrderConfirmation(customerId: string) {
    const customer = await db.customers.findById(customerId);
    if (!customer) {
      throw { status: 404, message: `Customer with ID ${customerId} not found.` };
    }

    const workshop = await db.settings.getProfile();
    return WhatsAppUtil.sendOrderConfirmation(customer, workshop);
  }

  static async sendStatusUpdate(customerId: string, status: string, customNote?: string) {
    const customer = await db.customers.findById(customerId);
    if (!customer) {
      throw { status: 404, message: `Customer with ID ${customerId} not found.` };
    }

    const workshop = await db.settings.getProfile();
    return WhatsAppUtil.sendStatusUpdate(customer, status, customNote, workshop);
  }
}
