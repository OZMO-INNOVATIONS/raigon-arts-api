import { CustomerResponseDTO } from '../types/index.js';

export function generateCustomersCsv(customers: CustomerResponseDTO[]): string {
  // UTF-8 Byte Order Mark (BOM) ensures Microsoft Excel and spreadsheet tools open Malayalam/Unicode and symbols without encoding errors
  const BOM = '\uFEFF';

  const headers = [
    'Order ID',
    'Customer Name',
    'Phone',
    'Alt Phone',
    'City',
    'Address',
    'Pincode',
    'Frame Size Summary',
    'Frame Type Summary',
    'Quantity',
    'Gross Total (INR)',
    'Advance Paid (INR)',
    'Balance Due (INR)',
    'Payment Status',
    'Order Status',
    'Order Date',
    'Expected Delivery',
    'Photos Attached',
  ];

  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = customers.map((c) => {
    return [
      escapeCsv(c.id),
      escapeCsv(c.name),
      escapeCsv(c.phone),
      escapeCsv(c.altPhone || ''),
      escapeCsv(c.city || ''),
      escapeCsv(c.address || ''),
      escapeCsv(c.pincode || ''),
      escapeCsv(c.frameSize || ''),
      escapeCsv(c.frameType || ''),
      escapeCsv(c.qty || 1),
      escapeCsv(c.total.toFixed(2)),
      escapeCsv(c.advance.toFixed(2)),
      escapeCsv(c.balance.toFixed(2)),
      escapeCsv(c.paymentStatus),
      escapeCsv(c.status),
      escapeCsv(new Date(c.orderDate).toLocaleDateString()),
      escapeCsv(c.expectedDelivery ? new Date(c.expectedDelivery).toLocaleDateString() : ''),
      escapeCsv(c.photoCount || 0),
    ].join(',');
  });

  return BOM + headers.join(',') + '\n' + rows.join('\n');
}
