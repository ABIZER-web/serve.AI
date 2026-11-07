/**
 * Indian Rupee & Financial Currency Formatter
 */

export const formatINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDecimals = (val) => {
  return Number(val || 0).toFixed(2);
};

