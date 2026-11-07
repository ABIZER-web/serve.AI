import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatINR } from '../../utils/currency';
import { Plus, Trash2, Edit3, Check, X, Search, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const MenuManagement = () => {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem } = useRestaurant();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('Pizza');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    addMenuItem({
      name: name.trim(),
      categoryName,
      price: Number(price),
      description: description.trim(),
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isVeg,
      isBestseller,
      prepTimeMinutes: Number(prepTimeMinutes) || 15,
      isAvailable: true,
      variants: [],
      addons: [],
    });

    setIsAddModalOpen(false);
    setName('');
    setPrice('');
    setDescription('');
    setImageUrl('');
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.categoryName?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-secondary-900 dark:text-white">Menu Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">Add, edit prices, set variants, or mark dishes sold-out in real time.</p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} icon={Plus} size="sm">
          Add Food Item
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Pizza', 'Burgers', 'Indian', 'Chinese', 'Starters', 'Beverages', 'Desserts'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-secondary-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu..."
            className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Food Items Table */}
      <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-secondary-800/60 text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-100 dark:border-secondary-800">
              <tr>
                <th className="p-4">Item Details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Prep Time</th>
                <th className="p-4">Availability</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-secondary-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-secondary-800/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-secondary-900 dark:text-white flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {item.isBestseller && (
                            <span className="bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.2 rounded-full">
                              BESTSELLER
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-400 line-clamp-1 max-w-xs mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-semibold text-gray-600 dark:text-gray-300">
                    {item.categoryName || 'General'}
                  </td>
                  <td className="p-4 font-extrabold text-secondary-900 dark:text-white">
                    {formatINR(item.price)}
                  </td>
                  <td className="p-4 text-gray-500 font-medium">
                    {item.prepTimeMinutes || 15} mins
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => updateMenuItem(item.id, { isAvailable: item.isAvailable === false ? true : false })}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                        item.isAvailable !== false
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {item.isAvailable !== false ? 'In Stock' : 'Sold Out'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Delete dish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Food Item Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Menu Item" maxWidth="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Dish Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tandoori Paneer Tikka"
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Category</label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {['Pizza', 'Burgers', 'Indian', 'Chinese', 'Starters', 'Beverages', 'Desserts'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="249"
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              >
              </input>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Fresh farm ingredients, seasoned with authentic herbs..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span>100% Pure Vegetarian</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="w-4 h-4 text-primary rounded"
              />
              <span>Mark as Bestseller</span>
            </label>
          </div>

          <Button type="submit" size="md" className="w-full mt-4 font-bold">
            Save Food Item
          </Button>
        </form>
      </Modal>
    </div>
  );
};

