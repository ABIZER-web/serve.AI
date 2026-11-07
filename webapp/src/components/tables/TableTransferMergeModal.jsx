import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRestaurant } from '../../context/RestaurantContext';
import { ArrowRightLeft, Merge, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const TableTransferMergeModal = ({ isOpen, onClose, sourceTableNumber }) => {
  const { tables, tableSessions, transferTableSession, mergeTableSessions } = useRestaurant();
  const [mode, setMode] = useState('transfer'); // 'transfer' | 'merge'
  const [targetTable, setTargetTable] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const currentSource = sourceTableNumber || 'T-05';
  const availableTargetTables = tables.filter((t) => t.tableNumber !== currentSource);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!targetTable) return;

    if (mode === 'transfer') {
      transferTableSession(currentSource, targetTable);
      setSuccessMessage(`Successfully transferred all active orders & cart from Table ${currentSource} to Table ${targetTable}.`);
    } else {
      mergeTableSessions(currentSource, targetTable);
      setSuccessMessage(`Successfully merged Table ${currentSource} into Table ${targetTable}. Combined orders and shared cart are now unified.`);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'transfer' ? 'Transfer Table Orders' : 'Merge Two Tables'}
      maxWidth="max-w-md"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-3 font-sans">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mx-auto flex items-center justify-center animate-bounce shadow">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-display text-xl font-bold text-secondary-900 dark:text-white">
            Table Operation Complete!
          </h4>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {successMessage}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
          {/* Mode Switcher */}
          <div className="bg-gray-100 dark:bg-secondary-800 p-1 rounded-xl flex items-center">
            <button
              type="button"
              onClick={() => setMode('transfer')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                mode === 'transfer'
                  ? 'bg-white dark:bg-secondary-900 text-primary shadow-xs'
                  : 'text-gray-500 hover:text-secondary-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Transfer Table</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('merge')}
              className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                mode === 'merge'
                  ? 'bg-white dark:bg-secondary-900 text-primary shadow-xs'
                  : 'text-gray-500 hover:text-secondary-900'
              }`}
            >
              <Merge className="w-3.5 h-3.5" />
              <span>Merge Tables</span>
            </button>
          </div>

          {/* Description */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-amber-900 dark:text-amber-200">
            {mode === 'transfer' ? (
              <p>
                Move a seated guest or party from <strong>Table {currentSource}</strong> to another table (e.g. moving outdoors or to a larger booth). All existing orders, shared cart items, and billing follow automatically.
              </p>
            ) : (
              <p>
                Combine <strong>Table {currentSource}</strong> with an adjacent table for large groups. Items from both tables will be combined into a single unified bill.
              </p>
            )}
          </div>

          {/* Source & Target Selector */}
          <div className="space-y-3">
            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Source Table (Current)
              </label>
              <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-secondary-800 font-bold text-secondary-900 dark:text-white">
                Table {currentSource}
              </div>
            </div>

            <div>
              <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                {mode === 'transfer' ? 'Destination Table' : 'Merge With Table'}
              </label>
              <select
                value={targetTable}
                onChange={(e) => setTargetTable(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              >
                <option value="">Select Target Table...</option>
                {availableTargetTables.map((t) => (
                  <option key={t.id} value={t.tableNumber}>
                    Table {t.tableNumber} ({t.section} • {t.capacity} seats • {t.isOccupied ? 'Occupied' : 'Vacant'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!targetTable}
              icon={mode === 'transfer' ? ArrowRightLeft : Merge}
            >
              {mode === 'transfer' ? 'Confirm Transfer' : 'Confirm Merge'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
