import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Smartphone, QrCode, CheckCircle2, Copy, Check, Radio, Lock, ShieldCheck } from 'lucide-react';

export const NfcProgrammingModal = ({ isOpen, onClose, table }) => {
  const [isCopied, setIsCopied] = useState(false);
  const targetUrl = window.location.origin + `/r/cafe-highfive/table/${table?.tableNumber || 'T-05'}?token=${table?.token || ''}`;

  const copyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl).catch(() => {});
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`NFC & Smart Stand Setup: Table ${table?.tableNumber || 'T-05'}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4 font-sans text-xs">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Dual QR + NFC Smart Table Stand</h4>
            <p className="text-white/90 text-[11px] mt-0.5">
              Customers can either scan the QR code with camera or tap their phone on the NFC chip to open the table ordering menu instantly with no app download.
            </p>
          </div>
        </div>

        {/* Target URL */}
        <div>
          <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
            Table URL (with Cryptographic Anti-Tamper Token)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={targetUrl}
              className="flex-1 p-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-gray-50 dark:bg-secondary-800 text-[11px] font-mono text-secondary-900 dark:text-white truncate"
            />
            <Button onClick={copyUrl} variant="outline" size="sm" icon={isCopied ? Check : Copy}>
              {isCopied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            🔒 Token prevents unauthorized diners from changing tables simply by altering the URL number.
          </span>
        </div>

        {/* 3 Step Programming Guide */}
        <div className="border border-gray-100 dark:border-secondary-800 rounded-2xl p-4 bg-white dark:bg-secondary-900 space-y-3">
          <h5 className="font-bold text-xs text-secondary-900 dark:text-white flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-primary" />
            <span>How to Program NTAG213 / NTAG215 Sticker in 30 Seconds</span>
          </h5>

          <ol className="space-y-2 text-gray-600 dark:text-gray-300 list-decimal list-inside pl-1 text-[11px]">
            <li>
              <strong>Download "NFC Tools"</strong> (Free on Android Google Play Store & iOS App Store).
            </li>
            <li>
              Open app &rarr; Tap <strong>"Write"</strong> &rarr; <strong>"Add a record"</strong> &rarr; Select <strong>"URL / URI"</strong>.
            </li>
            <li>
              Paste the copied URL above into the field and tap <strong>"OK"</strong>.
            </li>
            <li>
              Tap <strong>"Write / 28 Bytes"</strong> and touch your phone's back against the acrylic stand's NFC sticker.
            </li>
            <li>
              <em>(Optional)</em> Tap <strong>"Other tasks" &rarr; "Lock tag"</strong> to permanently make the NFC chip read-only so guests cannot overwrite it.
            </li>
          </ol>
        </div>

        {/* Hardware Specifications */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-secondary-800 border border-gray-100 dark:border-secondary-700">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Recommended Chip</span>
            <span className="font-bold text-secondary-900 dark:text-white">NTAG213 / NTAG215</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-secondary-800 border border-gray-100 dark:border-secondary-700">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Compatibility</span>
            <span className="font-bold text-secondary-900 dark:text-white">100% iOS & Android</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={onClose} variant="primary" size="sm">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
