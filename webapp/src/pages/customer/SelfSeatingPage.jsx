import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  UtensilsCrossed,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SelfSeatingPage = () => {
  const { restaurantSlug } = useParams();
  const navigate = useNavigate();
  const { restaurant, tables, tableSessions, joinTableSession } = useRestaurant();

  const [selectedTable, setSelectedTable] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');

  const isSelfSeatingEnabled = restaurant.selfSeatingEnabled !== false;

  const sections = ['All', ...new Set(tables.map((t) => t.section || 'Main Dining'))];

  const filteredTables = tables.filter((t) => {
    return selectedSection === 'All' || (t.section || 'Main Dining') === selectedSection;
  });

  const handleConfirmSeat = (e) => {
    e.preventDefault();
    if (!selectedTable) return;

    const nickname = guestName.trim() || `Guest ${Math.floor(10 + Math.random() * 90)}`;
    const session = joinTableSession(selectedTable.tableNumber, selectedTable.token, nickname);

    // Save in session storage
    sessionStorage.setItem(`serveai_guest_${selectedTable.tableNumber}`, nickname);

    // Navigate to menu with secure token
    navigate(`/r/${restaurant.slug || restaurantSlug}/table/${selectedTable.tableNumber}?token=${selectedTable.token}`);
  };

  if (!isSelfSeatingEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-secondary-950 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-secondary-900 rounded-3xl p-6 sm:p-8 text-center border border-gray-100 dark:border-secondary-800 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-display font-bold text-2xl text-secondary-900 dark:text-white">
            Self-Seating Disabled
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
            {restaurant.name} requires table seating to be assigned by host staff or via scanning the QR code physically placed on your dining table.
          </p>
          <div className="pt-2">
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-secondary-900 dark:text-white p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header */}
        <header className="flex items-center justify-between border-b border-gray-100 dark:border-secondary-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-xl block leading-tight">
                {restaurant.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Customer Self-Seating Portal
              </span>
            </div>
          </div>
        </header>

        {/* Instructions Banner */}
        <div className="bg-gradient-to-r from-primary-50 via-amber-50 to-orange-50 dark:from-primary-950/40 dark:to-secondary-900 border border-primary-200/60 dark:border-primary-900 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-secondary-900 dark:text-white">
              Choose an Available Table 🪑
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-lg leading-relaxed">
              Find an empty table in your preferred section. Occupied tables are locked to prevent collisions.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-secondary-700" /> Occupied
            </span>
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition shadow-xs ${
                selectedSection === sec
                  ? 'bg-primary text-white shadow-primary/20 scale-[1.02]'
                  : 'bg-white dark:bg-secondary-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-secondary-800'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Table Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {filteredTables.map((t) => {
            const isOccupied = t.isOccupied || Boolean(tableSessions[t.tableNumber]);
            const isSelected = selectedTable?.id === t.id;

            return (
              <button
                key={t.id}
                type="button"
                disabled={isOccupied}
                onClick={() => setSelectedTable(t)}
                className={`p-4 rounded-3xl border text-left transition-all relative flex flex-col justify-between ${
                  isOccupied
                    ? 'opacity-40 bg-gray-100 dark:bg-secondary-800 border-gray-200 dark:border-secondary-700 cursor-not-allowed'
                    : isSelected
                    ? 'bg-primary/5 dark:bg-primary/10 border-primary ring-2 ring-primary scale-[1.03] shadow-md'
                    : 'bg-white dark:bg-secondary-900 border-gray-200 dark:border-secondary-800 hover:border-primary/50 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display font-black text-xl text-secondary-900 dark:text-white">
                      {t.tableNumber}
                    </span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOccupied ? 'bg-gray-400' : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                  <div className="text-[11px] text-gray-500 font-semibold mt-1">
                    {t.section}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Seats {t.capacity} Guests
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-secondary-800 text-[10px] font-bold">
                  {isOccupied ? (
                    <span className="text-gray-400 uppercase">Occupied</span>
                  ) : isSelected ? (
                    <span className="text-primary uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                    </span>
                  ) : (
                    <span className="text-emerald-600 uppercase">Available</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirmation Drawer Bar */}
        {selectedTable && (
          <div className="fixed bottom-4 inset-x-4 max-w-xl mx-auto z-40 bg-white dark:bg-secondary-900 rounded-3xl p-4 shadow-2xl border border-gray-200 dark:border-secondary-800 animate-in slide-in-from-bottom-3">
            <form onSubmit={handleConfirmSeat} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase">
                    Ready to be seated at
                  </div>
                  <div className="font-display font-black text-xl text-secondary-900 dark:text-white">
                    Table {selectedTable.tableNumber} ({selectedTable.section})
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                  Verified Vacant
                </span>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Enter your name / nickname (e.g. Rahul)..."
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              <Button type="submit" size="md" className="w-full font-bold shadow-md flex items-center justify-center gap-2">
                <span>Confirm Seating & Open Menu</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

