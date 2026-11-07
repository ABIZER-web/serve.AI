/**
 * Serve.AI - Shared API Contracts and Types
 */

export const OrderStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

export const PaymentMethod = {
  COUNTER: 'counter',
  UPI: 'upi',
  CARD: 'card',
  CASH: 'cash',
};

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const StaffRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  WAITER: 'waiter',
  KITCHEN: 'kitchen',
  CASHIER: 'cashier',
};

export const VoiceLanguage = {
  EN_IN: 'en-IN',
  HI_IN: 'hi-IN',
  HINGLISH: 'hinglish',
};

