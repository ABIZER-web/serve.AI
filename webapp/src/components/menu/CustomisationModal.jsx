import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatINR } from '../../utils/currency';
import { Minus, Plus, Check } from 'lucide-react';

export const CustomisationModal = ({ item, isOpen, onClose, onAddToCart }) => {
  if (!item) return null;

  const defaultVariant = item.variants?.find((v) => v.isDefault) || item.variants?.[0] || null;
  const [selectedVariant, setSelectedVariant] = useState(defaultVariant);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [cookingNotes, setCookingNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) {
      setSelectedVariant(item.variants?.find((v) => v.isDefault) || item.variants?.[0] || null);
      setSelectedAddons([]);
      setCookingNotes('');
      setQuantity(1);
    }
  }, [item]);

  const toggleAddon = (addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.some((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const basePrice = selectedVariant ? selectedVariant.price : item.price;
  const addonsPrice = selectedAddons.reduce((sum, a) => sum + (a.price || 0), 0);
  const itemTotal = (basePrice + addonsPrice) * quantity;

  const handleAdd = () => {
    onAddToCart(item, selectedVariant, selectedAddons, cookingNotes, quantity);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Customise ${item.name}`} maxWidth="max-w-md">
      <div className="space-y-5">
        {/* Item Header */}
        <div className="flex gap-3 items-center">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <div className="font-bold text-base text-secondary-900 dark:text-white">
              {item.name}
            </div>
            <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {item.description}
            </div>
            <div className="text-primary font-bold text-sm mt-1">
              Base: {formatINR(item.price)}
            </div>
          </div>
        </div>

        {/* Variants Selection (e.g., Size) */}
        {item.variants && item.variants.length > 0 && (
          <div className="border-t border-gray-100 dark:border-secondary-800 pt-3">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
              Select Portion / Size
            </label>
            <div className="space-y-1.5">
              {item.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariant(v)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-sm transition ${
                      isSelected
                        ? 'border-primary bg-primary-50/60 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 font-bold'
                        : 'border-gray-200 dark:border-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-800 text-secondary-800 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-primary' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <span>{v.name}</span>
                    </div>
                    <span>{formatINR(v.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add-ons Selection */}
        {item.addons && item.addons.length > 0 && (
          <div className="border-t border-gray-100 dark:border-secondary-800 pt-3">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-2">
              Optional Add-ons & Extras
            </label>
            <div className="space-y-1.5">
              {item.addons.map((addon) => {
                const isChecked = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-sm transition ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-bold'
                        : 'border-gray-200 dark:border-secondary-800 hover:bg-gray-50 dark:hover:bg-secondary-800 text-secondary-800 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{addon.name}</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      +{formatINR(addon.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Cooking Instructions */}
        <div className="border-t border-gray-100 dark:border-secondary-800 pt-3">
          <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block mb-1">
            Special Instructions (Optional)
          </label>
          <input
            type="text"
            value={cookingNotes}
            onChange={(e) => setCookingNotes(e.target.value)}
            placeholder="e.g. Less spicy, extra crisp, no onions"
            className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Quantity and Final Add Button */}
        <div className="border-t border-gray-100 dark:border-secondary-800 pt-4 flex items-center justify-between">
          <div className="flex items-center border border-gray-200 dark:border-secondary-700 rounded-xl bg-gray-50 dark:bg-secondary-800 p-1">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-700 dark:text-gray-300 hover:bg-white dark:hover:bg-secondary-700 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-secondary-900 dark:text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary-700 dark:text-gray-300 hover:bg-white dark:hover:bg-secondary-700 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={handleAdd} size="md" className="flex-1 ml-4 shadow-md font-bold">
            Add to Cart • {formatINR(itemTotal)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

