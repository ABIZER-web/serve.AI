import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  QrCode,
  Plus,
  RefreshCw,
  Printer,
  Download,
  Eye,
  ExternalLink,
  Smartphone,
  Radio,
  ArrowRightLeft,
  Users,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { TableTransferMergeModal } from '../../components/tables/TableTransferMergeModal';
import { NfcProgrammingModal } from '../../components/tables/NfcProgrammingModal';
import { NfcSetupGuideModal } from '../../components/table/NfcSetupGuideModal';
import { FloorPlanManagement } from '../../components/table/FloorPlanManagement';
import { formatINR } from '../../utils/currency';

export const TableManagement = () => {
  const { restaurant, setRestaurant, tables, tableSessions, addTable, updateTable, regenerateTableQR } = useRestaurant();
  const [activeTab, setActiveTab] = useState('floor_plan'); // 'floor_plan' | 'stands'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQRTable, setSelectedQRTable] = useState(null);
  const [selectedNfcTable, setSelectedNfcTable] = useState(null);
  const [isNfcGuideOpen, setIsNfcGuideOpen] = useState(false);
  const [transferModalSource, setTransferModalSource] = useState(null);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [tableNumber, setTableNumber] = useState('');
  const [section, setSection] = useState('Main Dining');
  const [capacity, setCapacity] = useState(4);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;
    addTable(tableNumber.trim(), section, Number(capacity) || 4);
    setIsAddModalOpen(false);
    setTableNumber('');
  };

  const filteredTables = tables.filter((t) => {
    const session = tableSessions[t.tableNumber];
    const effectiveStatus = session?.status || (t.isOccupied ? 'occupied' : 'available');
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'occupied') return effectiveStatus === 'occupied' || t.isOccupied;
    if (statusFilter === 'available') return effectiveStatus === 'available' && !t.isOccupied;
    if (statusFilter === 'awaiting_service') return effectiveStatus === 'awaiting_service';
    if (statusFilter === 'bill_pending') return effectiveStatus === 'bill_pending';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-secondary-900 dark:text-white">
            Table & Smart QR Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage your dining tables, print branded QR acrylic stands, and configure tap-to-order NFC tags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* NFC Guide Button */}
          <Button
            onClick={() => setIsNfcGuideOpen(true)}
            variant="outline"
            icon={Radio}
            size="sm"
          >
            NFC Setup Guide
          </Button>

          {/* Self-Seating Toggle Banner Pill */}
          <button
            onClick={() => {
              const current = restaurant.selfSeatingEnabled !== false;
              setRestaurant({ ...restaurant, selfSeatingEnabled: !current });
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              restaurant.selfSeatingEnabled !== false
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200'
                : 'bg-gray-100 dark:bg-secondary-800 text-gray-500 border-gray-200'
            }`}
            title="Toggle customer self-seating portal"
          >
            <span className={`w-2 h-2 rounded-full ${restaurant.selfSeatingEnabled !== false ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            <span>Self-Seating: {restaurant.selfSeatingEnabled !== false ? 'Enabled' : 'Disabled'}</span>
          </button>

          <Button onClick={() => setIsBatchPrintOpen(true)} variant="outline" icon={Printer} size="sm">
            Print Stands (A4)
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)} icon={Plus} size="sm">
            Add New Table
          </Button>
        </div>
      </div>

      {/* View Switcher: Interactive Floor Plan vs Individual Stands */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-secondary-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('floor_plan')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'floor_plan'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white dark:bg-secondary-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 border'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Visual Floor Plan & Live Sessions</span>
          </button>
          <button
            onClick={() => setActiveTab('stands')}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 ${
              activeTab === 'stands'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white dark:bg-secondary-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 border'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Table Cards & QR Stands</span>
          </button>
        </div>

        {restaurant.selfSeatingEnabled !== false && (
          <a
            href={`/r/${restaurant.slug}/seating`}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Customer Seating Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {activeTab === 'floor_plan' ? (
        <FloorPlanManagement />
      ) : (
        <>
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
            {[
              { id: 'ALL', label: 'All Tables', count: tables.length },
              { id: 'occupied', label: 'Occupied', count: tables.filter((t) => t.isOccupied || tableSessions[t.tableNumber]?.status === 'occupied').length },
              { id: 'available', label: 'Vacant', count: tables.filter((t) => !t.isOccupied && tableSessions[t.tableNumber]?.status !== 'occupied').length },
              { id: 'awaiting_service', label: 'Awaiting Service', count: tables.filter((t) => tableSessions[t.tableNumber]?.status === 'awaiting_service').length },
              { id: 'bill_pending', label: 'Bill Pending', count: tables.filter((t) => tableSessions[t.tableNumber]?.status === 'bill_pending').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-secondary-900 text-white dark:bg-primary shadow-xs'
                    : 'bg-white dark:bg-secondary-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-secondary-800 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] bg-black/10 dark:bg-white/20 px-1.5 py-0.2 rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

      {/* Visual Floor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {filteredTables.map((table) => {
          const session = tableSessions[table.tableNumber];
          const isOcc = table.isOccupied || session?.status === 'occupied';
          const isAwaiting = session?.status === 'awaiting_service';
          const isBillPending = session?.status === 'bill_pending';

          const activeGuestCount = session?.activeGuests?.length || (isOcc ? 2 : 0);
          const runningBill = session?.submittedRounds?.reduce((acc, r) => acc + (r.subtotal || 0), 0) || (isOcc ? 687 : 0);
          const waiterName = session?.assignedWaiter || 'Arjun Singh';

          return (
            <div
              key={table.id}
              className={`bg-white dark:bg-secondary-900 rounded-2xl p-4 border transition shadow-sm flex flex-col justify-between ${
                isAwaiting
                  ? 'border-amber-400 bg-amber-50/20 shadow-amber-500/10'
                  : isBillPending
                  ? 'border-orange-400 bg-orange-50/20'
                  : isOcc
                  ? 'border-emerald-500/80 shadow-emerald-500/10'
                  : 'border-gray-100 dark:border-secondary-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-secondary-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isAwaiting
                          ? 'bg-amber-500 animate-bounce'
                          : isBillPending
                          ? 'bg-orange-500 animate-pulse'
                          : isOcc
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-gray-300 dark:bg-secondary-700'
                      }`}
                    />
                    <span className="font-black text-base text-secondary-900 dark:text-white">
                      {table.tableNumber}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isAwaiting
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : isBillPending
                        ? 'bg-orange-100 text-orange-800 border border-orange-300'
                        : isOcc
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-secondary-800 dark:text-gray-400'
                    }`}
                  >
                    {isAwaiting ? 'WAIT CALL' : isBillPending ? 'BILL REQ' : isOcc ? 'OCCUPIED' : 'VACANT'}
                  </span>
                </div>

                <div className="py-2.5 space-y-1 text-[11px] text-gray-500">
                  <div className="flex justify-between">
                    <span>Section:</span>
                    <span className="font-semibold text-secondary-800 dark:text-gray-200">{table.section}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-semibold text-secondary-800 dark:text-gray-200">{table.capacity} Guests</span>
                  </div>

                  {isOcc && (
                    <div className="pt-1.5 border-t border-dashed border-gray-200 dark:border-secondary-800 space-y-1">
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>Diners:</span>
                        </span>
                        <span>{activeGuestCount} Connected</span>
                      </div>
                      <div className="flex justify-between font-bold text-secondary-900 dark:text-white">
                        <span>Running Bill:</span>
                        <span className="text-primary">{formatINR(runningBill)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>Staff:</span>
                        <span>{waiterName}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* QR Preview Thumbnail */}
                <div className="bg-gray-50 dark:bg-secondary-800 p-2 rounded-xl text-center my-1 border border-gray-100 dark:border-secondary-700">
                  <img
                    src={table.qrUrl}
                    alt={`QR for ${table.tableNumber}`}
                    className="w-20 h-20 mx-auto rounded-lg border bg-white p-1"
                  />
                  <div className="text-[9px] text-gray-500 font-bold mt-1 tracking-wide">
                    Tap NFC or Scan QR
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 dark:border-secondary-800 space-y-1.5 text-[11px]">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSelectedQRTable(table)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-gray-100 dark:bg-secondary-800 hover:bg-gray-200 text-secondary-900 dark:text-white font-bold transition"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Stand</span>
                  </button>

                  <button
                    onClick={() => setSelectedNfcTable(table)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-bold transition"
                    title="Setup Physical NFC Chip"
                  >
                    <Radio className="w-3 h-3" />
                    <span>NFC</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setTransferModalSource(table.tableNumber)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-bold transition"
                    title="Transfer or Merge this table"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Move</span>
                  </button>

                  <button
                    onClick={() => regenerateTableQR(table.id)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-secondary-800 text-gray-500 hover:bg-gray-100 font-bold transition"
                    title="Regenerate Token"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

      {/* NFC Comprehensive Owner Guide Modal */}
      <NfcSetupGuideModal
        isOpen={isNfcGuideOpen}
        onClose={() => setIsNfcGuideOpen(false)}
        restaurant={restaurant}
        tables={tables}
      />

      {/* Add Table Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create New Dining Table" maxWidth="max-w-md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Table Number / ID *
            </label>
            <input
              type="text"
              required
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. T-11 or Table 11"
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Dining Section
            </label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="Main Dining / Balcony / Rooftop"
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Seating Capacity (Guests)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <Button type="submit" size="md" className="w-full font-bold">
            Generate Table & QR Token
          </Button>
        </form>
      </Modal>

      {/* NFC Setup Modal */}
      <NfcProgrammingModal
        isOpen={Boolean(selectedNfcTable)}
        onClose={() => setSelectedNfcTable(null)}
        table={selectedNfcTable}
      />

      {/* Transfer / Merge Modal */}
      <TableTransferMergeModal
        isOpen={Boolean(transferModalSource)}
        onClose={() => setTransferModalSource(null)}
        sourceTableNumber={transferModalSource}
      />

      {/* High-Resolution Printable Table Stand Modal */}
      {selectedQRTable && (
        <Modal
          isOpen={Boolean(selectedQRTable)}
          onClose={() => setSelectedQRTable(null)}
          title={`Printable Table Stand: ${selectedQRTable.tableNumber}`}
          maxWidth="max-w-md"
        >
          <div>
            {/* The Physical Table Stand Card (matches high-res restaurant acrylic tent) */}
            <div
              id="printable-table-stand"
              className="bg-white text-secondary-900 border-2 border-primary/40 rounded-3xl p-8 text-center shadow-lg font-sans"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary text-white mx-auto flex items-center justify-center shadow-md mb-2">
                <QrCode className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-secondary-900 tracking-tight">
                {restaurant.name}
              </h2>
              <div className="text-xs font-bold text-primary tracking-widest uppercase mt-0.5">
                Scan for Menu & Direct Ordering
              </div>

              {/* QR Image */}
              <div className="my-6 p-3 bg-gray-50 rounded-2xl border-2 border-dashed border-primary/30 inline-block shadow-inner">
                <img
                  src={selectedQRTable.qrUrl}
                  alt={`QR ${selectedQRTable.tableNumber}`}
                  className="w-48 h-48 mx-auto rounded-xl"
                />
              </div>

              <div className="text-xl font-black text-secondary-900">
                TABLE {selectedQRTable.tableNumber}
              </div>
              <p className="text-xs text-gray-500 max-w-[220px] mx-auto mt-1 leading-relaxed">
                Scan with any smartphone camera or Google Lens to browse menu and order seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button onClick={handlePrintQR} variant="primary" size="sm" icon={Printer}>
                Print Acrylic Stand
              </Button>
              <a
                href={selectedQRTable.qrUrl}
                download={`${selectedQRTable.tableNumber}-qr.png`}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button variant="outline" size="sm" icon={Download} className="w-full">
                  Download PNG
                </Button>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Batch All Table Stands Printable Sheet Modal */}
      {isBatchPrintOpen && (
        <Modal
          isOpen={isBatchPrintOpen}
          onClose={() => setIsBatchPrintOpen(false)}
          title="Print All Dining Table QR Stands (Batch)"
          maxWidth="max-w-4xl"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-gray-500 font-sans">
                Formatted for standard A4 acrylic table tents. Print on heavy cardstock or photo paper.
              </p>
              <Button onClick={handlePrintQR} variant="primary" size="sm" icon={Printer}>
                Print All ({tables.length} Stands)
              </Button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-4 bg-gray-100 rounded-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tables.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center flex flex-col items-center justify-between shadow-sm"
                  >
                    <div>
                      <div className="text-[10px] font-sans font-bold tracking-widest uppercase text-primary mb-1">
                        {restaurant.name}
                      </div>
                      <div className="font-display font-black text-xl text-secondary-900">
                        TABLE {t.tableNumber}
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 font-sans">
                        Scan with Phone Camera to Order & Pay
                      </div>
                    </div>

                    <img
                      src={t.qrUrl}
                      alt={`QR ${t.tableNumber}`}
                      className="w-36 h-36 my-3 rounded-lg border p-1"
                    />

                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Tap NFC • Scan QR • Order & Pay
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

