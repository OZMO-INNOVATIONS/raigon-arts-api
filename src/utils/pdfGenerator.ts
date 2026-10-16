import PDFDocument from 'pdfkit';
import { CustomerResponseDTO, WorkshopSettings } from '../types/index.js';

export function generateCustomerInvoicePdf(
  customer: CustomerResponseDTO,
  workshop: WorkshopSettings
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Primary colors
      const primaryColor = '#1e293b'; // slate-800
      const accentColor = '#0f766e'; // teal-700
      const grayColor = '#64748b'; // slate-500
      const lightBg = '#f8fafc'; // slate-50

      // --- HEADER ---
      doc.rect(40, 40, 515, 75).fill(lightBg);

      doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text(workshop.business_name, 55, 50);
      doc.fillColor(accentColor).fontSize(10).font('Helvetica-Bold').text(workshop.tagline.toUpperCase(), 55, 74);
      doc.fillColor(grayColor).fontSize(8.5).font('Helvetica').text(
        `${workshop.workshop_address} | Phone: ${workshop.business_phone} | GSTIN: ${workshop.gstin || 'N/A'}`,
        55,
        88
      );

      doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('INVOICE / JOB SHEET', 360, 52, {
        align: 'right',
        width: 180,
      });
      doc.fillColor(accentColor).fontSize(11).font('Helvetica-Bold').text(`ORDER #${customer.id}`, 360, 72, {
        align: 'right',
        width: 180,
      });

      // --- CUSTOMER & ORDER INFO BOX ---
      const infoY = 130;
      doc.rect(40, infoY, 250, 95).strokeColor('#e2e8f0').stroke();
      doc.rect(305, infoY, 250, 95).strokeColor('#e2e8f0').stroke();

      // Customer column
      doc.fillColor(accentColor).fontSize(9.5).font('Helvetica-Bold').text('CUSTOMER DETAILS', 50, infoY + 8);
      doc.fillColor(primaryColor).fontSize(9.5).font('Helvetica-Bold').text(customer.name, 50, infoY + 24);
      doc.fillColor(grayColor).fontSize(8.5).font('Helvetica').text(`Phone: ${customer.phone}${customer.altPhone ? ` / ${customer.altPhone}` : ''}`, 50, infoY + 38);
      doc.text(`City: ${customer.city || 'N/A'} | Pin: ${customer.pincode || 'N/A'}`, 50, infoY + 52);
      doc.text(`Address: ${customer.address || 'N/A'}`, 50, infoY + 66, { width: 230, height: 24, ellipsis: true });

      // Order info column
      doc.fillColor(accentColor).fontSize(9.5).font('Helvetica-Bold').text('ORDER SPECIFICATIONS', 315, infoY + 8);
      doc.fillColor(grayColor).fontSize(8.5).font('Helvetica').text('Order Date:', 315, infoY + 24);
      doc.fillColor(primaryColor).font('Helvetica-Bold').text(new Date(customer.orderDate).toLocaleDateString(), 410, infoY + 24);

      doc.fillColor(grayColor).font('Helvetica').text('Expected Delivery:', 315, infoY + 38);
      doc.fillColor(primaryColor).font('Helvetica-Bold').text(
        customer.expectedDelivery ? new Date(customer.expectedDelivery).toLocaleDateString() : 'To be confirmed',
        410,
        infoY + 38
      );

      doc.fillColor(grayColor).font('Helvetica').text('Order Status:', 315, infoY + 52);
      doc.fillColor(accentColor).font('Helvetica-Bold').text(customer.status.toUpperCase(), 410, infoY + 52);

      doc.fillColor(grayColor).font('Helvetica').text('Payment Status:', 315, infoY + 66);
      doc.fillColor(customer.paymentStatus === 'Paid' ? '#16a34a' : '#d97706').font('Helvetica-Bold').text(
        customer.paymentStatus.toUpperCase(),
        410,
        infoY + 66
      );

      // --- FRAMES TABLE HEADER ---
      let tableY = 245;
      doc.rect(40, tableY, 515, 22).fill('#f1f5f9');
      doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold');
      doc.text('#', 48, tableY + 6);
      doc.text('Frame Size', 68, tableY + 6);
      doc.text('Type & Moulding', 155, tableY + 6);
      doc.text('Finish / Orientation', 270, tableY + 6);
      doc.text('Qty', 395, tableY + 6);
      doc.text('Notes / Special Req', 430, tableY + 6);

      // --- FRAMES TABLE ROWS ---
      tableY += 22;
      const frames = customer.frames && customer.frames.length > 0 ? customer.frames : [
        {
          size: customer.frameSize || '12 × 18 inch',
          frameType: customer.frameType || 'Teak Wood Moulding',
          finish: 'Standard',
          orientation: 'Horizontal',
          qty: customer.qty || 1,
          notes: 'Standard framing',
        },
      ];

      frames.forEach((frame, index) => {
        const rowHeight = 30;
        doc.rect(40, tableY, 515, rowHeight).strokeColor('#f1f5f9').stroke();

        doc.fillColor(grayColor).fontSize(8).font('Helvetica').text((index + 1).toString(), 48, tableY + 8);
        doc.fillColor(primaryColor).font('Helvetica-Bold').text(frame.size, 68, tableY + 8);
        doc.fillColor(grayColor).font('Helvetica').text(frame.frameType || frame.material || 'Standard', 155, tableY + 8, { width: 105, ellipsis: true });
        doc.text(`${frame.finish || '-'} / ${frame.orientation || '-'}`, 270, tableY + 8, { width: 115, ellipsis: true });
        doc.fillColor(primaryColor).font('Helvetica-Bold').text((frame.qty || 1).toString(), 395, tableY + 8);
        doc.fillColor(grayColor).font('Helvetica').text(frame.notes || 'None', 430, tableY + 8, { width: 120, height: 22, ellipsis: true });

        tableY += rowHeight;
      });

      // --- FINANCIAL TOTALS BOX ---
      const finY = Math.max(tableY + 25, 420);
      const finX = 320;
      doc.rect(finX, finY, 235, 95).fill('#f8fafc');
      doc.rect(finX, finY, 235, 95).strokeColor('#cbd5e1').stroke();

      doc.fillColor(grayColor).fontSize(9.5).font('Helvetica').text('Total Amount:', finX + 15, finY + 12);
      doc.fillColor(primaryColor).font('Helvetica-Bold').text(`₹ ${customer.total.toFixed(2)}`, finX + 130, finY + 12, { align: 'right', width: 90 });

      doc.fillColor(grayColor).font('Helvetica').text('Advance Received:', finX + 15, finY + 32);
      doc.fillColor('#16a34a').font('Helvetica-Bold').text(`₹ ${customer.advance.toFixed(2)}`, finX + 130, finY + 32, { align: 'right', width: 90 });

      doc.moveTo(finX + 15, finY + 52).lineTo(finX + 220, finY + 52).strokeColor('#cbd5e1').stroke();

      doc.fillColor(primaryColor).fontSize(10.5).font('Helvetica-Bold').text('Balance Due:', finX + 15, finY + 62);
      doc.fillColor(customer.balance > 0 ? '#dc2626' : '#16a34a').fontSize(11).font('Helvetica-Bold').text(`₹ ${customer.balance.toFixed(2)}`, finX + 130, finY + 62, { align: 'right', width: 90 });

      // --- ATTACHED PHOTOS SUMMARY ---
      const photoBoxY = finY;
      doc.rect(40, photoBoxY, 260, 95).strokeColor('#e2e8f0').stroke();
      doc.fillColor(accentColor).fontSize(9).font('Helvetica-Bold').text('DIGITAL VAULT & PHOTOS', 50, photoBoxY + 10);
      doc.fillColor(grayColor).fontSize(8.5).font('Helvetica').text(`Total Attached Files: ${customer.photoCount || 0}`, 50, photoBoxY + 28);
      if (customer.photoNames && customer.photoNames.length > 0) {
        doc.text(`Files: ${customer.photoNames.slice(0, 3).join(', ')}${customer.photoNames.length > 3 ? ` (+${customer.photoNames.length - 3} more)` : ''}`, 50, photoBoxY + 44, { width: 240 });
      } else {
        doc.text('No digital files attached to this order.', 50, photoBoxY + 44);
      }
      doc.text('High-resolution printing assets stored in Vault.', 50, photoBoxY + 74);

      // --- TERMS & SIGNATURE FOOTER ---
      const footerY = 660;
      doc.rect(40, footerY, 515, 110).strokeColor('#f1f5f9').stroke();

      doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold').text('TERMS & CONDITIONS:', 50, footerY + 10);
      doc.fillColor(grayColor).fontSize(7.5).font('Helvetica').text(
        '1. Please present this job sheet or order confirmation message during pickup.\n' +
        '2. Frame dimensions and finishes are crafted according to the specifications above.\n' +
        '3. Goods once delivered cannot be returned unless manufacturing defects are reported within 24 hours.\n' +
        '4. Workshop storage warranty applies for 30 days after expected delivery date.',
        50,
        footerY + 24,
        { lineGap: 3, width: 330 }
      );

      // Signatures
      doc.moveTo(410, footerY + 70).lineTo(530, footerY + 70).strokeColor('#94a3b8').stroke();
      doc.fillColor(grayColor).fontSize(8).font('Helvetica').text('Authorized Workshop Signature', 400, footerY + 76, { align: 'center', width: 140 });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
