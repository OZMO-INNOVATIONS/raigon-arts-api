import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.js';
import { CustomerService } from './customer.service.js';

export class CustomerController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.list(req.query as any);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const customer = await CustomerService.getById(id);
      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getNextId(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await CustomerService.getNextId();
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const uploadedPhotos = files?.['photos'] || [];
      const uploadedFramePhotos = files?.['frame_photos'] || [];

      // If sent via multipart form-data, customer data is in req.body.customerData
      // If sent as application/json, req.body is the customer data itself
      const rawData = req.body.customerData || req.body;

      const customer = await CustomerService.create(rawData, uploadedPhotos, uploadedFramePhotos);

      res.status(201).json({
        success: true,
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const uploadedPhotos = files?.['photos'] || [];
      const uploadedFramePhotos = files?.['frame_photos'] || [];
      const rawData = req.body.customerData || req.body;

      const customer = await CustomerService.update(id, rawData, uploadedPhotos, uploadedFramePhotos);

      res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status } = req.body;
      const data = await CustomerService.updateStatus(id, status);
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async updatePayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { advance, paymentStatus } = req.body;
      const data = await CustomerService.updatePayment(id, advance, paymentStatus);
      res.status(200).json({
        success: true,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await CustomerService.delete(id);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async deletePhoto(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const photoId = req.params.photoId as string;
      const result = await CustomerService.deletePhoto(id, photoId);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async downloadZip(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await CustomerService.downloadPhotosZip(id, res);
    } catch (err) {
      next(err);
    }
  }

  static async downloadInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const pdfBuffer = await CustomerService.generateInvoice(id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="Invoice_${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  static async exportCsv(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const csv = await CustomerService.exportCsv();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="customers_export_${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send(csv);
    } catch (err) {
      next(err);
    }
  }
}
