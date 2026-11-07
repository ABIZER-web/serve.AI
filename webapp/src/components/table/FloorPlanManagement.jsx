import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import {
  Users,
  Receipt,
  ArrowRightLeft,
  Merge,
  XCircle,
  Clock,
  Sparkles,
  Bell,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UserCheck,
} from 'lucide-react';

export const FloorPlanManagement = () => {
  const {
    restaurant,
    tables,
    tableSessions,
    serviceRequests,
    reservations,
    transferTableSession,
    mergeTableSessions,
    closeTableSession,
  } = useRestaurant();

  const [selectedTable, setSelectedTable] = useState(null);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [targetTableNum, setTargetTableNum] = useState('');
  const [activeSectionFilter, setActiveSectionFilter] = useState('All');

  const sections = ['All', ...new Set(tables.map((t) => t.section || 'Main Dining'))];

  const filteredTables = tables.filter((t) => {
    return activeSectionFilter === 'All' || (t.section || 'Main Dining') === activeSectionFilter;
  });

  // Calculate live table status
  const getTableStatus = (table) => {
    const session = tableSessions[table.tableNumber];
    const hasServiceRequest = serviceRequests.some(
      (s) => s.tableNumber === table.tableNumber && ['pending', 'accepted'].includes(s.status)
    );
    const hasReservation = reservations.some(
      (r) => r.tableNumber === table.tableNumber && r.status === 'confirmed'
    );

    if (hasServiceRequest) return { code: 'awaiting_service', label: 'Call Waiter', color: 'bg-amber-500 text-white animate-pulse' };
    if (session && session.status === 'settled') return { code: 'bill_pending', label: 'Bill Settled', color: 'bg-blue-600 text-white' };
    if (session && session.totalBill > 0 && session.remainingBalance > 0) return { code: 'occupied', label: 'Dining', color: 'bg-emerald-600 text-white' };
    if (table.isOccupied || session) return { code: 'occupied', label: 'Occupied', color: 'bg-emerald-600 text-white' };
    if (hasReservation) return { code: 'reserved', label: 'Reserved', color: 'bg-purple-600 text-white' };
    return { code: 'available', label: 'Available', color: 'bg-gray-100 dark:bg-secondary-800 text-gray-700 dark:text-gray-300' };
  };

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!selectedTable || !targetTableNum) return;
    transferTableSession(selectedTable.tableNumber, targetTableNum);
    setTransferModalOpen(false);
    setSelectedTable(null);
    setTargetTableNum('');
  };

  const handleMerge = (e) => {
    e.preventDefault();
    if (!selectedTable || !targetTableNum) return;
    mergeTableSessions(selectedTable.tableNumber, targetTableNum);
    setMergeModalOpen(false);
    setSelectedTable(null);
    setTargetTableNum('');
  };

  const handleCloseSession = (tableNumber) => {
    if (window.confirm(`Close and settle active session for Table ${tableNumber}? This will mark all orders completed and clear the table.`)) {
      closeTableSession(tableNumber);
      setSelectedTable(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Floor Plan Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-secondary-900 p-4 rounded-3xl border border-gray-100 dark:border-secondary-800 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-secondary-900 dark:text-white">
            Live Restaurant Floor Map
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time status of all dining tables, active sessions, and floor staff service calls.
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-secondary-800 text-gray-700 dark:text-gray-300">
            <span className="w-2 h-2 rounded-full bg-gray-400" /> Available
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Occupied / Dining
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Needs Service
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Reserved
          </span>
        </div>
      </div>

      {/* Section Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {sections.map((sec) => (
          <button
            key={sec}
            onClick={() => setActiveSectionFilter(sec)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition whitespace-nowrap shadow-xs ${
              activeSectionFilter === sec
                ? 'bg-primary text-white shadow-primary/20 scale-[1.02]'
                : 'bg-white dark:bg-secondary-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-secondary-800 hover:bg-gray-50'
            }`}
          >
            {sec} ({sec === 'All' ? tables.length : tables.filter((t) => (t.section || 'Main Dining') === sec).length})
          </button>
        ))}
      </div>

      {/* Visual Floor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredTables.map((table) => {
          const status = getTableStatus(table);
          const session = tableSessions[table.tableNumber];
          const hasActiveOrders = session?.submittedRounds?.length > 0;

          return (
            <div
              key={table.id}
              onClick={() => setSelectedTable(table)}
              className={`cursor-pointer rounded-3xl p-5 border transition-all relative overflow-hidden bg-white dark:bg-secondary-900 flex flex-col justify-between hover:shadow-lg active:scale-98 ${
                status.code === 'awaiting_service'
                  ? 'border-amber-400 ring-2 ring-amber-400/30'
                  : status.code === 'occupied'
                  ? 'border-emerald-500/60 shadow-emerald-500/5'
                  : 'border-gray-200 dark:border-secondary-800'
              }`}
            >
              {/* Card Top: Table Number & Status Pill */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-secondary-800">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-black text-xl text-secondary-900 dark:text-white">
                      {table.tableNumber}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      ({table.capacity}p)
                    </span>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Section & Active Waiter */}
                <div className="py-2.5 space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Section:</span>
                    <span className="font-semibold text-secondary-800 dark:text-gray-200">{table.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waiter:</span>
                    <span className="font-semibold text-secondary-800 dark:text-gray-200">
                      {session?.assignedWaiter || 'Arjun Singh'}
                    </span>
                  </div>
                </div>

                {/* Live Session Metrics */}
                {session ? (
                  <div className="p-3 bg-gray-50 dark:bg-secondary-800/60 rounded-2xl border border-gray-100 dark:border-secondary-700 space-y-1.5 my-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Guests ({session.activeGuests?.length || 1}):</span>
                      <div className="flex items-center -space-x-1">
                        {session.activeGuests?.map((g) => (
                          <span
                            key={g.id || g.name}
                            className="w-5 h-5 rounded-full bg-white dark:bg-secondary-700 text-[10px] flex items-center justify-center border shadow-xs"
                          >
                            {g.avatar || '👤'}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between text-xs pt-1 border-t border-gray-200/50 dark:border-secondary-700 font-bold">
                      <span>Total Bill:</span>
                      <span className="text-primary font-black">{formatINR(session.totalBill || 0)}</span>
                    </div>

                    {session.remainingBalance > 0 && session.paidAmount > 0 && (
                      <div className="text-[10px] text-amber-600 font-semibold text-right">
                        Remaining: {formatINR(session.remainingBalance)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-gray-400 border border-dashed border-gray-200 dark:border-secondary-800 rounded-2xl my-1">
                    Table is vacant
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-secondary-800 flex items-center justify-between text-xs">
                <span className="text-primary font-bold hover:underline flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Manage
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">
                  {table.capacity} Seats
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Table Inspection & Actions Modal */}
      {selectedTable && (
        <Modal
          isOpen={Boolean(selectedTable)}
          onClose={() => setSelectedTable(null)}
          title={`Table Operations: ${selectedTable.tableNumber}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 font-sans text-secondary-900 dark:text-white">
            {/* Header Status Card */}
            <div className="p-4 bg-gray-50 dark:bg-secondary-800 rounded-2xl border border-gray-200 dark:border-secondary-700 flex justify-between items-center">
              <div>
                <h3 className="font-display font-black text-2xl text-secondary-900 dark:text-white">
                  Table {selectedTable.tableNumber}
                </h3>
                <span className="text-xs text-gray-500 font-semibold">
                  {selectedTable.section} • Capacity: {selectedTable.capacity} Guests
                </span>
              </div>
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${getTableStatus(selectedTable).color}`}>
                {getTableStatus(selectedTable).label}
              </span>
            </div>

            {/* Session Details */}
            {tableSessions[selectedTable.tableNumber] ? (
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-secondary-800/80 rounded-2xl border border-gray-200 dark:border-secondary-700 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assigned Waiter:</span>
                    <span className="font-bold">{tableSessions[selectedTable.tableNumber].assignedWaiter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Connected Guests:</span>
                    <span className="font-bold">
                      {tableSessions[selectedTable.tableNumber].activeGuests?.map((g) => `${g.avatar} ${g.name}`).join(', ') || 'Diners'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cumulative Bill:</span>
                    <span className="font-bold text-primary">{formatINR(tableSessions[selectedTable.tableNumber].totalBill)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid:</span>
                    <span className="font-bold text-emerald-600">{formatINR(tableSessions[selectedTable.tableNumber].paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1 border-t">
                    <span>Remaining Balance:</span>
                    <span className="text-primary font-black">{formatINR(tableSessions[selectedTable.tableNumber].remainingBalance)}</span>
                  </div>
                </div>

                {/* Action Buttons: Transfer, Merge, Settle */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => setTransferModalOpen(true)}
                    className="p-3 rounded-2xl bg-gray-100 dark:bg-secondary-800 hover:bg-gray-200 text-secondary-900 dark:text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-primary" />
                    <span>Transfer</span>
                  </button>
                  <button
                    onClick={() => setMergeModalOpen(true)}
                    className="p-3 rounded-2xl bg-gray-100 dark:bg-secondary-800 hover:bg-gray-200 text-secondary-900 dark:text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Merge className="w-4 h-4 text-purple-600" />
                    <span>Merge</span>
                  </button>
                  <button
                    onClick={() => handleCloseSession(selectedTable.tableNumber)}
                    className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Close Table</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-xs">
                No active session on this table.
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Transfer Table Modal */}
      {transferModalOpen && (
        <Modal
          isOpen={transferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          title={`Transfer Session from ${selectedTable?.tableNumber}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleTransfer} className="space-y-4 font-sans text-xs">
            <p className="text-gray-500">
              Select the vacant target table. All guests, orders, and shared bills will be safely moved.
            </p>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Destination Table
              </label>
              <select
                required
                value={targetTableNum}
                onChange={(e) => setTargetTableNum(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Choose Target Table --</option>
                {tables
                  .filter((t) => t.tableNumber !== selectedTable?.tableNumber && !t.isOccupied)
                  .map((t) => (
                    <option key={t.id} value={t.tableNumber}>
                      {t.tableNumber} ({t.section} • {t.capacity} Guests)
                    </option>
                  ))}
              </select>
            </div>

            <Button type="submit" size="md" className="w-full font-bold">
              Execute Table Transfer
            </Button>
          </form>
        </Modal>
      )}

      {/* Merge Tables Modal */}
      {mergeModalOpen && (
        <Modal
          isOpen={mergeModalOpen}
          onClose={() => setMergeModalOpen(false)}
          title={`Merge Table ${selectedTable?.tableNumber} into Another`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleMerge} className="space-y-4 font-sans text-xs">
            <p className="text-gray-500">
              Select the table to merge with. Their guests, orders, and bills will combine into one joint session.
            </p>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Secondary Table to Merge
              </label>
              <select
                required
                value={targetTableNum}
                onChange={(e) => setTargetTableNum(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">-- Choose Other Table --</option>
                {tables
                  .filter((t) => t.tableNumber !== selectedTable?.tableNumber)
                  .map((t) => (
                    <option key={t.id} value={t.tableNumber}>
                      {t.tableNumber} ({t.section}) {t.isOccupied ? '• Occupied' : '• Vacant'}
                    </option>
                  ))}
              </select>
            </div>

            <Button type="submit" size="md" className="w-full font-bold">
              Merge Tables & Combine Bills
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
};

