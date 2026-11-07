import React from 'react';
import { Plus } from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const FoodCard = ({ item, onSelect }) => {
  return (
    <div className="bg-white dark:bg-secondary-900 rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-secondary-800 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
      <div>
        {/* Food Image with Veg & Bestseller Badges */}
        <div className="relative w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-gray-100 dark:bg-secondary-800 mb-3">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />

          {/* Veg/Non-Veg icon */}
          <div className="absolute top-2 left-2 bg-white/90 dark:bg-secondary-900/90 backdrop-blur-sm p-1 rounded-md shadow-sm">
            <div
              className={`w-3.5 h-3.5 border-2 flex items-center justify-center rounded-sm ${
                item.isVeg ? 'border-emerald-600' : 'border-red-600'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  item.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              />
            </div>
          </div>

          {/* Bestseller Badge */}
          {item.isBestseller && (
            <div className="absolute top-2 right-2 bg-primary text-white text-[9px] font-sans font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-wider uppercase">
              Bestseller
            </div>
          )}
        </div>

        {/* Title in Editorial Serif */}
        <h3 className="font-display font-bold text-secondary-900 dark:text-white text-base leading-snug line-clamp-1 tracking-tight">
          {item.name}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed font-sans">
          {item.description}
        </p>
      </div>

      {/* Price & Add Button */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50 dark:border-secondary-800/60 font-sans">
        <div>
          <span className="text-base font-extrabold text-secondary-900 dark:text-white">
            {formatINR(item.price)}
          </span>
          {item.variants && item.variants.length > 0 && (
            <span className="text-[10px] text-gray-400 block -mt-1 font-medium">customisable</span>
          )}
        </div>

        <button
          onClick={() => onSelect(item)}
          className="flex items-center gap-1 bg-primary hover:bg-primary-600 active:scale-95 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition tracking-wider uppercase font-sans"
        >
          <span>Add</span>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
