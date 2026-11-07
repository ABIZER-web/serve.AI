import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Radio,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Layers,
  Lock,
  Sparkles,
} from 'lucide-react';

export const NfcSetupGuideModal = ({ isOpen, onClose, restaurant, tables }) => {
  const [copiedTable, setCopiedTable] = useState(null);

  const handleCopy = (tableNumber, url) => {
    navigator.clipboard.writeText(url);
    setCopiedTable(tableNumber);
    setTimeout(() => setCopiedTable(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="NFC Tag Setup & Programming Guide"
      maxWidth="max-w-2xl"
    >
      <div className="font-sans space-y-5 text-secondary-900 dark:text-white">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-500/10 via-primary/10 to-orange-500/10 border border-primary/30 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-display font-bold text-base text-secondary-900 dark:text-white">
              Zero-App Tap-to-Order NFC Tags
            </h4>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
              Customers simply tap their iPhone or Android phone on the table tag to open the table menu in their mobile browser with zero app installation.
            </p>
          </div>
        </div>

        {/* 4 Step Setup Guide */}
        <div className="space-y-3">
          <h5 className="font-bold text-xs uppercase tracking-wider text-gray-400">
            4-Step Quick Setup Instructions
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary-800 border border-gray-100 dark:border-secondary-700 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-secondary-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[11px]">
                  1
                </span>
                <span>Get Compatible NFC Tags</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                Purchase standard <strong>NTAG213</strong>, <strong>NTAG215</strong>, or <strong>NTAG216</strong> adhesive stickers. If sticking on metal tables, use <strong>anti-metal / on-metal ferrite tags</strong>.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary-800 border border-gray-100 dark:border-secondary-700 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-secondary-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[11px]">
                  2
                </span>
                <span>Download "NFC Tools" App</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                Download the free <strong>NFC Tools</strong> app from the Apple App Store or Google Play Store onto your smartphone.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary-800 border border-gray-100 dark:border-secondary-700 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-secondary-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[11px]">
                  3
                </span>
                <span>Write NDEF URL Record</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                In NFC Tools, tap <strong>Write &rarr; Add a record &rarr; URL / URI</strong>. Copy and paste the table's secure URL below, tap Write, and hold phone to tag.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-secondary-800 border border-gray-100 dark:border-secondary-700 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-secondary-900 dark:text-white">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[11px]">
                  4
                </span>
                <span>Lock as Read-Only (Optional)</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                Lock the tag to Read-Only so curious guests cannot overwrite or erase the table URL record.
              </p>
            </div>
          </div>
        </div>

        {/* Table-by-Table NFC URLs */}
        <div>
          <h5 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-2">
            Table NFC Entry URLs (One-Click Copy)
          </h5>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
            {tables.map((t) => {
              const fullUrl = `${window.location.origin}/r/${restaurant.slug}/table/${t.tableNumber}?token=${t.token}&source=nfc`;
              const isCopied = copiedTable === t.tableNumber;

              return (
                <div
                  key={t.id}
                  className="p-3 bg-gray-50 dark:bg-secondary-800 rounded-xl border border-gray-200 dark:border-secondary-700 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-secondary-900 dark:text-white flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span>{t.tableNumber}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({t.section})</span>
                    </div>
                    <div className="font-mono text-[10px] text-gray-400 truncate mt-0.5">
                      {fullUrl}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(t.tableNumber, fullUrl)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-secondary-700 hover:bg-gray-100 text-secondary-900 dark:text-white border font-bold text-xs flex items-center gap-1 transition flex-shrink-0 active:scale-95"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button onClick={onClose} size="md">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};

