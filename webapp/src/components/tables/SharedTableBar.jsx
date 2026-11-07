import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  Users,
  Wifi,
  QrCode,
  Share2,
  Check,
  Sparkles,
  Smartphone,
  ChevronDown,
  Edit2,
  Gamepad2,
  Receipt,
} from 'lucide-react';

export const SharedTableBar = ({
  tableNumber,
  currentGuestName,
  onChangeGuestName,
  onOpenGuestPortal,
  onOpenPayAtTable,
}) => {
  const { tableSessions } = useRestaurant();
  const [isCopied, setIsCopied] = useState(false);
  const [isEditNameOpen, setIsEditNameOpen] = useState(false);
  const [tempName, setTempName] = useState(currentGuestName || 'Diner');

  const session = tableSessions[tableNumber];
  const activeGuests = session?.activeGuests || [
    { id: 'g-default', name: currentGuestName || 'You', avatar: '👨‍💼', isHost: true },
  ];

  const handleShareTable = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSaveName = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      onChangeGuestName(tempName.trim());
      setIsEditNameOpen(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 dark:from-secondary-900 dark:via-secondary-850 dark:to-secondary-900 border-b border-amber-200/80 dark:border-secondary-800 px-4 py-2.5 font-sans">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Table & Connected Guests */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-secondary-800 border border-amber-300 dark:border-secondary-700 font-bold text-secondary-900 dark:text-white shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Table {tableNumber}</span>
            <span className="text-[10px] text-gray-400 font-mono">((📱 NFC Active))</span>
          </div>

          {/* Active Diners at Table */}
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2 overflow-hidden">
              {activeGuests.map((guest, idx) => (
                <div
                  key={idx}
                  className="inline-block h-6 w-6 rounded-full bg-primary/20 border-2 border-white dark:border-secondary-900 flex items-center justify-center text-xs shadow-xs"
                  title={`${guest.name} (${guest.isHost ? 'Host' : 'Guest'})`}
                >
                  {guest.avatar || '👤'}
                </div>
              ))}
            </div>
            <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300 hidden sm:inline">
              {activeGuests.length} Diners connected to this table
            </span>
          </div>
        </div>

        {/* Right: Actions (Guest Name, Invite Friends, Guest Portal, Pay) */}
        <div className="flex items-center gap-2">
          {/* Diner Name Tag */}
          <button
            onClick={() => setIsEditNameOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-secondary-800 hover:bg-gray-50 border border-gray-200 dark:border-secondary-700 text-[11px] font-bold text-gray-700 dark:text-gray-200 transition"
            title="Change Your Name"
          >
            <span>You: {currentGuestName}</span>
            <Edit2 className="w-3 h-3 text-gray-400" />
          </button>

          {/* Invite Friend to Table */}
          <button
            onClick={handleShareTable}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-[11px] transition"
            title="Share table link with friends at your table"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
            <span>{isCopied ? 'Link Copied!' : 'Invite to Table'}</span>
          </button>

          {/* Guest Portal & Games */}
          <button
            onClick={onOpenGuestPortal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition"
          >
            <Gamepad2 className="w-3 h-3" />
            <span className="hidden sm:inline">Wi-Fi & Games</span>
          </button>

          {/* Pay at Table */}
          <button
            onClick={onOpenPayAtTable}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition"
          >
            <Receipt className="w-3 h-3" />
            <span>Pay at Table</span>
          </button>
        </div>
      </div>

      {/* Edit Guest Name Modal */}
      {isEditNameOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl p-5 max-w-xs w-full border border-gray-100 dark:border-secondary-800 shadow-2xl space-y-3 font-sans">
            <h4 className="font-bold text-sm text-secondary-900 dark:text-white">
              Who is ordering?
            </h4>
            <p className="text-[11px] text-gray-400">
              Your name tags the items you add to the shared table cart!
            </p>

            <form onSubmit={handleSaveName} className="space-y-3 text-xs">
              <input
                type="text"
                autoFocus
                required
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="e.g. Rahul, Ananya, Priya"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-gray-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditNameOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
