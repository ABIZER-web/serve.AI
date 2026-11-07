import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  Bell,
  GlassWater,
  Utensils,
  FileText,
  Receipt,
  Sparkles,
  CheckCircle2,
  Brush,
  HelpCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

export const CallWaiterModal = ({ isOpen, onClose, tableNumber }) => {
  const { callWaiter, serviceRequests } = useRestaurant();
  const [selectedType, setSelectedType] = useState('water');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 8 Specific Request Types matching requirement
  const requestOptions = [
    { id: 'call_waiter', label: 'Call Waiter', icon: Bell, desc: 'Summon floor staff to table' },
    { id: 'water', label: 'Water', icon: GlassWater, desc: 'Fresh cold water refills' },
    { id: 'plates', label: 'Extra Plates', icon: Utensils, desc: 'Additional quarter plates' },
    { id: 'napkins', label: 'Napkins', icon: FileText, desc: 'Paper napkins and hand wipes' },
    { id: 'cutlery', label: 'Cutlery', icon: Utensils, desc: 'Forks, spoons & butter knives' },
    { id: 'assistance', label: 'Assistance', icon: HelpCircle, desc: 'Menu or dietary recommendations' },
    { id: 'bill', label: 'Request Bill', icon: Receipt, desc: 'Settle bill at table' },
    { id: 'cleaning', label: 'Table Cleaning', icon: Brush, desc: 'Spill cleanup / clean surface' },
  ];

  // Table's active & past service requests
  const tableRequests = serviceRequests.filter(
    (s) => s.tableNumber?.toLowerCase() === (tableNumber || 'T-05').toLowerCase()
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Check duplicate pending request
    const existingActive = tableRequests.find(
      (r) =>
        r.requestType === selectedType &&
        ['pending', 'accepted', 'in_progress'].includes(r.status)
    );

    if (existingActive) {
      setErrorMsg(`A ${existingActive.title} is already active for this table. Staff is attending.`);
      return;
    }

    callWaiter(tableNumber || 'T-05', selectedType, notes);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setNotes('');
      onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Waiter & Table Service" maxWidth="max-w-md">
      {isSuccess ? (
        <div className="py-8 text-center space-y-3 font-sans">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-bounce shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="font-display text-2xl font-bold text-secondary-900 dark:text-white">
            Request Sent to Waiter!
          </h4>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            Our floor staff has received your alert for Table {tableNumber || 'T-05'}. Attendant will arrive shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {/* Table Header Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-secondary-900 dark:text-white">
                  Table {tableNumber || 'T-05'}
                </div>
                <div className="text-[10px] text-gray-500">
                  Select service type to notify serving staff
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Staff Ready
            </span>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2 border border-amber-200">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 8 Service Request Options Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
              What do you need at Table {tableNumber}?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {requestOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSelectedType(opt.id);
                      setErrorMsg('');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary font-bold shadow-xs'
                        : 'border-gray-200 dark:border-secondary-700 hover:bg-gray-50 dark:hover:bg-secondary-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0 text-primary" />
                    <span className="text-xs truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Special Request Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 2 extra water glasses with ice"
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            />
          </div>

          <Button type="submit" size="md" className="w-full font-bold shadow-md">
            Send Alert to Waiter
          </Button>

          {/* Past Request History for Table */}
          {tableRequests.length > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-secondary-800">
              <span className="text-[11px] font-bold text-gray-400 block mb-1.5">
                Recent Service Alerts for Table {tableNumber}
              </span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {tableRequests.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-secondary-800 text-[11px] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="font-semibold text-secondary-900 dark:text-white truncate">
                        {r.title}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        r.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : r.status === 'accepted'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}
                    >
                      {r.status || 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
};
