import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { localStore } from '../../lib/supabaseClient';
import { speechService } from '../../lib/speechService';
import { soundEffects } from '../../lib/soundEffects';
import { formatINR } from '../../utils/currency';
import { InvoiceModal } from '../../components/billing/InvoiceModal';
import {
  Volume2,
  Clock,
  CheckCircle,
  PlayCircle,
  CheckCheck,
  Receipt,
  PlusCircle,
  Search,
  Filter,
  UtensilsCrossed,
  Bell,
  CheckCircle2,
  GlassWater,
  FileText,
  Sparkles,
  Plus,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { AudioUnlockBanner } from '../../components/ui/AudioUnlockBanner';
import { NewOrderAlertModal } from '../../components/ui/NewOrderAlertModal';
import { FloorPlanManagement } from '../../components/table/FloorPlanManagement';

export const StaffDashboardPage = () => {
  const {
    restaurant,
    tables,
    orders,
    serviceRequests,
    resolveServiceRequest,
    updateServiceRequestStatus,
    acceptOrder,
    startPreparing,
    markReady,
    markServed,
    completeOrder,
    rejectOrder,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'preparing', 'ready', 'served', 'service_requests'
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const pendingRequests = serviceRequests.filter((s) => s.status === 'pending');

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesSearch =
      !searchQuery.trim() ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleSimulateOrder = () => {
    const tableNums = ['T-01', 'T-03', 'T-05', 'T-08', 'T-09'];
    const chosenTable = tableNums[Math.floor(Math.random() * tableNums.length)];
    const mockOrder = {
      tableNumber: chosenTable,
      tableToken: `TOKEN_FOOD_HOUSE_${chosenTable}`,
      customerName: 'Ananya Sharma',
      customerPhone: '+91 98888 22334',
      orderType: 'dine_in',
      paymentMethod: 'counter',
      specialInstructions: 'Less spicy, extra dipping sauce.',
      items: [
        { name: 'Paneer Pizza', variantName: 'Medium (9")', quantity: 1, unitPrice: 249, totalPrice: 249, stationCode: 'PIZZA' },
        { name: 'Cold Coffee', variantName: 'Standard', quantity: 2, unitPrice: 89, totalPrice: 178, stationCode: 'BEVERAGES' },
        { name: 'French Fries', variantName: 'Peri-Peri', quantity: 1, unitPrice: 100, totalPrice: 100, stationCode: 'PIZZA' },
      ],
      subtotal: 527,
      discountAmount: 0,
      taxableAmount: 527,
      cgstAmount: 13.18,
      sgstAmount: 13.18,
      grandTotal: 553,
      estimatedPrepTimeMinutes: 15,
    };
    localStore.addOrder(mockOrder);
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'danger';
      case 'accepted': return 'info';
      case 'preparing': return 'warning';
      case 'ready': return 'success';
      case 'served': return 'primary';
      case 'completed': return 'default';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-background text-secondary-900 dark:text-white pb-16 font-sans">
      {/* Audio Announcement Bar */}
      <AudioUnlockBanner />

      {/* Prominent Real-time New Order Popup */}
      <NewOrderAlertModal />

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h1 className="font-display text-3xl font-bold tracking-tight">Staff Order Management</h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live kitchen orders and guest service requests updating in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateOrder}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-600 text-white transition shadow-sm active:scale-95"
              title="Add a sample table order"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Demo Order</span>
            </button>

            <button
              onClick={() => speechService.testAnnouncement()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-secondary-800 border border-gray-200 dark:border-secondary-700 hover:bg-gray-50 transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-primary" />
              <span>Test AI Voice</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-2 border-t border-gray-100 dark:border-secondary-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'All Orders', count: orders.length },
              { id: 'floor_plan', label: 'Floor Plan', count: tables?.length || 10 },
              { id: 'pending', label: 'Pending / New', count: orders.filter((o) => o.status === 'pending').length },
              { id: 'preparing', label: 'Preparing', count: orders.filter((o) => o.status === 'preparing').length },
              { id: 'ready', label: 'Ready', count: orders.filter((o) => o.status === 'ready').length },
              { id: 'served', label: 'Served', count: orders.filter((o) => o.status === 'served').length },
              { id: 'service_requests', label: 'Waiter Calls', count: pendingRequests.length, isSpecial: true },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-secondary-900 text-white dark:bg-primary dark:text-white shadow-sm'
                      : tab.isSpecial && tab.count > 0
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      : 'bg-white dark:bg-secondary-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {tab.isSpecial && <Bell className="w-3 h-3 text-primary" />}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-white/20'
                        : tab.isSpecial && tab.count > 0
                        ? 'bg-red-500 text-white font-black'
                        : 'bg-gray-100 dark:bg-secondary-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table, order #..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        {/* VIEW 0: Floor Plan Map */}
        {activeTab === 'floor_plan' ? (
          <FloorPlanManagement />
        ) : activeTab === 'service_requests' ? (
          <div className="space-y-4">
            <div className="bg-white dark:bg-secondary-900 rounded-2xl p-4 border border-gray-100 dark:border-secondary-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-secondary-900 dark:text-white">
                  Table Assistance & Waiter Calls
                </h3>
                <p className="text-xs text-gray-400">
                  Guest requests from Table QR ordering screens. Tap "Resolve" when delivered.
                </p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {pendingRequests.length} Pending
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {serviceRequests.map((req) => {
                const isPending = req.status === 'pending';
                const isInProgress = req.status === 'in_progress' || req.status === 'accepted';
                const isCompleted = req.status === 'completed' || req.status === 'resolved';

                return (
                  <div
                    key={req.id}
                    className={`rounded-2xl p-5 border shadow-sm transition flex flex-col justify-between ${
                      isPending
                        ? 'bg-amber-50/70 dark:bg-secondary-900 border-amber-300 dark:border-amber-700 shadow-amber-500/10'
                        : isInProgress
                        ? 'bg-blue-50/70 dark:bg-secondary-900 border-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-secondary-900 border-gray-100 dark:border-secondary-800 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-secondary-800">
                        <span className="text-lg font-black text-secondary-900 dark:text-white">
                          Table {req.tableNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-500 text-white animate-pulse'
                              : isInProgress
                              ? 'bg-blue-500 text-white animate-bounce'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {isPending ? 'Pending' : isInProgress ? 'En Route' : 'Fulfilled'}
                        </span>
                      </div>

                      <div className="pt-3">
                        <div className="text-sm font-bold text-secondary-900 dark:text-white">
                          {req.title}
                        </div>
                        {req.notes && (
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 italic">
                            "{req.notes}"
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 mt-2">
                          Received: {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      {isPending && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updateServiceRequestStatus(req.id, 'in_progress')}
                            className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition"
                          >
                            <span>Acknowledge</span>
                          </button>
                          <button
                            onClick={() => resolveServiceRequest(req.id)}
                            className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Fulfilled</span>
                          </button>
                        </div>
                      )}

                      {isInProgress && (
                        <button
                          onClick={() => resolveServiceRequest(req.id)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Mark Request Fulfilled</span>
                        </button>
                      )}

                      {isCompleted && (
                        <div className="text-center text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center gap-1 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fulfilled by Floor Staff</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VIEW 2: Orders Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white dark:bg-secondary-900 rounded-2xl p-5 border transition-all shadow-sm flex flex-col justify-between ${
                  order.status === 'pending'
                    ? 'border-2 border-red-500/80 shadow-red-500/10'
                    : order.status === 'preparing'
                    ? 'border-amber-400/80'
                    : 'border-gray-100 dark:border-secondary-800'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-gray-100 dark:border-secondary-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-secondary-900 dark:text-white">
                          #{order.orderNumber}
                        </span>
                        <Badge variant={getStatusBadgeVariant(order.status)} size="sm">
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm font-extrabold text-primary mt-0.5">
                        Table {order.tableNumber} {order.orderType === 'takeaway' && '(Takeaway)'}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-secondary-900 dark:text-white">
                        {formatINR(order.grandTotal)}
                      </span>
                      <button
                        onClick={() => speechService.announceOrder(order, true)}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-primary justify-end mt-1 font-semibold"
                        title="Replay Voice Alert"
                      >
                        <Volume2 className="w-3 h-3 text-primary" />
                        <span>Replay</span>
                      </button>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="py-3 space-y-2 text-xs">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center font-medium">
                        <div className="flex items-center gap-2 text-secondary-800 dark:text-gray-200">
                          <span className="w-5 h-5 rounded bg-gray-100 dark:bg-secondary-800 text-secondary-900 dark:text-white font-bold flex items-center justify-center text-[10px]">
                            {item.quantity}x
                          </span>
                          <span>{item.name}</span>
                          {item.variantName && item.variantName !== 'Standard' && (
                            <span className="text-[10px] text-gray-400">({item.variantName})</span>
                          )}
                        </div>
                        <span className="text-gray-500 dark:text-gray-400 font-semibold">
                          {formatINR(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Special Instructions */}
                  {order.specialInstructions && (
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40 rounded-xl p-2.5 my-2 text-[11px] text-amber-900 dark:text-amber-200">
                      <span className="font-bold">Note: </span>
                      "{order.specialInstructions}"
                    </div>
                  )}
                </div>

                {/* State Transition Actions */}
                <div className="border-t border-gray-100 dark:border-secondary-800 pt-3 mt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-secondary-900 font-semibold transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Invoice</span>
                  </button>

                  <div className="flex items-center gap-1.5 ml-auto">
                    {order.status === 'pending' && (
                      <>
                        <Button onClick={() => acceptOrder(order.id)} size="sm" variant="success">
                          Accept
                        </Button>
                        <Button onClick={() => startPreparing(order.id)} size="sm" variant="primary">
                          Prepare
                        </Button>
                        <Button onClick={() => rejectOrder(order.id)} size="sm" variant="danger">
                          Reject
                        </Button>
                      </>
                    )}

                    {order.status === 'accepted' && (
                      <Button onClick={() => startPreparing(order.id)} size="sm" variant="primary">
                        Start Preparing
                      </Button>
                    )}

                    {order.status === 'preparing' && (
                      <Button onClick={() => markReady(order.id)} size="sm" variant="primary">
                        Mark Ready
                      </Button>
                    )}

                    {order.status === 'ready' && (
                      <Button onClick={() => markServed(order.id)} size="sm" variant="primary">
                        Serve to Table
                      </Button>
                    )}

                    {order.status === 'served' && (
                      <Button onClick={() => completeOrder(order.id)} size="sm" variant="outline">
                        Settle & Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="col-span-full text-center py-16 bg-white dark:bg-secondary-900 rounded-3xl border border-gray-100 dark:border-secondary-800 p-8">
                <p className="text-gray-400 font-medium text-xs">No orders in this status category.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          isOpen={Boolean(selectedInvoiceOrder)}
          onClose={() => setSelectedInvoiceOrder(null)}
          order={selectedInvoiceOrder}
          restaurant={restaurant}
        />
      )}
    </div>
  );
};
