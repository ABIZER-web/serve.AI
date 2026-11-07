import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { localStore, supabase, isLiveSupabaseConfigured } from '../lib/supabaseClient';
import { soundEffects } from '../lib/soundEffects';
import { speechService } from '../lib/speechService';

const RestaurantContext = createContext(null);

export const RestaurantProvider = ({ children }) => {
  const [restaurant, setRestaurant] = useState(localStore.getRestaurant());
  const [categories, setCategories] = useState(localStore.getCategories());
  const [menuItems, setMenuItems] = useState(localStore.getMenuItems());
  const [tables, setTables] = useState(localStore.getTables());
  const [orders, setOrders] = useState(localStore.getOrders());
  const [notifications, setNotifications] = useState(localStore.getNotifications());
  
  // Multi-Tenant & SaaS Extended State
  const [businesses, setBusinesses] = useState(localStore.getBusinesses());
  const [staff, setStaff] = useState(localStore.getStaff());
  const [customers, setCustomers] = useState(localStore.getCustomers());
  const [serviceRequests, setServiceRequests] = useState(localStore.getServiceRequests());
  const [inventory, setInventory] = useState(localStore.getInventory());
  const [loyalty, setLoyalty] = useState(localStore.getLoyaltyProfile());
  const [reservations, setReservations] = useState(localStore.getReservations());
  const [reviews, setReviews] = useState(localStore.getReviews());
  const [tableSessions, setTableSessions] = useState(localStore.getTableSessions());

  // Real-time alert state
  const [activeNewOrderModal, setActiveNewOrderModal] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const knownOrderIdsRef = useRef(new Set(orders.map((o) => o.id)));

  // Sync from store
  const refreshLocalState = useCallback(() => {
    setRestaurant(localStore.getRestaurant());
    setCategories(localStore.getCategories());
    setMenuItems(localStore.getMenuItems());
    setTables(localStore.getTables());
    
    const freshOrders = localStore.getOrders();
    setOrders(freshOrders);
    setNotifications(localStore.getNotifications());
    setBusinesses(localStore.getBusinesses());
    setStaff(localStore.getStaff());
    setCustomers(localStore.getCustomers());
    setServiceRequests(localStore.getServiceRequests());
    setInventory(localStore.getInventory());
    setLoyalty(localStore.getLoyaltyProfile());
    setReservations(localStore.getReservations());
    setReviews(localStore.getReviews());
    setTableSessions(localStore.getTableSessions());

    // Check for newly arrived orders
    freshOrders.forEach((ord) => {
      if (!knownOrderIdsRef.current.has(ord.id)) {
        knownOrderIdsRef.current.add(ord.id);
        if (ord.status === 'pending') {
          handleIncomingNewOrder(ord);
        }
      }
    });
  }, []);

  const handleIncomingNewOrder = useCallback((order) => {
    setActiveNewOrderModal(order);
    if (!isAudioMuted) {
      soundEffects.playNewOrderChime();
      speechService.announceOrder(order);
    }
  }, [isAudioMuted]);

  useEffect(() => {
    const unsubscribe = localStore.subscribe(() => {
      refreshLocalState();
    });

    let realtimeChannel = null;
    if (isLiveSupabaseConfigured && supabase) {
      realtimeChannel = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
          refreshLocalState();
          handleIncomingNewOrder(payload.new);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, () => {
          refreshLocalState();
        })
        .subscribe();
    }

    return () => {
      unsubscribe();
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [refreshLocalState, handleIncomingNewOrder]);

  // --- MULTI-TENANT SWITCHER & ONBOARDING ---
  const switchBusiness = (slugOrId) => {
    const switched = localStore.switchBusiness(slugOrId);
    refreshLocalState();
    return switched;
  };

  const registerBusiness = (bizData) => {
    const created = localStore.registerBusiness(bizData);
    refreshLocalState();
    return created;
  };

  // Staff mutations
  const addStaff = (member) => {
    return localStore.addStaff(member);
  };

  // Order state actions
  const acceptOrder = (orderId) => {
    localStore.updateOrderStatus(orderId, 'accepted');
    if (activeNewOrderModal?.id === orderId) setActiveNewOrderModal(null);
  };

  const rejectOrder = (orderId, reason = 'Kitchen busy') => {
    localStore.updateOrderStatus(orderId, 'rejected');
    if (activeNewOrderModal?.id === orderId) setActiveNewOrderModal(null);
  };

  const startPreparing = (orderId) => {
    localStore.updateOrderStatus(orderId, 'preparing');
    if (activeNewOrderModal?.id === orderId) setActiveNewOrderModal(null);
  };

  const markReady = (orderId) => {
    localStore.updateOrderStatus(orderId, 'ready');
  };

  const markServed = (orderId) => {
    localStore.updateOrderStatus(orderId, 'served');
  };

  const completeOrder = (orderId) => {
    localStore.updateOrderStatus(orderId, 'completed');
  };

  // Menu item mutations
  const addMenuItem = (item) => {
    const items = [...menuItems, { ...item, id: 'item-' + Date.now() }];
    localStore.saveMenuItems(items);
  };

  const updateMenuItem = (id, updatedFields) => {
    const items = menuItems.map((item) => (item.id === id ? { ...item, ...updatedFields } : item));
    localStore.saveMenuItems(items);
  };

  const deleteMenuItem = (id) => {
    const items = menuItems.filter((item) => item.id !== id);
    localStore.saveMenuItems(items);
  };

  // Table mutations
  const updateTable = (id, updatedFields) => {
    const updated = tables.map((t) => (t.id === id ? { ...t, ...updatedFields } : t));
    localStore.saveTables(updated);
  };

  const addTable = (tableNumber, section = 'Main Dining', capacity = 4) => {
    const token = `TOKEN_${restaurant.slug.toUpperCase()}_${tableNumber}_${Date.now()}`;
    const newTable = {
      id: 'table-' + Date.now(),
      tableNumber,
      section,
      capacity,
      isOccupied: false,
      token,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : 'https://serve-ai-26.vercel.app'}/r/${restaurant.slug}/table/${tableNumber}?token=${token}`)}`,
    };
    localStore.saveTables([...tables, newTable]);
  };

  const regenerateTableQR = (tableId) => {
    const target = tables.find((t) => t.id === tableId);
    if (!target) return;
    const newToken = `TOKEN_${restaurant.slug.toUpperCase()}_${target.tableNumber}_${Date.now()}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : 'https://serve-ai-26.vercel.app'}/r/${restaurant.slug}/table/${target.tableNumber}?token=${newToken}`)}`;
    updateTable(tableId, { token: newToken, qrUrl });
  };

  // Service Request Actions (Call Waiter)
  const callWaiter = (tableNumber, requestType, notes = '') => {
    soundEffects.playSuccessBeep();
    return localStore.createServiceRequest(tableNumber, requestType, notes);
  };

  const resolveServiceRequest = (id) => {
    localStore.updateServiceRequestStatus(id, 'completed');
  };

  const updateServiceRequestStatus = (id, status) => {
    localStore.updateServiceRequestStatus(id, status);
  };

  // Inventory Stock Mutations
  const updateInventoryStock = (ingredientId, delta) => {
    localStore.updateInventoryStock(ingredientId, delta);
  };

  // Reviews
  const submitReview = (reviewData) => {
    return localStore.addReview(reviewData);
  };

  // Reservations
  const createReservation = (resData) => {
    return localStore.createReservation(resData);
  };

  // --- SMART TABLE EXPERIENCE SHARED SESSION ACTIONS ---
  const joinTableSession = (tableNumber, token, guestName) => {
    const session = localStore.joinTableSession(tableNumber, token, guestName);
    refreshLocalState();
    return session;
  };

  const addSharedCartItem = (tableNumber, item, guestName) => {
    soundEffects.playSuccessBeep();
    const session = localStore.addSharedCartItem(tableNumber, item, guestName);
    refreshLocalState();
    return session;
  };

  const removeSharedCartItem = (tableNumber, cartItemId) => {
    localStore.removeSharedCartItem(tableNumber, cartItemId);
    refreshLocalState();
  };

  const updateSharedCartItemQty = (tableNumber, cartItemId, delta) => {
    localStore.updateSharedCartItemQty(tableNumber, cartItemId, delta);
    refreshLocalState();
  };

  const submitSharedTableOrder = (tableNumber, paymentMethod, specialInstructions) => {
    const order = localStore.submitSharedTableOrder(tableNumber, paymentMethod, specialInstructions);
    refreshLocalState();
    return order;
  };

  const recordPartialPayment = (tableNumber, amount, paidBy, method) => {
    const rec = localStore.recordPartialPayment(tableNumber, amount, paidBy, method);
    refreshLocalState();
    return rec;
  };

  const transferTableSession = (fromTable, toTable) => {
    const res = localStore.transferTableSession(fromTable, toTable);
    refreshLocalState();
    return res;
  };

  const mergeTableSessions = (primary, secondary) => {
    const res = localStore.mergeTableSessions(primary, secondary);
    refreshLocalState();
    return res;
  };

  const closeTableSession = (tableNumber) => {
    localStore.closeTableSession(tableNumber);
    refreshLocalState();
  };

  // Super Admin
  const superadminToggleRestaurant = (resId) => {
    localStore.superadminToggleRestaurant(resId);
  };

  return (
    <RestaurantContext.Provider
      value={{
        restaurant,
        setRestaurant,
        categories,
        menuItems,
        tables,
        orders,
        notifications,
        businesses,
        staff,
        customers,
        serviceRequests,
        inventory,
        loyalty,
        reservations,
        reviews,
        tableSessions,
        activeNewOrderModal,
        setActiveNewOrderModal,
        isAudioMuted,
        setIsAudioMuted,
        switchBusiness,
        registerBusiness,
        addStaff,
        acceptOrder,
        rejectOrder,
        startPreparing,
        markReady,
        markServed,
        completeOrder,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        updateTable,
        addTable,
        regenerateTableQR,
        callWaiter,
        resolveServiceRequest,
        updateServiceRequestStatus,
        updateInventoryStock,
        submitReview,
        createReservation,
        superadminToggleRestaurant,
        joinTableSession,
        addSharedCartItem,
        removeSharedCartItem,
        updateSharedCartItemQty,
        submitSharedTableOrder,
        recordPartialPayment,
        transferTableSession,
        mergeTableSessions,
        closeTableSession,
        refreshLocalState,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
