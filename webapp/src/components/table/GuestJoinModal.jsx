import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Users, Sparkles, ShieldCheck } from 'lucide-react';

const AVATARS = ['👨‍💼', '👩‍💻', '👨‍🎨', '👩‍🔬', '🧑‍🍳', '👩‍🚀', '🦸', '🧝'];

export const GuestJoinModal = ({ isOpen, onClose, tableNumber, onJoin }) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const guestName = name.trim() || `Guest ${Math.floor(10 + Math.random() * 90)}`;
    onJoin(guestName, selectedAvatar);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        // Default join if dismissed
        if (!name.trim()) onJoin('Guest', selectedAvatar);
        onClose();
      }}
      title={`Join Table ${tableNumber || 'T-05'}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        <div className="bg-gradient-to-br from-primary-50 via-amber-50 to-orange-50 dark:from-primary-950/40 dark:to-secondary-900 border border-primary-200/70 dark:border-primary-900/50 rounded-2xl p-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white mx-auto flex items-center justify-center shadow-md mb-2">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-secondary-900 dark:text-white">
            Shared Table Experience
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-xs mx-auto leading-relaxed">
            You and your table companions share a live cart! Add food from your phone, watch items sync in real time, and split the bill easily.
          </p>
        </div>

        {/* Avatar Picker */}
        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1.5">
            Choose Your Avatar
          </label>
          <div className="flex items-center justify-between gap-1.5 bg-gray-50 dark:bg-secondary-800 p-2 rounded-2xl border border-gray-100 dark:border-secondary-700">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all ${
                  selectedAvatar === av
                    ? 'bg-white dark:bg-secondary-700 shadow-md ring-2 ring-primary scale-110'
                    : 'hover:bg-white/60 opacity-70 hover:opacity-100'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Guest Nickname */}
        <div>
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
            Your Nickname
          </label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul, Ananya, Kabir"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
          <p className="text-[11px] text-gray-400 mt-1">
            This name will be shown next to items you add to the shared table cart.
          </p>
        </div>

        <div className="pt-2">
          <Button type="submit" size="md" className="w-full font-bold shadow-md">
            Enter Table {tableNumber}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

