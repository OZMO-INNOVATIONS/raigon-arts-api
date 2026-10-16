import { db } from '../../db/index.js';
import { CustomerFilters, CustomerFrameDTO, OrderStatus, PaymentStatus } from '../../types/index.js';
import { StorageService } from '../storage/storage.service.js';
import { generateCustomerInvoicePdf } from '../../utils/pdfGenerator.js';
import { generateCustomersCsv } from '../../utils/csvGenerator.js';
import { streamCustomerPhotosZip } from '../../utils/zipArchiver.js';
import { Response } from 'express';
import { logger } from '../../utils/logger.js';

export class CustomerService {
  static async list(filters: CustomerFilters) {
    return db.customers.findCustomers(filters);
  }

  static async getById(id: string) {
    const customer = await db.customers.findById(id);
    if (!customer) {
      throw { status: 404, message: `Customer with ID ${id} not found.` };
    }
    return customer;
  }

  static async getNextId() {
    const nextId = await db.customers.getNextId();
    return { nextId };
  }

  static async create(
    rawCustomerData: any,
    uploadedPhotos: Express.Multer.File[] = [],
    uploadedFramePhotos: Express.Multer.File[] = []
  ) {
    // Parse customerData if passed as JSON string in multipart form-data
    let data = rawCustomerData;
    if (typeof rawCustomerData === 'string') {
      try {
        data = JSON.parse(rawCustomerData);
      } catch {
        throw { status: 400, message: 'Invalid customerData JSON payload' };
      }
    }

    const customerId = data.id || (await db.customers.getNextId());
    data.id = customerId;

    // 1. Process and upload vault photos
    const processedPhotos: Array<{
      name: string;
      url: string;
      thumbnailUrl?: string;
      sizeBytes: number;
      mimeType: string;
    }> = [];

    for (const file of uploadedPhotos) {
      try {
        const uploaded = await StorageService.processAndUploadPhoto(
          `customers/${customerId}`,
          file
        );
        processedPhotos.push({
          name: uploaded.fileName,
          url: uploaded.fileUrl,
          thumbnailUrl: uploaded.thumbnailUrl,
          sizeBytes: uploaded.sizeBytes,
          mimeType: uploaded.mimeType,
        });
      } catch (e) {
        logger.error(`Error uploading photo ${file.originalname}:`, e);
      }
    }

    // 2. Process frame individual photos if any
    const framePhotosMap = new Map<string, string>();
    for (const file of uploadedFramePhotos) {
      try {
        const uploaded = await StorageService.processAndUploadPhoto(
          `customers/${customerId}/frames`,
          file
        );
        framePhotosMap.set(file.originalname, uploaded.fileUrl);
      } catch (e) {
        logger.error(`Error uploading frame photo ${file.originalname}:`, e);
      }
    }

    // 3. Assemble frames
    const frames: CustomerFrameDTO[] = (data.frames || []).map((f: any) => {
      let photoUrl = f.photoUrl || '';
      if (f.photoName && framePhotosMap.has(f.photoName)) {
        photoUrl = framePhotosMap.get(f.photoName)!;
      }
      return {
        ...f,
        photoUrl,
      };
    });

    const created = await db.customers.createCustomer(data, processedPhotos, frames);
    return created;
  }

  static async update(
    id: string,
    rawCustomerData: any,
    uploadedPhotos: Express.Multer.File[] = []
  ) {
    let data = rawCustomerData;
    if (typeof rawCustomerData === 'string') {
      try {
        data = JSON.parse(rawCustomerData);
      } catch {
        throw { status: 400, message: 'Invalid customerData JSON payload' };
      }
    }

    const processedPhotos: Array<{
      name: string;
      url: string;
      thumbnailUrl?: string;
      sizeBytes: number;
      mimeType: string;
    }> = [];

    for (const file of uploadedPhotos) {
      const uploaded = await StorageService.processAndUploadPhoto(
        `customers/${id}`,
        file
      );
      processedPhotos.push({
        name: uploaded.fileName,
        url: uploaded.fileUrl,
        thumbnailUrl: uploaded.thumbnailUrl,
        sizeBytes: uploaded.sizeBytes,
        mimeType: uploaded.mimeType,
      });
    }

    const updated = await db.customers.updateCustomer(id, data, processedPhotos, data.frames);
    if (!updated) {
      throw { status: 404, message: `Customer ${id} not found to update.` };
    }
    return updated;
  }

  static async updateStatus(id: string, status: OrderStatus) {
    const updated = await db.customers.updateStatus(id, status);
    if (!updated) {
      throw { status: 404, message: `Customer ${id} not found.` };
    }
    return {
      id: updated.id,
      status: updated.status,
      updatedAt: updated.updatedAt,
    };
  }

  static async updatePayment(id: string, advance: number, paymentStatus?: PaymentStatus) {
    const customer = await db.customers.findById(id);
    if (!customer) {
      throw { status: 404, message: `Customer ${id} not found.` };
    }

    const newAdvance = Number(advance);
    let derivedStatus = paymentStatus;
    if (!derivedStatus) {
      if (newAdvance >= customer.total && customer.total > 0) derivedStatus = 'Paid';
      else if (newAdvance > 0) derivedStatus = 'Partial';
      else derivedStatus = 'Unpaid';
    }

    const updated = await db.customers.updatePayment(id, newAdvance, derivedStatus);
    if (!updated) {
      throw { status: 500, message: 'Failed to update payment record.' };
    }

    return {
      id: updated.id,
      advance: updated.advance,
      balance: updated.balance,
      paymentStatus: updated.paymentStatus,
      updatedAt: updated.updatedAt,
    };
  }

  static async delete(id: string) {
    const customer = await db.customers.findById(id);
    if (!customer) {
      throw { status: 404, message: `Customer ${id} not found.` };
    }

    // Clean customer photos from storage
    if (customer.photoUrls) {
      for (const url of customer.photoUrls) {
        await StorageService.deleteFile(url);
      }
    }

    await db.customers.deleteCustomer(id);
    return { message: `Customer ${id} deleted.` };
  }

  static async deletePhoto(id: string, photoId: string) {
    const deleted = await db.customers.deletePhoto(id, photoId);
    if (!deleted) {
      throw { status: 404, message: 'Photo not found for customer.' };
    }
    return { message: 'Photo deleted.' };
  }

  static async downloadPhotosZip(id: string, res: Response) {
    const customer = await db.customers.findById(id);
    if (!customer) {
      throw { status: 404, message: `Customer ${id} not found.` };
    }

    const photos = (customer.photoNames || []).map((name, index) => ({
      fileName: name,
      fileUrl: customer.photoUrls[index],
    }));

    await streamCustomerPhotosZip(id, photos, res);
  }

  static async generateInvoice(id: string): Promise<Buffer> {
    const customer = await db.customers.findById(id);
    if (!customer) {
      throw { status: 404, message: `Customer ${id} not found.` };
    }

    const workshop = await db.settings.getProfile();
    return generateCustomerInvoicePdf(customer, workshop);
  }

  static async exportCsv(): Promise<string> {
    const customers = await db.customers.getAllForExport();
    return generateCustomersCsv(customers);
  }
}
