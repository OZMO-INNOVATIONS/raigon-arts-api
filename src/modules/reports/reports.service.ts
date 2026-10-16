import { db } from '../../db/index.js';

export class ReportsService {
  static async getSummary(period: string = 'month1') {
    return db.reports.getSummary(period);
  }
}
