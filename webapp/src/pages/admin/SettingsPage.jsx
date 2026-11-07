import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { speechService } from '../../lib/speechService';
import { Settings, Volume2, ShieldCheck, Save, Sparkles, Building2, CreditCard } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const SettingsPage = () => {
  const { restaurant, setRestaurant } = useRestaurant();

  // Restaurant details state
  const [name, setName] = useState(restaurant.name || 'Food House');
  const [legalName, setLegalName] = useState(restaurant.legalName || 'Food House Gourmet Hospitality Pvt Ltd');
  const [phone, setPhone] = useState(restaurant.phone || '+91 98765 43210');
  const [address, setAddress] = useState(restaurant.address || '#42, 100 Feet Road, Indiranagar, Bangalore');
  const [gstin, setGstin] = useState(restaurant.gstin || '29AABCU9603R1ZM');
  const [cgstRate, setCgstRate] = useState(restaurant.cgstRate || 2.5);
  const [sgstRate, setSgstRate] = useState(restaurant.sgstRate || 2.5);

  // Voice settings state
  const [voiceEnabled, setVoiceEnabled] = useState(speechService.settings.enabled);
  const [voiceLang, setVoiceLang] = useState(speechService.settings.language);
  const [voiceRate, setVoiceRate] = useState(speechService.settings.rate);
  const [voicePitch, setVoicePitch] = useState(speechService.settings.pitch);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      ...restaurant,
      name,
      legalName,
      phone,
      address,
      gstin,
      cgstRate: Number(cgstRate),
      sgstRate: Number(sgstRate),
    };

    setRestaurant(updated);
    try {
      localStorage.setItem('serveai_restaurant', JSON.stringify(updated));
    } catch (e) {}

    speechService.updateSettings({
      enabled: voiceEnabled,
      language: voiceLang,
      rate: Number(voiceRate),
      pitch: Number(voicePitch),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-secondary-900 dark:text-white">Restaurant & AI Voice Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">Configure restaurant identity, Indian GST tax slabs, and speech parameters.</p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-bold animate-fade-in">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Business Identity */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-gray-100 dark:border-secondary-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-secondary-800 font-bold text-sm text-secondary-900 dark:text-white">
            <Building2 className="w-4 h-4 text-primary" />
            <span>Business Profile & Tax Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Brand Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Legal Registered Entity</label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">GSTIN Number (15 Digits)</label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Address on Invoices</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* GST Slabs */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">CGST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={cgstRate}
                onChange={(e) => setCgstRate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">SGST Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={sgstRate}
                onChange={(e) => setSgstRate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 2: AI Voice Announcements Settings */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-gray-100 dark:border-secondary-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-secondary-800 font-bold text-sm text-secondary-900 dark:text-white">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" />
              <span>AI Voice Order Announcements</span>
            </div>

            <button
              type="button"
              onClick={() => speechService.testAnnouncement()}
              className="text-xs text-primary hover:underline font-bold"
            >
              Test Speech Synthesis
            </button>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span>Enable Automatic Speech Announcements on New Order</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">Voice Language</label>
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="en-IN">Indian English (en-IN)</option>
                <option value="hi-IN">Hindi (hi-IN)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Speech Speed ({voiceRate}x)
              </label>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={voiceRate}
                onChange={(e) => setVoiceRate(e.target.value)}
                className="w-full mt-2 accent-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Speech Pitch ({voicePitch})
              </label>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={voicePitch}
                onChange={(e) => setVoicePitch(e.target.value)}
                className="w-full mt-2 accent-primary"
              />
            </div>
          </div>
        </div>

        <Button type="submit" size="md" icon={Save} className="font-bold">
          Save Configuration
        </Button>
      </form>
    </div>
  );
};

