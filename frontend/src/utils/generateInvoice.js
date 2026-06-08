import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateInvoice(order) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // ─── Header background ───────────────────────────────────────────────
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('FarmConnect', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Smart Agriculture Marketplace', margin, 25);

  // INVOICE label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('INVOICE', pageWidth - margin, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`#${order.id.slice(0, 8).toUpperCase()}`, pageWidth - margin, 25, { align: 'right' });

  // ─── Meta info ───────────────────────────────────────────────────────
  doc.setTextColor(40, 40, 40);
  const topY = 50;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('INVOICE DATE', margin, topY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
    margin,
    topY + 5
  );

  doc.setFont('helvetica', 'bold');
  doc.text('ORDER STATUS', pageWidth / 2, topY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(5, 150, 105);
  doc.text(order.status || 'DELIVERED', pageWidth / 2, topY + 5, { align: 'center' });
  doc.setTextColor(40, 40, 40);

  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT', pageWidth - margin, topY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(order.payment?.status || 'SUCCESS', pageWidth - margin, topY + 5, { align: 'right' });

  // ─── Divider ─────────────────────────────────────────────────────────
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, topY + 12, pageWidth - margin, topY + 12);

  // ─── Parties ─────────────────────────────────────────────────────────
  const partiesY = topY + 20;

  // Buyer details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('BILLED TO (BUYER)', margin, partiesY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  // Try to get buyer info from order
  const buyerName = order.buyer?.name || 'Buyer';
  doc.text(buyerName, margin, partiesY + 6);

  // Farmer / seller details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('SOLD BY (FARMER)', pageWidth - margin, partiesY, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const farmerName = order.crop?.farmer?.name || order.crop?.farmerId || 'Farmer';
  doc.text(farmerName, pageWidth - margin, partiesY + 6, { align: 'right' });
  if (order.crop?.location) {
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(order.crop.location, pageWidth - margin, partiesY + 12, { align: 'right' });
  }

  // ─── Items table ─────────────────────────────────────────────────────
  const tableY = partiesY + 25;

  autoTable(doc, {
    startY: tableY,
    margin: { left: margin, right: margin },
    head: [['#', 'Crop', 'Qty (kg)', 'Rate / kg', 'Total']],
    body: [
      [
        '1',
        order.crop?.cropName || 'Crop',
        order.quantity?.toFixed(2) || '0',
        `₹${(order.crop?.pricePerKg || 0).toFixed(2)}`,
        `₹${(order.totalPrice || 0).toFixed(2)}`,
      ],
    ],
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 10, textColor: [40, 40, 40] },
    columnStyles: {
      0: { cellWidth: 10 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: { fillColor: [245, 255, 250] },
    theme: 'grid',
  });

  // ─── Totals ──────────────────────────────────────────────────────────
  const finalY = doc.lastAutoTable.finalY + 8;

  doc.setDrawColor(220, 220, 220);
  doc.line(pageWidth / 2, finalY, pageWidth - margin, finalY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(5, 150, 105);
  doc.text('TOTAL AMOUNT', pageWidth / 2 + 5, finalY + 8);
  doc.setFontSize(13);
  doc.text(`₹${(order.totalPrice || 0).toFixed(2)}`, pageWidth - margin, finalY + 8, { align: 'right' });

  // ─── Transaction ID ──────────────────────────────────────────────────
  if (order.payment?.transactionId) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text(`Transaction ID: ${order.payment.transactionId}`, margin, finalY + 8);
  }

  // ─── Footer ──────────────────────────────────────────────────────────
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, footerY - 5, pageWidth, 30, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(130, 130, 130);
  doc.text('Thank you for trading on FarmConnect — Empowering Indian Farmers', pageWidth / 2, footerY, { align: 'center' });
  doc.text('This is a computer-generated invoice and does not require a signature.', pageWidth / 2, footerY + 5, { align: 'center' });

  // ─── Save ─────────────────────────────────────────────────────────────
  const filename = `FarmConnect_Invoice_${order.id.slice(0, 8).toUpperCase()}.pdf`;
  doc.save(filename);
}
