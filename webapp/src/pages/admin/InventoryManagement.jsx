import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import {
  Boxes,
  Plus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const InventoryManagement = () => {
  const { inventory, updateInventoryStock } = useRestaurant();
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [addQty, setAddQty] = useState(5);
  const [wastageQty, setWastageQty] = useState(1);
  const [isRestockOpen, setIsRestockOpen] = useState(false);

  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minThreshold);

  const handleRestock = (e) => {
    e.preventDefault();
    if (!selectedIngredient) return;
    updateInventoryStock(selectedIngredient.id, Number(addQty));
    setIsRestockOpen(false);
  };

  const handleLogWastage = (ingredientId) => {
    updateInventoryStock(ingredientId, -Number(wastageQty));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary-900 dark:text-white">
            Inventory & Ingredients
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Automated ingredient depletion linked to incoming table orders & real-time recipe tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Auto-Deduction Active</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-secondary-900 p-5 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tracked Raw Items</div>
            <div className="text-2xl font-black text-secondary-900 dark:text-white">{inventory.length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 p-5 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Low Stock Warnings</div>
            <div className="text-2xl font-black text-red-500">{lowStockItems.length} Items</div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 p-5 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Est. Inventory Valuation</div>
            <div className="text-2xl font-black text-secondary-900 dark:text-white">
              {formatINR(inventory.reduce((acc, i) => acc + i.currentStock * i.costPerUnit, 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <span>
              <strong>Low Stock Warning:</strong> {lowStockItems.map((i) => i.name).join(', ')} below safe threshold. Re-order recommended.
            </span>
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white dark:bg-secondary-900 rounded-3xl border border-gray-100 dark:border-secondary-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-secondary-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-secondary-900 dark:text-white">
            Current Stock Levels
          </h3>
          <span className="text-xs text-gray-400 font-medium">
            Updated in real time with POS & Table Orders
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 dark:bg-secondary-800 text-gray-400 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-5">Ingredient / Raw Good</th>
                <th className="py-3 px-5">Current Stock</th>
                <th className="py-3 px-5">Min Threshold</th>
                <th className="py-3 px-5">Unit Cost</th>
                <th className="py-3 px-5">Verified Supplier</th>
                <th className="py-3 px-5 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-800 font-medium text-secondary-800 dark:text-gray-200">
              {inventory.map((item) => {
                const isLow = item.currentStock <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-secondary-800/50 transition">
                    <td className="py-3.5 px-5 font-bold text-secondary-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {isLow ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`font-mono font-black text-sm ${isLow ? 'text-red-500' : 'text-secondary-900 dark:text-white'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-400">
                      {item.minThreshold} {item.unit}
                    </td>
                    <td className="py-3.5 px-5 font-mono">
                      {formatINR(item.costPerUnit)} / {item.unit}
                    </td>
                    <td className="py-3.5 px-5 text-gray-500 dark:text-gray-400">
                      {item.supplier}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => {
                          setSelectedIngredient(item);
                          setIsRestockOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-xs transition active:scale-95"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {isRestockOpen && selectedIngredient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 max-w-sm w-full border border-gray-100 dark:border-secondary-800 shadow-2xl space-y-4">
            <h4 className="font-bold text-base text-secondary-900 dark:text-white">
              Restock {selectedIngredient.name}
            </h4>
            <div className="text-xs text-gray-500">
              Current stock: <strong>{selectedIngredient.currentStock} {selectedIngredient.unit}</strong>
            </div>

            <form onSubmit={handleRestock} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Add Quantity ({selectedIngredient.unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={addQty}
                  onChange={(e) => setAddQty(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRestockOpen(false)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 text-xs font-bold">
                  Confirm Restock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

