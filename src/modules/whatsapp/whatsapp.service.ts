import { db } from '../../db/index.js';
import { WhatsAppService as WhatsAppUtil } from '../../utils/whatsapp.js';

import { config } from '../../config/env.js';

export class WhatsAppModuleService {
  static getStatus() {
    const isConfigured = Boolean(config.whatsapp.accessToken && config.whatsapp.phoneNumberId);
    return {
      configured: isConfigured,
      mode: isConfigured ? 'live' : 'simulation',
      apiUrl: config.whatsapp.apiUrl,
      phoneNumberId: config.whatsapp.phoneNumberId ? `${config.whatsapp.phoneNumberId.slice(0, 4)}***` : null,
    };
  }
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
