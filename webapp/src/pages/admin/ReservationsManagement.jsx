import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  CalendarDays,
  Plus,
  Users,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const ReservationsManagement = () => {
  const { reservations, createReservation, tables } = useRestaurant();
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('T-01');
  const [partySize, setPartySize] = useState(4);
  const [reservationTime, setReservationTime] = useState('Tonight, 8:30 PM');
  const [notes, setNotes] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    createReservation({
      customerName,
      customerPhone,
      tableNumber,
      partySize: Number(partySize),
      reservationTime,
      notes,
    });
    setIsNewBookingOpen(false);
    setCustomerName('');
    setCustomerPhone('');
    setNotes('');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
            Table Reservations & Waitlist
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage advance table bookings, party sizes, special dining requests & waitlist queue.
          </p>
        </div>

        <Button
          onClick={() => setIsNewBookingOpen(true)}
          variant="primary"
          icon={Plus}
          className="text-xs font-bold"
        >
          New Booking
        </Button>
      </div>

      {/* Bookings List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reservations.map((res) => (
          <div
            key={res.id}
            className="bg-white dark:bg-secondary-900 rounded-3xl p-5 border border-gray-100 dark:border-secondary-800 shadow-sm flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-secondary-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-secondary-900 dark:text-white">
                    {res.customerName}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                    Confirmed
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary font-black">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{res.reservationTime}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 text-xs">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Table {res.tableNumber} • {res.partySize} Guests</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{res.customerPhone}</span>
                </div>
              </div>

              {res.notes && (
                <div className="mt-2.5 p-2 rounded-xl bg-gray-50 dark:bg-secondary-800 text-[11px] text-gray-500">
                  <span className="font-bold">Guest Note: </span>
                  {res.notes}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-secondary-800">
              <button className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition">
                Mark Seated
              </button>
              <button className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-secondary-800 hover:bg-gray-200 text-gray-500 text-xs font-bold transition">
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Booking Modal */}
      {isNewBookingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 max-w-md w-full border border-gray-100 dark:border-secondary-800 shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-secondary-900 dark:text-white">
              Add Table Reservation
            </h4>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Dr. Roy"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 98450 11223"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Assigned Table
                  </label>
                  <select
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.tableNumber}>
                        Table {t.tableNumber} ({t.section})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Party Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={partySize}
                    onChange={(e) => setPartySize(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Time Slot
                </label>
                <input
                  type="text"
                  value={reservationTime}
                  onChange={(e) => setReservationTime(e.target.value)}
                  placeholder="e.g. Today, 8:00 PM"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Special Notes (Allergies, Birthday, Seating preference)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Balcony table, anniversary celebration"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewBookingOpen(false)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 text-xs font-bold">
                  Save Reservation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

