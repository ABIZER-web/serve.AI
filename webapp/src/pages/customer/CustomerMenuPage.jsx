import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import { localStore } from '../../lib/supabaseClient';
import { FoodCard } from '../../components/menu/FoodCard';
import { CustomisationModal } from '../../components/menu/CustomisationModal';
import { SharedCartDrawer } from '../../components/table/SharedCartDrawer';
import { SharedTableBillModal } from '../../components/table/SharedTableBillModal';
import { DigitalGuestPortalModal } from '../../components/table/DigitalGuestPortalModal';
import { CallWaiterModal } from '../../components/menu/CallWaiterModal';
import { GuestJoinModal } from '../../components/table/GuestJoinModal';
import { AIChefAssistant } from '../../components/menu/AIChefAssistant';
import {
  Search,
  ShoppingBag,
  UtensilsCrossed,
  Bell,
  Sparkles,
  Utensils,
  Flame,
  CheckCircle2,
  Receipt,
  Users,
  Wifi,
  Gift,
  ShieldAlert,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { Button } from '../../components/ui/Button';

export const CustomerMenuPage = () => {
  const { restaurantSlug, tableNumber } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const source = searchParams.get('source'); // 'qr' or 'nfc'
  const navigate = useNavigate();

  const {
    restaurant,
    categories,
    menuItems,
    tables,
    serviceRequests,
    tableSessions,
    joinTableSession,
    addSharedCartItem,
  } = useRestaurant();

  const currentTableNum = tableNumber || 'T-05';
  const activeTable = tables.find(
    (t) => t.tableNumber?.toLowerCase() === currentTableNum.toLowerCase()
  );

  // Validate security token
  const tokenValidation = useMemo(() => {
    return localStore.validateTableToken(restaurantSlug, currentTableNum, token);
  }, [restaurantSlug, currentTableNum, token, tables, tableSessions]);

  // Guest Nickname & Avatar State
  const [currentGuestName, setCurrentGuestName] = useState(() => {
    try {
      return sessionStorage.getItem(`serveai_guest_${currentTableNum}`) || '';
    } catch {
      return '';
    }
  });

  const [currentGuestAvatar, setCurrentGuestAvatar] = useState(() => {
    try {
      return sessionStorage.getItem(`serveai_avatar_${currentTableNum}`) || '👤';
    } catch {
      return '👤';
    }
  });

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customiseItem, setCustomiseItem] = useState(null);
  const [mobileCartDrawerOpen, setMobileCartDrawerOpen] = useState(false);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);

  // Auto-prompt join modal if guest name not yet set
  useEffect(() => {
    if (tokenValidation.valid && !currentGuestName) {
      setIsJoinModalOpen(true);
    } else if (tokenValidation.valid && currentGuestName) {
      // Ensure registered in table session
      joinTableSession(currentTableNum, token, currentGuestName, currentGuestAvatar);
    }
  }, [tokenValidation.valid, currentGuestName, currentTableNum, token]);

  const handleGuestJoin = (name, avatar) => {
    setCurrentGuestName(name);
    setCurrentGuestAvatar(avatar);
    try {
      sessionStorage.setItem(`serveai_guest_${currentTableNum}`, name);
      sessionStorage.setItem(`serveai_avatar_${currentTableNum}`, avatar);
    } catch (e) {}
    joinTableSession(currentTableNum, token, name, avatar);
  };

  const session = tableSessions[currentTableNum] || {
    tableNumber: currentTableNum,
    activeGuests: [],
    sharedCart: [],
    submittedRounds: [],
    totalBill: 0,
    paidAmount: 0,
    remainingBalance: 0,
  };

  const sharedCart = session.sharedCart || [];
  const sharedCartCount = sharedCart.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const activeGuests = session.activeGuests || [];

  // Check if there is an active pending service request for this table
  const activeRequest = serviceRequests.find(
    (sr) =>
      sr.tableNumber?.toLowerCase() === currentTableNum.toLowerCase() &&
      ['pending', 'accepted'].includes(sr.status)
  );

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        item.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === 'Pizza' && item.name.toLowerCase().includes('pizza')) ||
        (selectedCategory === 'Burgers' && item.name.toLowerCase().includes('burger')) ||
        (selectedCategory === 'Beverages' && item.categoryName === 'Beverages');

      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Handle unauthorized table access
  if (!tokenValidation.valid) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-secondary-950 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white dark:bg-secondary-900 rounded-3xl p-6 sm:p-8 text-center border border-red-200 dark:border-red-900 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center shadow-md animate-bounce">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-display font-black text-2xl text-secondary-900 dark:text-white">
              Unauthorized Table Access
            </h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {tokenValidation.reason || 'This table session requires a valid cryptographic token to prevent table spoofing.'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-secondary-800 rounded-2xl border text-xs text-gray-600 dark:text-gray-300 space-y-1 text-left">
            <div className="font-bold text-secondary-900 dark:text-white">To order food safely:</div>
            <div>• Scan the physical QR code sticker placed on your table stand.</div>
            <div>• Tap your smartphone on the table's NFC tag sticker.</div>
            <div>• Or choose an empty dining table using customer self-seating.</div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {restaurant.selfSeatingEnabled !== false && (
              <Button
                onClick={() => navigate(`/r/${restaurant.slug || restaurantSlug}/seating`)}
                size="md"
                className="w-full font-bold shadow-md"
              >
                Select an Available Table (Self-Seating)
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
            >
              Return to Restaurant Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-secondary-900 dark:text-white pb-24 lg:pb-12 font-sans relative">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-secondary-900/95 backdrop-blur-md border-b border-gray-100 dark:border-secondary-800 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Restaurant Brand & NFC/QR indicator */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight leading-none block">
                {restaurant.name || 'Cafe Highfive'}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] font-sans font-bold tracking-widest uppercase text-primary">
                  Smart Table Experience
                </span>
                {source === 'nfc' && (
                  <span className="text-[9px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded-md font-bold flex items-center gap-0.5">
                    <Radio className="w-2.5 h-2.5" /> NFC Tap
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Guest Portal Hub Button */}
            <button
              onClick={() => setIsPortalModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-xs"
              title="Guest Portal (Wi-Fi, Games, Spin Wheel)"
            >
              <Gift className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">Guest Hub</span>
            </button>

            {/* Call Waiter Quick Action Button */}
            <button
              onClick={() => setIsCallWaiterOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 font-bold text-xs flex items-center gap-1 transition active:scale-95 shadow-xs"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce text-primary" />
              <span>Call Waiter</span>
            </button>

            {/* Table Bill Settlement Button */}
            <button
              onClick={() => setIsBillModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs flex items-center gap-1 transition active:scale-95 border border-primary/20 shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bill</span>
            </button>

            {/* Table Number & Guests Pill */}
            <div
              onClick={() => setIsJoinModalOpen(true)}
              className="cursor-pointer bg-gray-100 dark:bg-secondary-800 text-secondary-900 dark:text-white font-bold text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-secondary-700 shadow-sm flex items-center gap-1.5"
              title="Click to edit your nickname"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{activeTable?.tableNumber || currentTableNum}</span>
              {currentGuestAvatar && <span>{currentGuestAvatar}</span>}
            </div>

            {/* Cart Button (Trigger for mobile) */}
            <button
              onClick={() => setMobileCartDrawerOpen(true)}
              className="relative p-2 rounded-full bg-gray-100 dark:bg-secondary-800 text-secondary-800 dark:text-gray-200 lg:hidden"
            >
              <ShoppingBag className="w-5 h-5" />
              {sharedCartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow">
                  {sharedCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Active Service Request Toast / Banner */}
      {activeRequest && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 animate-spin" />
              <span>
                <strong>Waiter Alert:</strong> {activeRequest.title} requested for Table {currentTableNum}. Staff is attending.
              </span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase font-bold">
              {activeRequest.status || 'Pending'}
            </span>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Menu Column (Left) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Live Shared Table Bar */}
            <div className="bg-gradient-to-r from-amber-500/10 via-primary/10 to-orange-500/10 border border-primary/30 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-secondary-900 dark:text-white flex items-center gap-1.5">
                    <span>Shared Table: Table {currentTableNum}</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.2 rounded-md">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">
                    You: <strong>{currentGuestAvatar} {currentGuestName || 'Diner'}</strong> • {activeGuests.length} connected
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPortalModalOpen(true)}
                  className="hidden sm:flex items-center gap-1 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl border border-purple-200 transition"
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Wi-Fi & Games</span>
                </button>
              </div>
            </div>

            {/* Welcome Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-primary to-orange-500 p-6 sm:p-8 text-white shadow-lg">
              <div className="relative z-10 max-w-md">
                <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-white/80 block mb-1">
                  DISCOVER ARTISAN FLAVOURS
                </span>
                <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight">
                  Welcome to <span className="font-bold">{restaurant.name || 'Cafe Highfive'}</span>
                </h1>
                <p className="font-display italic text-white/90 text-sm mt-1.5 font-normal">
                  Add food from your phone. Watch your table's live cart sync in real-time.
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative font-sans">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food, coffee, ingredients..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 text-xs sm:text-sm text-secondary-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth font-sans">
              {['All', 'Specialty Coffee', 'Boba & Coolers', 'Artisan Burgers', 'Gourmet Toasts', 'Waffles & Bakes', 'Beverages'].map((cat) => {
                const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                      isSelected
                        ? 'bg-primary text-white shadow-primary/25 scale-[1.02]'
                        : 'bg-white dark:bg-secondary-900 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Food Items Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
              {filteredItems.map((item) => (
                <FoodCard
                  key={item.id}
                  item={item}
                  onSelect={(selected) => setCustomiseItem(selected)}
                />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-secondary-900 rounded-3xl p-6 border border-gray-100 dark:border-secondary-800 font-sans">
                <p className="text-gray-400 text-sm font-medium">
                  No delicious items match your search.
                </p>
              </div>
            )}
          </div>

          {/* Desktop Shared Cart Column (Right) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-20 h-fit">
            <SharedCartDrawer
              tableNumber={currentTableNum}
              tableToken={token || activeTable?.token || ''}
              currentGuestName={currentGuestName || 'Diner'}
              currentGuestAvatar={currentGuestAvatar || '👤'}
              onOpenSplitBill={() => setIsBillModalOpen(true)}
              onOrderPlaced={() => {
                // Keep on table menu so they can add Round 2 / track
              }}
            />
          </div>
        </div>
      </main>

      {/* Floating Bottom Shared Cart Bar for Mobile View */}
      {sharedCartCount > 0 && (
        <div className="lg:hidden fixed bottom-4 inset-x-4 z-40 font-sans">
          <button
            onClick={() => setMobileCartDrawerOpen(true)}
            className="w-full bg-primary hover:bg-primary-600 active:scale-98 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between font-bold text-sm transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                {sharedCartCount}
              </span>
              <span>Shared Table Cart</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black">
                {formatINR(sharedCart.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0))}
              </span>
              <span>&rarr;</span>
            </div>
          </button>
        </div>
      )}

      {/* Mobile Shared Cart Drawer Modal */}
      {mobileCartDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 flex items-end sm:items-center justify-center">
          <div className="w-full max-w-lg bg-white dark:bg-secondary-900 rounded-3xl p-4 overflow-hidden border border-gray-100 dark:border-secondary-800 shadow-2xl">
            <div className="flex justify-end pb-2">
              <button
                onClick={() => setMobileCartDrawerOpen(false)}
                className="text-xs font-bold text-gray-500 hover:text-secondary-900 px-3 py-1 bg-gray-100 dark:bg-secondary-800 rounded-lg font-sans uppercase tracking-wider"
              >
                Close Cart
              </button>
            </div>
            <SharedCartDrawer
              tableNumber={currentTableNum}
              tableToken={token || activeTable?.token || ''}
              currentGuestName={currentGuestName || 'Diner'}
              currentGuestAvatar={currentGuestAvatar || '👤'}
              onOpenSplitBill={() => {
                setMobileCartDrawerOpen(false);
                setIsBillModalOpen(true);
              }}
              onOrderPlaced={() => {
                setMobileCartDrawerOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Guest Join / Nickname Modal */}
      <GuestJoinModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        tableNumber={currentTableNum}
        onJoin={handleGuestJoin}
      />

      {/* Item Customisation Modal */}
      <CustomisationModal
        item={customiseItem}
        isOpen={Boolean(customiseItem)}
        onClose={() => setCustomiseItem(null)}
        onAddToCart={(item, variant, addons, notes, qty) => {
          // Add to multi-guest shared cart!
          addSharedCartItem(
            currentTableNum,
            {
              id: item.id,
              name: item.name,
              price: (variant?.price || item.price) + addons.reduce((s, a) => s + (a.price || 0), 0),
              quantity: qty,
              variantName: variant?.name || 'Standard',
              imageUrl: item.imageUrl,
              notes,
              addons,
            },
            currentGuestName || 'Diner',
            currentGuestAvatar || '👤'
          );
        }}
      />

      {/* Call Waiter Modal */}
      <CallWaiterModal
        isOpen={isCallWaiterOpen}
        onClose={() => setIsCallWaiterOpen(false)}
        tableNumber={currentTableNum}
      />

      {/* Shared Table Billing & Split Modal */}
      <SharedTableBillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        tableNumber={currentTableNum}
        currentGuestName={currentGuestName || 'Diner'}
      />

      {/* Digital Guest Portal Modal */}
      <DigitalGuestPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        tableNumber={currentTableNum}
        currentGuestName={currentGuestName || 'Diner'}
      />

      {/* AI Chef Assistant Floating Chat Copilot */}
      <AIChefAssistant />
    </div>
  );
};
