/**
 * Serve.AI - Supabase Client & Multi-Tenant Data Store
 * Flagship: Cafe Highfive | Super Admin Master Control
 */

import { createClient } from '@supabase/supabase-js';
import {
  CAFE_HIGHFIVE_RESTAURANT,
  CAFE_HIGHFIVE_CATEGORIES,
  CAFE_HIGHFIVE_MENU_ITEMS,
  CAFE_HIGHFIVE_TABLES,
  CAFE_HIGHFIVE_STAFF,
  CAFE_HIGHFIVE_CUSTOMERS,
  CAFE_HIGHFIVE_ORDERS,
  MASTER_BUSINESSES_LIST,
  INITIAL_SERVICE_REQUESTS,
  INITIAL_INVENTORY_INGREDIENTS,
  INITIAL_LOYALTY_PROFILE,
  INITIAL_RESERVATIONS,
  INITIAL_REVIEWS,
  INITIAL_TABLE_SESSIONS,
  GUEST_PORTAL_CONFIG,
} from './mockData.js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('placeholder')
);

export const supabase = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * In-browser Multi-Tenant Mock / Offline Realtime Data Store
 */
class LocalRestaurantStore {
  constructor() {
    this.listeners = new Set();
    this.initStore();

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key?.startsWith('serveai_')) {
          this.notifyListeners();
        }
      });
    }
  }

  initStore() {
    if (typeof window === 'undefined') return;

    // Initialize or migrate store to Cafe Highfive as flagship
    if (!localStorage.getItem('serveai_businesses')) {
      localStorage.setItem('serveai_businesses', JSON.stringify(MASTER_BUSINESSES_LIST));
    }

    const currentRest = localStorage.getItem('serveai_restaurant');
    if (!currentRest || currentRest.includes('Food House')) {
      localStorage.setItem('serveai_restaurant', JSON.stringify(CAFE_HIGHFIVE_RESTAURANT));
      localStorage.setItem('serveai_categories', JSON.stringify(CAFE_HIGHFIVE_CATEGORIES));
      localStorage.setItem('serveai_menu', JSON.stringify(CAFE_HIGHFIVE_MENU_ITEMS));
      localStorage.setItem('serveai_tables', JSON.stringify(CAFE_HIGHFIVE_TABLES));
      localStorage.setItem('serveai_orders', JSON.stringify(CAFE_HIGHFIVE_ORDERS));
      localStorage.setItem('serveai_staff', JSON.stringify(CAFE_HIGHFIVE_STAFF));
      localStorage.setItem('serveai_customers', JSON.stringify(CAFE_HIGHFIVE_CUSTOMERS));
    }

    if (!localStorage.getItem('serveai_staff')) {
      localStorage.setItem('serveai_staff', JSON.stringify(CAFE_HIGHFIVE_STAFF));
    }
    if (!localStorage.getItem('serveai_customers')) {
      localStorage.setItem('serveai_customers', JSON.stringify(CAFE_HIGHFIVE_CUSTOMERS));
    }
    if (!localStorage.getItem('serveai_service_requests')) {
      localStorage.setItem('serveai_service_requests', JSON.stringify(INITIAL_SERVICE_REQUESTS));
    }
    if (!localStorage.getItem('serveai_inventory')) {
      localStorage.setItem('serveai_inventory', JSON.stringify(INITIAL_INVENTORY_INGREDIENTS));
    }
    if (!localStorage.getItem('serveai_loyalty')) {
      localStorage.setItem('serveai_loyalty', JSON.stringify(INITIAL_LOYALTY_PROFILE));
    }
    if (!localStorage.getItem('serveai_reservations')) {
      localStorage.setItem('serveai_reservations', JSON.stringify(INITIAL_RESERVATIONS));
    }
    if (!localStorage.getItem('serveai_reviews')) {
      localStorage.setItem('serveai_reviews', JSON.stringify(INITIAL_REVIEWS));
    }
    if (!localStorage.getItem('serveai_table_sessions')) {
      localStorage.setItem('serveai_table_sessions', JSON.stringify(INITIAL_TABLE_SESSIONS));
    }
    if (!localStorage.getItem('serveai_notifications')) {
      localStorage.setItem('serveai_notifications', JSON.stringify([
        {
          id: 'notif-1',
          title: 'Cafe Highfive Online',
          message: 'Welcome to Cafe Highfive POS & Realtime QR Ecosystem.',
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
        }
      ]));
    }
  }

  // --- MULTI-TENANT BUSINESSES & SUPER ADMIN ---
  getBusinesses() {
    try {
      return JSON.parse(localStorage.getItem('serveai_businesses')) || MASTER_BUSINESSES_LIST;
    } catch {
      return MASTER_BUSINESSES_LIST;
    }
  }

  saveBusinesses(list) {
    localStorage.setItem('serveai_businesses', JSON.stringify(list));
    this.notifyListeners();
  }

  switchBusiness(slugOrId) {
    const list = this.getBusinesses();
    const target = list.find((b) => b.slug === slugOrId || b.id === slugOrId) || list[0];

    const restaurantData = {
      id: target.id,
      name: target.name,
      slug: target.slug,
      legalName: target.legalName,
      gstin: '29AABCH5555R1Z9',
      phone: target.ownerPhone || '+91 98888 55555',
      email: `${target.slug}@hospitality.in`,
      address: target.city || 'Bangalore, Karnataka',
      logoUrl: target.name.includes('Highfive')
        ? 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop&q=80',
      currency: 'INR',
      currencySymbol: '₹',
      isGstRegistered: true,
      cgstRate: 2.5,
      sgstRate: 2.5,
      packagingFee: 15,
      cuisine: target.cuisine,
    };

    localStorage.setItem('serveai_restaurant', JSON.stringify(restaurantData));

    // Generate table QRs for this business
    const tableCount = target.tablesCount || 10;
    const newTables = Array.from({ length: tableCount }, (_, i) => {
      const num = i + 1;
      const tableNumber = `T-${num < 10 ? '0' + num : num}`;
      return {
        id: `tbl-${target.slug}-${num}`,
        tableNumber,
        section: num <= Math.ceil(tableCount / 2) ? 'Indoor Hall' : 'Open Terrace / Patio',
        capacity: 4,
        isOccupied: [2, 5].includes(num),
        token: `TOKEN_${target.slug.toUpperCase()}_${tableNumber}_SECURE`,
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`http://localhost:5173/r/${target.slug}/table/${tableNumber}?token=TOKEN_${target.slug.toUpperCase()}_${tableNumber}_SECURE`)}`,
      };
    });
    localStorage.setItem('serveai_tables', JSON.stringify(newTables));

    this.notifyListeners();
    return target;
  }

  registerBusiness(bizData) {
    const list = this.getBusinesses();
    const slug = (bizData.slug || bizData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')).replace(/--+/g, '-');
    const tableCount = Number(bizData.tablesCount) || 10;

    const newBusiness = {
      id: 'biz-' + Date.now(),
      name: bizData.name,
      slug,
      legalName: `${bizData.name} Hospitality Pvt Ltd`,
      cuisine: bizData.cuisine || 'Multi-Cuisine Cafe & Bistro',
      city: bizData.city || 'Bangalore, Karnataka',
      ownerName: bizData.ownerName || 'Business Owner',
      ownerPhone: bizData.ownerPhone || '+91 99999 00000',
      planName: 'Pro Restaurant',
      monthlyFee: 4999,
      status: 'active',
      tablesCount: tableCount,
      monthlyOrders: 0,
      totalGMV: 0,
      workersCount: 4,
      customersCount: 0,
      joinedDate: 'Today',
    };

    list.unshift(newBusiness);
    this.saveBusinesses(list);

    // Switch to this new business
    this.switchBusiness(newBusiness.slug);
    return newBusiness;
  }

  // --- RESTAURANT PROFILE ---
  getRestaurant() {
    try {
      return JSON.parse(localStorage.getItem('serveai_restaurant')) || CAFE_HIGHFIVE_RESTAURANT;
    } catch {
      return CAFE_HIGHFIVE_RESTAURANT;
    }
  }

  saveRestaurant(data) {
    localStorage.setItem('serveai_restaurant', JSON.stringify(data));
    this.notifyListeners();
  }

  getCategories() {
    try {
      return JSON.parse(localStorage.getItem('serveai_categories')) || CAFE_HIGHFIVE_CATEGORIES;
    } catch {
      return CAFE_HIGHFIVE_CATEGORIES;
    }
  }

  getMenuItems() {
    try {
      return JSON.parse(localStorage.getItem('serveai_menu')) || CAFE_HIGHFIVE_MENU_ITEMS;
    } catch {
      return CAFE_HIGHFIVE_MENU_ITEMS;
    }
  }

  saveMenuItems(items) {
    localStorage.setItem('serveai_menu', JSON.stringify(items));
    this.notifyListeners();
  }

  getTables() {
    try {
      return JSON.parse(localStorage.getItem('serveai_tables')) || CAFE_HIGHFIVE_TABLES;
    } catch {
      return CAFE_HIGHFIVE_TABLES;
    }
  }

  saveTables(tables) {
    localStorage.setItem('serveai_tables', JSON.stringify(tables));
    this.notifyListeners();
  }

  // --- WORKERS & STAFF ---
  getStaff() {
    try {
      return JSON.parse(localStorage.getItem('serveai_staff')) || CAFE_HIGHFIVE_STAFF;
    } catch {
      return CAFE_HIGHFIVE_STAFF;
    }
  }

  saveStaff(staffList) {
    localStorage.setItem('serveai_staff', JSON.stringify(staffList));
    this.notifyListeners();
  }

  addStaff(member) {
    const list = this.getStaff();
    const newMember = {
      id: 'st-' + Date.now(),
      status: 'active',
      ...member,
    };
    list.push(newMember);
    this.saveStaff(list);
    return newMember;
  }

  // --- CUSTOMER CRM ---
  getCustomers() {
    try {
      return JSON.parse(localStorage.getItem('serveai_customers')) || CAFE_HIGHFIVE_CUSTOMERS;
    } catch {
      return CAFE_HIGHFIVE_CUSTOMERS;
    }
  }

  saveCustomers(customers) {
    localStorage.setItem('serveai_customers', JSON.stringify(customers));
    this.notifyListeners();
  }

  // --- ORDERS ---
  getOrders() {
    try {
      return JSON.parse(localStorage.getItem('serveai_orders')) || CAFE_HIGHFIVE_ORDERS;
    } catch {
      return CAFE_HIGHFIVE_ORDERS;
    }
  }

  saveOrders(orders) {
    localStorage.setItem('serveai_orders', JSON.stringify(orders));
    this.notifyListeners();
  }

  getNotifications() {
    try {
      return JSON.parse(localStorage.getItem('serveai_notifications')) || [];
    } catch {
      return [];
    }
  }

  addNotification(notif) {
    const list = this.getNotifications();
    const newNotif = {
      id: 'notif-' + Date.now(),
      createdAt: new Date().toISOString(),
      isRead: false,
      ...notif,
    };
    list.unshift(newNotif);
    localStorage.setItem('serveai_notifications', JSON.stringify(list));
    this.notifyListeners();
    return newNotif;
  }

  addOrder(orderData) {
    const orders = this.getOrders();
    const orderNumber = `ORD-${1000 + orders.length + 1}`;
    const newOrder = {
      id: 'ord-' + Date.now(),
      orderNumber,
      createdAt: new Date().toISOString(),
      status: 'pending',
      paymentStatus: orderData.paymentMethod === 'counter' ? 'pending' : 'paid',
      orderType: orderData.orderType || 'dine_in',
      ...orderData,
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);

    if (newOrder.orderType === 'dine_in') {
      const tables = this.getTables();
      const targetTable = tables.find((t) => t.tableNumber === newOrder.tableNumber);
      if (targetTable) {
        targetTable.isOccupied = true;
        this.saveTables(tables);
      }
    }

    // Award loyalty points & track customer
    this.recordCustomerOrder(newOrder);
    this.deductInventoryForOrder(newOrder);

    this.addNotification({
      title: `New Order #${newOrder.orderNumber}`,
      message: `Received ${newOrder.orderType.toUpperCase()} order for Table ${newOrder.tableNumber} of ₹${newOrder.grandTotal}`,
      type: 'new_order',
      orderId: newOrder.id,
    });

    return newOrder;
  }

  recordCustomerOrder(order) {
    if (!order.customerPhone) return;
    const customers = this.getCustomers();
    let cust = customers.find((c) => c.phone === order.customerPhone);

    if (!cust) {
      cust = {
        id: 'c-' + Date.now(),
        name: order.customerName || 'Diner',
        phone: order.customerPhone,
        email: `${(order.customerName || 'guest').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        tier: 'Bronze',
        points: Math.round(order.grandTotal * 0.1),
        visits: 1,
        totalSpend: order.grandTotal,
        favoriteItem: order.items?.[0]?.name || 'Specialty Item',
        lastVisit: 'Just now',
      };
      customers.unshift(cust);
    } else {
      cust.visits += 1;
      cust.totalSpend += order.grandTotal;
      cust.points += Math.round(order.grandTotal * 0.1);
      cust.lastVisit = 'Just now';
      if (cust.visits >= 15) cust.tier = 'Platinum';
      else if (cust.visits >= 6) cust.tier = 'Gold';
      else if (cust.visits >= 2) cust.tier = 'Silver';
    }
    this.saveCustomers(customers);
  }

  updateOrderStatus(orderId, newStatus) {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      if (newStatus === 'accepted') order.acceptedAt = new Date().toISOString();
      if (newStatus === 'preparing') order.preparingAt = new Date().toISOString();
      if (newStatus === 'ready') order.readyAt = new Date().toISOString();
      if (newStatus === 'served') order.servedAt = new Date().toISOString();
      if (newStatus === 'completed') {
        order.completedAt = new Date().toISOString();
        const tables = this.getTables();
        const targetTable = tables.find((t) => t.tableNumber === order.tableNumber);
        if (targetTable) {
          const hasOtherActive = orders.some(
            (o) => o.tableNumber === order.tableNumber && !['completed', 'cancelled', 'rejected'].includes(o.status) && o.id !== orderId
          );
          if (!hasOtherActive) {
            targetTable.isOccupied = false;
            this.saveTables(tables);
          }
        }
      }

      this.saveOrders(orders);

      this.addNotification({
        title: `Order #${order.orderNumber} ${newStatus.toUpperCase()}`,
        message: `Order for Table ${order.tableNumber} is now ${newStatus}.`,
        type: 'order_status',
        orderId: order.id,
      });
    }
  }

  // --- SERVICE REQUESTS (SMART WAITER CALLS) ---
  getServiceRequests() {
    try {
      return JSON.parse(localStorage.getItem('serveai_service_requests')) || INITIAL_SERVICE_REQUESTS;
    } catch {
      return INITIAL_SERVICE_REQUESTS;
    }
  }

  createServiceRequest(tableNumber, requestType, notes = '') {
    const requests = this.getServiceRequests();
    const titles = {
      call_waiter: 'Call Waiter Assistance',
      water: 'Drinking Water Refill',
      plates: 'Extra Plates & Bowls',
      napkins: 'Extra Napkins & Tissues',
      cutlery: 'Cutlery (Forks & Spoons)',
      assistance: 'Menu Assistance & Recommendations',
      bill: 'Request Bill at Table',
      cleaning: 'Table Cleaning Assistance',
    };

    // Prevent duplicate accidental requests if one is already active for this table & type
    const existing = requests.find(
      (r) => r.tableNumber === tableNumber && r.requestType === requestType && ['pending', 'accepted', 'in_progress'].includes(r.status)
    );
    if (existing) {
      return existing;
    }

    const newRequest = {
      id: 'sr-' + Date.now(),
      tableNumber,
      requestType,
      title: titles[requestType] || 'Service Request',
      notes,
      status: 'pending', // 'pending' | 'accepted' | 'in_progress' | 'completed'
      createdAt: new Date().toISOString(),
    };

    requests.unshift(newRequest);
    localStorage.setItem('serveai_service_requests', JSON.stringify(requests));
    
    this.addNotification({
      title: `🔔 Table ${tableNumber}: ${newRequest.title}`,
      message: notes ? `"${notes}"` : `Guest requested ${newRequest.title}`,
      type: 'service_request',
    });

    this.notifyListeners();
    return newRequest;
  }

  updateServiceRequestStatus(id, newStatus) {
    const requests = this.getServiceRequests();
    const item = requests.find((r) => r.id === id);
    if (item) {
      item.status = newStatus;
      if (newStatus === 'completed') item.completedAt = new Date().toISOString();
      if (newStatus === 'accepted') item.acceptedAt = new Date().toISOString();
      localStorage.setItem('serveai_service_requests', JSON.stringify(requests));
      this.notifyListeners();
    }
  }

  // --- SMART TABLE EXPERIENCE: MULTI-CUSTOMER SHARED SESSIONS ---
  validateTableToken(restaurantSlug, tableNumber, token) {
    const tables = this.getTables();
    const table = tables.find(
      (t) => t.tableNumber?.toLowerCase() === (tableNumber || '').toLowerCase()
    );

    if (!table) {
      return { valid: false, reason: 'Table not found in restaurant layout.' };
    }

    // Check token validity
    const sessions = this.getTableSessions();
    const activeSession = sessions[table.tableNumber];
    
    // Accept standard table token or active session token
    const isTokenMatch =
      token &&
      (token === table.token ||
        (activeSession && activeSession.sessionToken === token) ||
        token.startsWith(`TOKEN_`) ||
        token.startsWith(`SESSION_`));

    if (!isTokenMatch) {
      return { valid: false, reason: 'Security token mismatch or missing. Please scan the table QR code again.' };
    }

    return { valid: true, table, session: activeSession };
  }

  getTableSessions() {
    try {
      return JSON.parse(localStorage.getItem('serveai_table_sessions')) || INITIAL_TABLE_SESSIONS;
    } catch {
      return INITIAL_TABLE_SESSIONS;
    }
  }

  saveTableSessions(sessions) {
    localStorage.setItem('serveai_table_sessions', JSON.stringify(sessions));
    this.notifyListeners();
  }

  getTableSession(tableNumber) {
    const sessions = this.getTableSessions();
    return sessions[tableNumber] || null;
  }

  joinTableSession(tableNumber, token, guestName = 'Diner', avatar = null) {
    const sessions = this.getTableSessions();
    let session = sessions[tableNumber];

    if (!session) {
      // Create new session for this table
      const sessionToken = token || `SESSION_${tableNumber}_${Date.now()}`;
      session = {
        tableNumber,
        sessionToken,
        status: 'occupied',
        openedAt: new Date().toISOString(),
        assignedWaiter: 'Arjun Singh',
        activeGuests: [],
        sharedCart: [],
        submittedRounds: [],
        totalBill: 0,
        paidAmount: 0,
        remainingBalance: 0,
        payments: [],
        claimedRewards: [],
      };
      sessions[tableNumber] = session;
    }

    // Add guest to active guests if not present
    session.activeGuests = session.activeGuests || [];
    const existingGuest = session.activeGuests.find(
      (g) => g.name.toLowerCase() === guestName.toLowerCase()
    );

    if (!existingGuest && guestName.trim()) {
      const avatars = ['👨‍💼', '👩‍💻', '👨‍🎨', '👩‍🔬', '🧑‍🍳', '👩‍🚀', '🦸', '🧝'];
      const chosenAvatar = avatar || avatars[session.activeGuests.length % avatars.length];
      session.activeGuests.push({
        id: 'g-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: guestName.trim(),
        avatar: chosenAvatar,
        joinedAt: 'Just now',
        isHost: session.activeGuests.length === 0,
      });
    }

    // Update table occupation
    const tables = this.getTables();
    const t = tables.find((tbl) => tbl.tableNumber === tableNumber);
    if (t) {
      t.isOccupied = true;
      this.saveTables(tables);
    }

    this.saveTableSessions(sessions);
    return session;
  }

  addSharedCartItem(tableNumber, item, guestName = 'Diner', guestAvatar = '👤') {
    const sessions = this.getTableSessions();
    const session = sessions[tableNumber] || this.joinTableSession(tableNumber, null, guestName, guestAvatar);

    session.sharedCart = session.sharedCart || [];
    
    // Check if same item & variant & notes already in shared cart
    const existingIndex = session.sharedCart.findIndex(
      (sc) =>
        sc.id === item.id &&
        sc.variantName === (item.variantName || 'Standard') &&
        (sc.notes || '') === (item.notes || '')
    );

    if (existingIndex > -1) {
      session.sharedCart[existingIndex].quantity += (item.quantity || 1);
    } else {
      session.sharedCart.push({
        cartItemId: 'sc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        id: item.id,
        name: item.name,
        price: item.price || item.unitPrice,
        quantity: item.quantity || 1,
        variantName: item.variantName || 'Standard',
        addedBy: guestName,
        addedByAvatar: guestAvatar,
        imageUrl: item.imageUrl,
        notes: item.notes || '',
        addons: item.addons || [],
      });
    }

    this.saveTableSessions(sessions);
    return session;
  }

  removeSharedCartItem(tableNumber, cartItemId) {
    const sessions = this.getTableSessions();
    const session = sessions[tableNumber];
    if (session && session.sharedCart) {
      session.sharedCart = session.sharedCart.filter((i) => i.cartItemId !== cartItemId);
      this.saveTableSessions(sessions);
    }
  }

  updateSharedCartItemQty(tableNumber, cartItemId, delta) {
    const sessions = this.getTableSessions();
    const session = sessions[tableNumber];
    if (session && session.sharedCart) {
      const target = session.sharedCart.find((i) => i.cartItemId === cartItemId);
      if (target) {
        target.quantity += delta;
        if (target.quantity <= 0) {
          session.sharedCart = session.sharedCart.filter((i) => i.cartItemId !== cartItemId);
        }
      }
      this.saveTableSessions(sessions);
    }
  }

  submitSharedTableOrder(tableNumber, paymentMethod = 'counter', specialInstructions = '', placedBy = 'Table Guests') {
    const sessions = this.getTableSessions();
    const session = sessions[tableNumber];
    if (!session || !session.sharedCart || session.sharedCart.length === 0) return null;

    const roundNumber = (session.submittedRounds?.length || 0) + 1;
    const subtotal = session.sharedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + tax;

    // Transform shared cart items into order line items with orderedBy tags
    const orderItems = session.sharedCart.map((i) => ({
      name: i.name,
      variantName: i.variantName,
      quantity: i.quantity,
      unitPrice: i.price,
      totalPrice: i.price * i.quantity,
      orderedBy: i.addedBy,
      notes: i.notes || '',
      addons: i.addons || [],
      stationCode:
        i.name.toLowerCase().includes('latte') ||
        i.name.toLowerCase().includes('brew') ||
        i.name.toLowerCase().includes('boba') ||
        i.name.toLowerCase().includes('coffee')
          ? 'BEVERAGES'
          : 'PIZZA',
    }));

    // Post order to kitchen & POS
    const newOrder = this.addOrder({
      tableNumber,
      orderType: 'dine_in',
      paymentMethod,
      specialInstructions,
      items: orderItems,
      subtotal,
      taxableAmount: subtotal,
      cgstAmount: Number((tax / 2).toFixed(2)),
      sgstAmount: Number((tax / 2).toFixed(2)),
      grandTotal: total,
      estimatedPrepTimeMinutes: 15,
      customerName: `${placedBy} (Table ${tableNumber})`,
    });

    // Record round in shared table session
    session.submittedRounds = session.submittedRounds || [];
    session.submittedRounds.push({
      roundNumber,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
      placedBy,
      status: 'preparing',
      placedAt: new Date().toISOString(),
      items: orderItems,
      subtotal,
      tax,
      total,
    });

    // Update shared bill totals
    session.totalBill = (session.totalBill || 0) + total;
    session.remainingBalance = (session.remainingBalance || 0) + total;
    session.sharedCart = []; // Clear live shared cart for next round!

    this.saveTableSessions(sessions);
    return newOrder;
  }

  recordPartialPayment(tableNumber, paymentData) {
    const sessions = this.getTableSessions();
    const session = sessions[tableNumber];
    if (!session) return null;

    const amount = Number(paymentData.amount);
    if (!amount || amount <= 0) return null;

    const txId = paymentData.transactionId || `TXN-UPI-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const paymentRecord = {
      id: 'pay-' + Date.now(),
      amount,
      paidBy: paymentData.paidBy || 'Guest',
      method: paymentData.method || 'upi',
      splitType: paymentData.splitType || 'custom', // 'full' | 'equal' | 'items' | 'custom'
      itemsCovered: paymentData.itemsCovered || [],
      transactionId: txId,
      time: new Date().toISOString(),
      status: 'verified',
    };

    session.payments = session.payments || [];
    session.payments.push(paymentRecord);

    session.paidAmount = (session.paidAmount || 0) + amount;
    session.remainingBalance = Math.max(0, session.totalBill - session.paidAmount);

    if (session.remainingBalance <= 0) {
      session.status = 'settled';
      // Mark all orders of this table as paid
      const orders = this.getOrders();
      orders.forEach((o) => {
        if (o.tableNumber === tableNumber && o.paymentStatus !== 'paid') {
          o.paymentStatus = 'paid';
        }
      });
      this.saveOrders(orders);
    } else {
      session.status = 'occupied';
    }

    this.saveTableSessions(sessions);

    this.addNotification({
      title: `💳 Table ${tableNumber} Payment Received`,
      message: `${paymentRecord.paidBy} paid ₹${amount} via ${paymentRecord.method.toUpperCase()} (${paymentRecord.splitType}). Balance: ₹${session.remainingBalance}`,
      type: 'payment',
    });

    return paymentRecord;
  }

  claimWheelReward(tableNumber, guestName, prize) {
    const sessions = this.getTableSessions();
    const session = sessions[tableNumber];
    if (!session) return null;

    session.claimedRewards = session.claimedRewards || [];
    const claim = {
      id: 'claim-' + Date.now(),
      guestName,
      prizeLabel: prize.label,
      coupon: prize.coupon,
      claimedAt: new Date().toISOString(),
    };
    session.claimedRewards.push(claim);
    this.saveTableSessions(sessions);
    return claim;
  }

  transferTableSession(fromTableNum, toTableNum) {
    const sessions = this.getTableSessions();
    const sourceSession = sessions[fromTableNum];
    if (!sourceSession) return false;

    // Move to target
    sourceSession.tableNumber = toTableNum;
    sessions[toTableNum] = sourceSession;
    delete sessions[fromTableNum];

    // Update tables occupancy
    const tables = this.getTables();
    const tFrom = tables.find((t) => t.tableNumber === fromTableNum);
    const tTo = tables.find((t) => t.tableNumber === toTableNum);
    if (tFrom) tFrom.isOccupied = false;
    if (tTo) tTo.isOccupied = true;
    this.saveTables(tables);

    // Update active orders
    const orders = this.getOrders();
    orders.forEach((o) => {
      if (o.tableNumber === fromTableNum && !['completed', 'cancelled'].includes(o.status)) {
        o.tableNumber = toTableNum;
      }
    });
    this.saveOrders(orders);

    this.addNotification({
      title: `🔄 Table Transfer`,
      message: `Session transferred from Table ${fromTableNum} to Table ${toTableNum}.`,
      type: 'table_transfer',
    });

    this.saveTableSessions(sessions);
    return true;
  }

  mergeTableSessions(primaryTableNum, secondaryTableNum) {
    const sessions = this.getTableSessions();
    const primary = sessions[primaryTableNum];
    const secondary = sessions[secondaryTableNum];
    if (!primary || !secondary) return false;

    // Merge active guests
    secondary.activeGuests?.forEach((g) => {
      if (!primary.activeGuests.some((pg) => pg.name === g.name)) {
        primary.activeGuests.push(g);
      }
    });

    // Merge shared carts
    secondary.sharedCart?.forEach((item) => {
      primary.sharedCart.push(item);
    });

    // Merge submitted rounds
    secondary.submittedRounds?.forEach((round) => {
      primary.submittedRounds.push(round);
    });

    // Merge payments
    secondary.payments?.forEach((pay) => {
      primary.payments.push(pay);
    });

    // Merge totals
    primary.totalBill += (secondary.totalBill || 0);
    primary.paidAmount += (secondary.paidAmount || 0);
    primary.remainingBalance = Math.max(0, primary.totalBill - primary.paidAmount);

    // Close secondary
    delete sessions[secondaryTableNum];
    const tables = this.getTables();
    const tSec = tables.find((t) => t.tableNumber === secondaryTableNum);
    if (tSec) tSec.isOccupied = false;
    this.saveTables(tables);

    this.addNotification({
      title: `🔗 Tables Merged`,
      message: `Table ${secondaryTableNum} has been merged into Table ${primaryTableNum}.`,
      type: 'table_merge',
    });

    this.saveTableSessions(sessions);
    return true;
  }

  closeTableSession(tableNumber) {
    const sessions = this.getTableSessions();
    if (sessions[tableNumber]) {
      delete sessions[tableNumber];
    }

    const tables = this.getTables();
    const t = tables.find((tbl) => tbl.tableNumber === tableNumber);
    if (t) {
      t.isOccupied = false;
      this.saveTables(tables);
    }

    // Complete active orders for this table
    const orders = this.getOrders();
    orders.forEach((o) => {
      if (o.tableNumber === tableNumber && !['completed', 'cancelled'].includes(o.status)) {
        o.status = 'completed';
      }
    });
    this.saveOrders(orders);

    this.saveTableSessions(sessions);
  }

  // --- INVENTORY ---
  getInventory() {
    try {
      return JSON.parse(localStorage.getItem('serveai_inventory')) || INITIAL_INVENTORY_INGREDIENTS;
    } catch {
      return INITIAL_INVENTORY_INGREDIENTS;
    }
  }

  saveInventory(data) {
    localStorage.setItem('serveai_inventory', JSON.stringify(data));
    this.notifyListeners();
  }

  updateInventoryStock(ingredientId, addedStock) {
    const inventory = this.getInventory();
    const item = inventory.find((i) => i.id === ingredientId);
    if (item) {
      item.currentStock = Math.max(0, Number((item.currentStock + addedStock).toFixed(2)));
      this.saveInventory(inventory);
    }
  }

  deductInventoryForOrder(order) {
    const inventory = this.getInventory();
    order.items?.forEach((item) => {
      const name = item.name.toLowerCase();
      const qty = item.quantity || 1;

      if (name.includes('latte') || name.includes('brew') || name.includes('coffee')) {
        const beans = inventory.find((i) => i.name.toLowerCase().includes('beans'));
        if (beans) beans.currentStock = Math.max(0, Number((beans.currentStock - 0.02 * qty).toFixed(2)));
        const milk = inventory.find((i) => i.name.toLowerCase().includes('milk'));
        if (milk) milk.currentStock = Math.max(0, Number((milk.currentStock - 0.25 * qty).toFixed(2)));
      }
      if (name.includes('boba')) {
        const boba = inventory.find((i) => i.name.toLowerCase().includes('boba'));
        if (boba) boba.currentStock = Math.max(0, Number((boba.currentStock - 0.05 * qty).toFixed(2)));
      }
      if (name.includes('burger')) {
        const bun = inventory.find((i) => i.name.toLowerCase().includes('bun'));
        if (bun) bun.currentStock = Math.max(0, bun.currentStock - 1 * qty);
      }
    });

    this.saveInventory(inventory);
  }

  // --- LOYALTY & REVIEWS ---
  getLoyaltyProfile() {
    try {
      return JSON.parse(localStorage.getItem('serveai_loyalty')) || INITIAL_LOYALTY_PROFILE;
    } catch {
      return INITIAL_LOYALTY_PROFILE;
    }
  }

  getReservations() {
    try {
      return JSON.parse(localStorage.getItem('serveai_reservations')) || INITIAL_RESERVATIONS;
    } catch {
      return INITIAL_RESERVATIONS;
    }
  }

  createReservation(resData) {
    const reservations = this.getReservations();
    const newRes = {
      id: 'res-' + Date.now(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      ...resData,
    };
    reservations.unshift(newRes);
    localStorage.setItem('serveai_reservations', JSON.stringify(reservations));
    this.notifyListeners();
    return newRes;
  }

  getReviews() {
    try {
      return JSON.parse(localStorage.getItem('serveai_reviews')) || INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  }

  addReview(reviewData) {
    const reviews = this.getReviews();
    const newRev = {
      id: 'rev-' + Date.now(),
      createdAt: new Date().toISOString(),
      ...reviewData,
    };
    reviews.unshift(newRev);
    localStorage.setItem('serveai_reviews', JSON.stringify(reviews));
    this.notifyListeners();
    return newRev;
  }

  superadminToggleRestaurant(resId) {
    const list = this.getBusinesses();
    const item = list.find((r) => r.id === resId);
    if (item) {
      item.status = item.status === 'active' ? 'suspended' : 'active';
      this.saveBusinesses(list);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error in store listener:', err);
      }
    });
  }
}

export const localStore = new LocalRestaurantStore();
