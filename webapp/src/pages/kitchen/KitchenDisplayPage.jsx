import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { soundEffects } from '../../lib/soundEffects';
import { formatINR } from '../../utils/currency';
import {
  Clock,
  Maximize2,
  Minimize2,
  ChefHat,
  CheckCircle2,
  AlertTriangle,
  Play,
  Check,
  Flame,
  Volume2,
} from 'lucide-react';
import { AudioUnlockBanner } from '../../components/ui/AudioUnlockBanner';
import { INITIAL_KITCHEN_STATIONS } from '../../lib/mockData';

export const KitchenDisplayPage = () => {
  const { orders, startPreparing, markReady, markServed } = useRestaurant();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedStation, setSelectedStation] = useState('ALL');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Helper to determine if an order matches selected station
  const orderMatchesStation = (order) => {
    if (selectedStation === 'ALL') return true;
    return order.items?.some((item) => {
      const code = item.stationCode || (item.name.toLowerCase().includes('pizza') || item.name.toLowerCase().includes('burger') ? 'PIZZA' : item.name.toLowerCase().includes('coffee') ? 'BEVERAGES' : 'CHINESE');
      return code === selectedStation;
    });
  };

  // Filter orders by station and column
  const filteredOrders = orders.filter(orderMatchesStation);
  const newOrders = filteredOrders.filter((o) => ['pending', 'accepted'].includes(o.status));
  const preparingOrders = filteredOrders.filter((o) => o.status === 'preparing');
  const readyOrders = filteredOrders.filter((o) => o.status === 'ready');

  // Elapsed time helper
  const getElapsedMinutes = (dateString) => {
    if (!dateString) return 1;
    const diffMs = Date.now() - new Date(dateString).getTime();
    return Math.max(1, Math.floor(diffMs / 60000));
  };

  return (
    <div className="min-h-screen bg-secondary-950 text-white flex flex-col select-none font-sans">
      <AudioUnlockBanner />

      {/* KDS Header Matching UI Reference */}
      <header className="bg-secondary-900 border-b border-secondary-800 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Kitchen Display (KDS)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <div className="text-xs text-gray-400 font-semibold">Touch-Optimized Bump Screen</div>
          </div>
        </div>

        {/* Station Filter Pills */}
        <div className="hidden lg:flex items-center gap-1.5 bg-secondary-950 p-1 rounded-2xl border border-secondary-800">
          {INITIAL_KITCHEN_STATIONS.map((stn) => (
            <button
              key={stn.code}
              onClick={() => setSelectedStation(stn.code)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedStation === stn.code
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-secondary-850'
              }`}
            >
              {stn.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {/* Live Clock Matching UI Reference ("07:45 PM") */}
          <div className="flex items-center gap-2 text-xl font-mono font-black text-white bg-secondary-800/80 px-4 py-2 rounded-xl border border-secondary-700">
            <Clock className="w-5 h-5 text-primary" />
            <span>
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <button
            onClick={() => soundEffects.playNewOrderChime()}
            className="p-2 rounded-xl bg-secondary-800 hover:bg-secondary-700 text-gray-300 transition"
            title="Test Chime Sound"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-secondary-800 hover:bg-secondary-700 text-gray-300 transition"
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Station Filter Bar */}
      <div className="lg:hidden px-4 py-2 bg-secondary-900 border-b border-secondary-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {INITIAL_KITCHEN_STATIONS.map((stn) => (
          <button
            key={stn.code}
            onClick={() => setSelectedStation(stn.code)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedStation === stn.code
                ? 'bg-primary text-white shadow-sm'
                : 'text-gray-400 hover:text-white bg-secondary-800'
            }`}
          >
            {stn.name}
          </button>
        ))}
      </div>

      {/* 3 Kanban Columns Matching UI Reference */}
      <main className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
        {/* Column 1: New Orders (Blue Theme #2563EB) */}
        <div className="flex flex-col bg-secondary-900/80 rounded-3xl border border-blue-900/40 overflow-hidden shadow-xl">
          <div className="bg-blue-600 px-5 py-3.5 flex items-center justify-between text-white font-black text-sm tracking-wide uppercase">
            <span>New Orders ({newOrders.length})</span>
            <span className="w-6 h-6 rounded-full bg-white/20 text-xs flex items-center justify-center">
              {newOrders.length}
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {newOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.createdAt);
              const isOverdue = elapsed > 15;

              return (
                <div
                  key={order.id}
                  className={`bg-secondary-800 rounded-2xl p-4 border shadow-md flex flex-col justify-between ${
                    isOverdue ? 'border-2 border-red-500 animate-pulse' : 'border-blue-500/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-secondary-700">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white">
                          #{order.orderNumber} • Table {order.tableNumber}
                        </span>
                        {order.orderType === 'takeaway' && (
                          <span className="text-[10px] uppercase font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
                            Takeaway
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                        <span className={`text-xs font-mono font-bold ${isOverdue ? 'text-red-400 font-black' : 'text-blue-400'}`}>
                          {elapsed} min ago
                        </span>
                      </div>
                    </div>

                    {/* Order Line Items */}
                    <div className="py-3 space-y-2">
                      {order.items?.map((item, idx) => {
                        const stationTag = item.stationCode || (item.name.toLowerCase().includes('pizza') ? 'PIZZA' : 'BAR');
                        return (
                          <div key={idx} className="flex items-start justify-between text-sm">
                            <div className="flex items-start gap-2">
                              <span className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                                {item.quantity}x
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-white text-sm">{item.name}</span>
                                  <span className="text-[9px] uppercase px-1 py-0.2 bg-secondary-700 text-gray-300 font-mono rounded">
                                    [{stationTag}]
                                  </span>
                                </div>
                                {item.variantName && item.variantName !== 'Standard' && (
                                  <span className="text-xs text-gray-400 block">({item.variantName})</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {order.specialInstructions && (
                      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-2.5 my-2 text-xs text-amber-300">
                        <span className="font-bold">Instructions: </span>
                        "{order.specialInstructions}"
                      </div>
                    )}
                  </div>

                  {/* Bump Button */}
                  <button
                    onClick={() => {
                      soundEffects.playSuccessBeep();
                      startPreparing(order.id);
                    }}
                    className="w-full mt-3 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-extrabold text-sm tracking-wide uppercase transition shadow flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Preparation</span>
                  </button>
                </div>
              );
            })}

            {newOrders.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-xs font-semibold">
                No new pending tickets
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Preparing (Orange Theme #F97316) */}
        <div className="flex flex-col bg-secondary-900/80 rounded-3xl border border-orange-900/40 overflow-hidden shadow-xl">
          <div className="bg-primary px-5 py-3.5 flex items-center justify-between text-white font-black text-sm tracking-wide uppercase">
            <span>Preparing ({preparingOrders.length})</span>
            <span className="w-6 h-6 rounded-full bg-white/20 text-xs flex items-center justify-center">
              {preparingOrders.length}
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {preparingOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.preparingAt || order.createdAt);
              const isUrgent = elapsed >= 15;

              return (
                <div
                  key={order.id}
                  className={`bg-secondary-800 rounded-2xl p-4 border shadow-md flex flex-col justify-between ${
                    isUrgent ? 'border-2 border-red-500 animate-pulse' : 'border-primary/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-secondary-700">
                      <span className="text-lg font-black text-white">
                        #{order.orderNumber} • Table {order.tableNumber}
                      </span>
                      <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400">
                        {isUrgent && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                        <span>{elapsed} min prep</span>
                      </div>
                    </div>

                    {/* Order Line Items */}
                    <div className="py-3 space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-start justify-between text-sm">
                          <div className="flex items-start gap-2">
                            <span className="w-6 h-6 rounded-md bg-primary/20 text-primary font-extrabold flex items-center justify-center text-xs flex-shrink-0">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="font-bold text-white text-sm">{item.name}</span>
                              {item.variantName && item.variantName !== 'Standard' && (
                                <span className="text-xs text-gray-400 block">({item.variantName})</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.specialInstructions && (
                      <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-2.5 my-2 text-xs text-amber-300">
                        <span className="font-bold">Instructions: </span>
                        "{order.specialInstructions}"
                      </div>
                    )}
                  </div>

                  {/* Bump Button */}
                  <button
                    onClick={() => {
                      soundEffects.playSuccessBeep();
                      markReady(order.id);
                    }}
                    className="w-full mt-3 py-3 rounded-xl bg-primary hover:bg-primary-600 active:scale-98 text-white font-extrabold text-sm tracking-wide uppercase transition shadow flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Mark as Ready</span>
                  </button>
                </div>
              );
            })}

            {preparingOrders.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-xs font-semibold">
                Kitchen is caught up
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Ready for Serving (Green Theme #16A34A) */}
        <div className="flex flex-col bg-secondary-900/80 rounded-3xl border border-emerald-900/40 overflow-hidden shadow-xl">
          <div className="bg-emerald-600 px-5 py-3.5 flex items-center justify-between text-white font-black text-sm tracking-wide uppercase">
            <span>Ready ({readyOrders.length})</span>
            <span className="w-6 h-6 rounded-full bg-white/20 text-xs flex items-center justify-center">
              {readyOrders.length}
            </span>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {readyOrders.map((order) => {
              const elapsed = getElapsedMinutes(order.readyAt || order.createdAt);

              return (
                <div
                  key={order.id}
                  className="bg-secondary-800 rounded-2xl p-4 border border-emerald-500/40 shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-secondary-700">
                      <span className="text-lg font-black text-white">
                        #{order.orderNumber} • Table {order.tableNumber}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {elapsed} min ago
                      </span>
                    </div>

                    {/* Order Line Items */}
                    <div className="py-3 space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-xs">
                            {item.quantity}x
                          </span>
                          <span className="font-bold text-white text-sm">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bump Button to Mark Served */}
                  <button
                    onClick={() => {
                      soundEffects.playSuccessBeep();
                      markServed(order.id);
                    }}
                    className="w-full mt-3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-sm tracking-wide uppercase transition shadow flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dispatched / Served</span>
                  </button>
                </div>
              );
            })}

            {readyOrders.length === 0 && (
              <div className="text-center py-16 text-gray-500 text-xs font-semibold">
                No orders waiting for dispatch
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
