import { db } from '../../db/index.js';

export class DashboardService {
  static async getStats() {
    return db.dashboard.getStats();
  }
}
