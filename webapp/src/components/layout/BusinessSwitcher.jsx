import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ChevronDown,
  Plus,
  Check,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const BusinessSwitcher = () => {
  const { restaurant, businesses, switchBusiness } = useRestaurant();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (slug) => {
    switchBusiness(slug);
    setIsOpen(false);
  };

  return (
    <div className="relative font-sans">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-secondary-800/80 hover:bg-secondary-800 border border-secondary-700 text-left transition group"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-primary text-white flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm">
            {restaurant.name?.slice(0, 2).toUpperCase() || 'CH'}
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-xs text-white truncate flex items-center gap-1">
              <span>{restaurant.name || 'Cafe Highfive'}</span>
            </div>
            <div className="text-[10px] text-gray-400 truncate">
              {restaurant.cuisine || 'Specialty Coffee & Bistro'}
            </div>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition flex-shrink-0 ml-1" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-secondary-900 border border-secondary-700 rounded-2xl shadow-2xl overflow-hidden py-1.5 animate-in fade-in-50 zoom-in-95">
          <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Switch Business Tenant
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5 px-1.5">
            {businesses.map((biz) => {
              const isSelected = restaurant.slug === biz.slug;
              return (
                <button
                  key={biz.id}
                  onClick={() => handleSelect(biz.slug)}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-left transition ${
                    isSelected
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-secondary-800 hover:text-white'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate">{biz.name}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                      {biz.city || 'Bangalore'} • {biz.tablesCount || 10} Tables
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-secondary-800 mt-1 pt-1 px-1.5 space-y-0.5">
            <Link
              to="/onboard"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-amber-400 hover:bg-amber-400/10 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Register New Cafe/Business</span>
            </Link>

            <Link
              to="/superadmin"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-gray-300 hover:bg-secondary-800 transition"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-primary" />
                <span>Super Admin Tower</span>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-500" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

