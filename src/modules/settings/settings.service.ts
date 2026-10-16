import { db } from '../../db/index.js';
import { WorkshopSettings } from '../../types/index.js';

export class SettingsService {
  private static formatSettings(s: WorkshopSettings) {
    return {
      businessName: s.business_name,
      tagline: s.tagline,
      businessPhone: s.business_phone,
      businessEmail: s.business_email,
      workshopAddress: s.workshop_address,
      gstin: s.gstin,
      businessHours: s.business_hours || [],
      dataRetentionDays: s.data_retention_days !== undefined ? Number(s.data_retention_days) : 45,
      autoCleanupEnabled: s.auto_cleanup_enabled ?? true,
      retentionTarget: s.retention_target || 'all',
    };
  }

  static async getProfile() {
    const s = await db.settings.getProfile();
    return this.formatSettings(s);
  }

  static async updateProfile(payload: any) {
    const updates: Partial<WorkshopSettings> = {
      ...(payload.businessName !== undefined && { business_name: payload.businessName }),
      ...(payload.tagline !== undefined && { tagline: payload.tagline }),
      ...(payload.businessPhone !== undefined && { business_phone: payload.businessPhone }),
      ...(payload.businessEmail !== undefined && { business_email: payload.businessEmail }),
      ...(payload.workshopAddress !== undefined && { workshop_address: payload.workshopAddress }),
      ...(payload.gstin !== undefined && { gstin: payload.gstin }),
      ...(payload.businessHours !== undefined && { business_hours: payload.businessHours }),
      ...(payload.dataRetentionDays !== undefined && { data_retention_days: Number(payload.dataRetentionDays) }),
      ...(payload.autoCleanupEnabled !== undefined && { auto_cleanup_enabled: Boolean(payload.autoCleanupEnabled) }),
      ...(payload.retentionTarget !== undefined && { retention_target: payload.retentionTarget }),
    };

    const s = await db.settings.updateProfile(updates);
    return this.formatSettings(s);
  }
}
