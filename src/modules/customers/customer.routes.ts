import { Router } from 'express';
import { CustomerController } from './customer.controller.js';
import { uploadCustomerFiles } from '../../middleware/upload.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { optionalToken } from '../../middleware/auth.middleware.js';
import {
  customerQuerySchema,
  updateStatusSchema,
  updatePaymentSchema,
} from './customer.schemas.js';

const router = Router();

// Apply optional auth token to all customer routes (allows both Bearer and public app access)
router.use(optionalToken);

// 2.8 Get Next Order ID (Must come before /:id)
router.get('/next-id', CustomerController.getNextId);

// 6.2 Export All Customers to CSV (Must come before /:id)
router.get('/export/csv', CustomerController.exportCsv);

// 2.1 Get All Customers with Filters, Search, and Pagination
router.get('/', validate({ query: customerQuerySchema }), CustomerController.list);

// 2.3 Create New Customer (Multipart with Direct Image Upload)
router.post('/', uploadCustomerFiles, CustomerController.create);

// 6.3 Generate Customer Order PDF / Invoice
router.get('/:id/invoice', CustomerController.downloadInvoice);

// 3.2 Bulk Download Order Photos as ZIP
router.get('/:id/photos/download-zip', CustomerController.downloadZip);

// 3.3 Delete Specific Photo
router.delete('/:id/photos/:photoId', CustomerController.deletePhoto);

// 2.5 Quick Order Status Change
router.patch('/:id/status', validate({ body: updateStatusSchema }), CustomerController.updateStatus);

// 2.6 Quick Payment Update
router.patch('/:id/payment', validate({ body: updatePaymentSchema }), CustomerController.updatePayment);

// 2.2 Get Single Customer Details by ID
router.get('/:id', CustomerController.getById);

// 2.4 Update Customer
router.put('/:id', uploadCustomerFiles, CustomerController.update);

// 2.7 Delete Customer
router.delete('/:id', CustomerController.delete);

export default router;
