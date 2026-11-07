import React, { useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { generateInvoiceData, exportInvoiceToPDF } from '../../utils/invoiceGenerator';
import { formatINR } from '../../utils/currency';
import { Printer, Download, UtensilsCrossed } from 'lucide-react';

export const InvoiceModal = ({ isOpen, onClose, order, restaurant }) => {
  if (!order || !restaurant) return null;

  const invoice = generateInvoiceData(order, restaurant);
  const invoiceRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    exportInvoiceToPDF('tax-invoice-printable', `${invoice.invoiceNumber}.pdf`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Invoice" maxWidth="max-w-md">
      <div>
        {/* Printable Invoice Container */}
        <div
          id="tax-invoice-printable"
          ref={invoiceRef}
          className="bg-white text-secondary-900 p-6 rounded-xl border border-gray-200 shadow-sm font-sans"
        >
          {/* Header */}
          <div className="text-center border-b pb-4">
            <div className="flex items-center justify-center gap-1.5 font-display font-black text-xl text-secondary-900 tracking-tight">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              <span>{invoice.restaurant.name.toUpperCase()}</span>
            </div>
            <div className="text-[10px] font-sans text-gray-500 font-bold tracking-widest uppercase mt-0.5">
              TAX INVOICE
            </div>
            <div className="text-[10px] text-gray-500 mt-1 max-w-[260px] mx-auto leading-tight">
              {invoice.restaurant.address}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              GSTIN: <span className="font-mono font-bold">{invoice.restaurant.gstin}</span>
            </div>
          </div>

          {/* Meta Details Grid */}
          <div className="py-3 border-b text-[11px] grid grid-cols-2 gap-y-1 text-gray-600">
            <div>
              <span className="text-gray-400">Invoice No: </span>
              <span className="font-bold text-secondary-900">{invoice.invoiceNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400">Table: </span>
              <span className="font-bold text-secondary-900">{invoice.tableNumber}</span>
            </div>
            <div>
              <span className="text-gray-400">Order No: </span>
              <span className="font-bold text-secondary-900">{invoice.orderNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400">Date: </span>
              <span className="font-medium text-secondary-900">{invoice.date}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-[11px] my-3 border-collapse">
            <thead>
              <tr className="border-b text-gray-400 uppercase text-[9px] text-left">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="font-medium">
                  <td className="py-1.5 pr-2">
                    <div className="font-bold text-secondary-900">{item.name}</div>
                    {item.variantName && item.variantName !== 'Standard' && (
                      <div className="text-[9px] text-gray-400">({item.variantName})</div>
                    )}
                  </td>
                  <td className="py-1.5 text-center text-gray-700">{item.quantity}</td>
                  <td className="py-1.5 text-right text-gray-700">{formatINR(item.unitPrice)}</td>
                  <td className="py-1.5 text-right font-bold text-secondary-900">
                    {formatINR(item.totalPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals & Tax Breakdown */}
          <div className="border-t pt-2 space-y-1 text-[11px] text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-secondary-900">{formatINR(invoice.subtotal)}</span>
            </div>

            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-{formatINR(invoice.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>CGST (2.5%)</span>
              <span>{formatINR(invoice.cgstAmount)}</span>
            </div>

            <div className="flex justify-between">
              <span>SGST (2.5%)</span>
              <span>{formatINR(invoice.sgstAmount)}</span>
            </div>

            <div className="flex justify-between text-xs font-black text-secondary-900 pt-2 border-t">
              <span>Grand Total</span>
              <span className="text-sm">{formatINR(invoice.grandTotal)}</span>
            </div>

            <div className="flex justify-between text-[10px] text-gray-500 pt-1">
              <span>Payment Mode</span>
              <span className="font-bold uppercase text-secondary-800">{invoice.paymentMethod}</span>
            </div>
          </div>

          {/* Footer & Verification QR */}
          <div className="text-center pt-4 mt-3 border-t">
            <div className="font-bold text-xs text-secondary-900">Thank you! Visit Again!</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Please scan to verify invoice integrity</div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(`INV:${invoice.invoiceNumber}|ORDER:${invoice.orderNumber}|AMT:${invoice.grandTotal}`)}`}
              alt="Verification QR"
              className="w-16 h-16 mx-auto mt-2 rounded border p-1"
            />
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button onClick={handlePrint} variant="outline" size="sm" icon={Printer}>
            Print Invoice
          </Button>
          <Button onClick={handleDownloadPDF} variant="primary" size="sm" icon={Download}>
            Download PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

