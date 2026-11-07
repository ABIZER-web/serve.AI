import React, { createContext, useContext, useState, useEffect } from 'react';
import { localStore } from '../lib/supabaseClient';
import { soundEffects } from '../lib/soundEffects';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('serveai_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orderType, setOrderType] = useState('dine_in'); // 'dine_in' or 'takeaway'
  const [scheduledFor, setScheduledFor] = useState('now'); // 'now' or ISO string
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('serveai_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  const addToCart = (menuItem, variant = null, selectedAddons = [], notes = '', quantity = 1) => {
    soundEffects.playSuccessBeep();

    const unitPrice = variant ? variant.price : menuItem.price;
    const addonsPrice = selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0);
    const itemUnitPrice = unitPrice + addonsPrice;

    const addonKey = selectedAddons.map((a) => a.id).sort().join('-');
    const cartItemId = `${menuItem.id}_${variant?.id || 'default'}_${addonKey}_${notes.trim()}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        next[existingIndex].totalPrice = next[existingIndex].quantity * itemUnitPrice;
        return next;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            menuItemId: menuItem.id,
            name: menuItem.name,
            imageUrl: menuItem.imageUrl,
            isVeg: menuItem.isVeg,
            stationCode: menuItem.stationCode || 'PIZZA',
            variantId: variant?.id || null,
            variantName: variant?.name || 'Standard',
            addons: selectedAddons,
            notes,
            unitPrice: itemUnitPrice,
            quantity,
            totalPrice: itemUnitPrice * quantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.cartItemId === cartItemId) {
            const nextQty = i.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...i,
              quantity: nextQty,
              totalPrice: nextQty * i.unitPrice,
            };
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem('serveai_cart');
  };

  // Coupon handling
  const applyCoupon = (code) => {
    const clean = code?.trim().toUpperCase();
    if (clean === 'WELCOME20') {
      setAppliedCoupon({ code: 'WELCOME20', discountPct: 20, description: '20% Welcome Discount' });
      return { success: true, message: '20% discount applied!' };
    } else if (clean === 'TASTY50') {
      setAppliedCoupon({ code: 'TASTY50', flatDiscount: 50, description: 'Flat ₹50 Off' });
      return { success: true, message: '₹50 discount applied!' };
    }
    return { success: false, message: 'Invalid or expired coupon code' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Pricing math
  const subtotal = cart.reduce((sum, i) => sum + i.totalPrice, 0);

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPct) {
      discountAmount = Number(((subtotal * appliedCoupon.discountPct) / 100).toFixed(2));
    } else if (appliedCoupon.flatDiscount) {
      discountAmount = Math.min(subtotal, appliedCoupon.flatDiscount);
    }
  } else if (subtotal >= 500) {
    discountAmount = 50; // default auto-discount over ₹500
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const cgstAmount = Number(((taxableAmount * 2.5) / 100).toFixed(2));
  const sgstAmount = Number(((taxableAmount * 2.5) / 100).toFixed(2));
  const packagingFee = orderType === 'takeaway' ? 25 : 0;
  const grandTotal = Math.round(taxableAmount + cgstAmount + sgstAmount + packagingFee);
  const totalItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const placeOrder = ({
    tableNumber,
    tableToken,
    customerName,
    customerPhone,
    paymentMethod = 'counter',
    specialInstructions = '',
  }) => {
    if (cart.length === 0) return null;

    const orderPayload = {
      tableNumber,
      tableToken,
      customerName: customerName?.trim() || 'Guest',
      customerPhone: customerPhone?.trim() || '',
      orderType,
      scheduledFor: scheduledFor === 'now' ? null : scheduledFor,
      paymentMethod,
      specialInstructions,
      appliedCoupon: appliedCoupon?.code || null,
      items: cart.map((i) => ({
        name: i.name,
        variantName: i.variantName,
        stationCode: i.stationCode,
        addons: i.addons,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        notes: i.notes,
      })),
      subtotal,
      discountAmount,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      packagingFee,
      grandTotal,
      estimatedPrepTimeMinutes: 18,
    };

    const newOrder = localStore.addOrder(orderPayload);
    clearCart();
    return newOrder;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orderType,
        setOrderType,
        scheduledFor,
        setScheduledFor,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discountAmount,
        taxableAmount,
        cgstAmount,
        sgstAmount,
        packagingFee,
        grandTotal,
        totalItemCount,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
