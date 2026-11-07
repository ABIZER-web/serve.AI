/**
 * GST-Compliant Tax Invoice Utility
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateInvoiceData = (order, restaurant) => {
  const dateFormatted = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const invoiceNumber = order.invoiceNumber || `INV-2026-${order.orderNumber.replace(/[^0-9]/g, '').slice(-3) || '001'}`;

  return {
    restaurant: {
      name: restaurant.name || 'Food House',
      legalName: restaurant.legalName || 'Food House Gourmet Hospitality Pvt Ltd',
      address: restaurant.address || '#42, 100 Feet Road, Indiranagar, Bangalore',
      phone: restaurant.phone || '+91 98765 43210',
      gstin: restaurant.gstin || '29AABCU9603R1ZM',
    },
    invoiceNumber,
    orderNumber: order.orderNumber,
    tableNumber: order.tableNumber,
    date: dateFormatted,
    customerName: order.customerName || 'Guest Customer',
    customerPhone: order.customerPhone || 'N/A',
    items: order.items || [],
    subtotal: order.subtotal,
    discountAmount: order.discountAmount || 0,
    taxableAmount: order.taxableAmount,
    cgstRate: 2.5,
    cgstAmount: order.cgstAmount,
    sgstRate: 2.5,
    sgstAmount: order.sgstAmount,
    grandTotal: order.grandTotal,
    paymentMethod: order.paymentMethod?.toUpperCase() || 'COUNTER',
    paymentStatus: order.paymentStatus?.toUpperCase() || 'PAID',
  };
};

export const exportInvoiceToPDF = async (elementId, filename = 'invoice.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (err) {
    console.error('PDF export failed:', err);
  }
};

