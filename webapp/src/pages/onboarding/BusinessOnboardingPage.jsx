import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Coffee,
  UtensilsCrossed,
  QrCode,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import confetti from 'canvas-confetti';

export const BusinessOnboardingPage = () => {
  const { registerBusiness } = useRestaurant();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [cuisine, setCuisine] = useState('Specialty Cafe & Modern Dining');
  const [city, setCity] = useState('Bangalore, Karnataka');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [tablesCount, setTablesCount] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (val) => {
    setBusinessName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-'));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!businessName) return;
    setIsSubmitting(true);

    try {
      const created = registerBusiness({
        name: businessName,
        slug: slug || 'my-cafe',
        cuisine,
        city,
        ownerName: ownerName || 'Cafe Owner',
        ownerPhone: ownerPhone || '+91 98888 00000',
        tablesCount: Number(tablesCount) || 10,
      });

      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      setTimeout(() => {
        setIsSubmitting(false);
        navigate('/admin');
      }, 1000);
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-100 dark:from-secondary-950 dark:via-secondary-900 dark:to-secondary-950 text-secondary-900 dark:text-white font-sans py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
            <UtensilsCrossed className="w-4 h-4" />
            <span>Serve.AI Restaurant Cloud</span>
          </Link>
          <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-secondary-900 dark:text-white">
            Register Your Business or Cafe
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Get instant unique table QR codes, digital menus, staff KDS & real-time ordering in 60 seconds.
          </p>
        </div>

        {/* Onboarding Form Card */}
        <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-secondary-800 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Business Info */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-secondary-900 dark:text-white pb-2 border-b border-gray-100 dark:border-secondary-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>1. Business Details</span>
              </h3>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  What is your Cafe / Restaurant Name?
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Cafe Highfive, Sunset Brews, Artisan Pizza"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Unique Customer Menu Link / QR Slug
                </label>
                <div className="flex items-center rounded-xl border border-gray-200 dark:border-secondary-700 bg-gray-50 dark:bg-secondary-800 px-3 py-2.5">
                  <span className="text-gray-400 font-mono text-xs">serveai.in/r/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 bg-transparent text-secondary-900 dark:text-white font-mono font-bold text-xs focus:outline-none ml-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Cuisine / Business Type
                  </label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    placeholder="e.g. Specialty Coffee, Pan-Asian, Bakery"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    City & Location
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Indiranagar, Bangalore"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Owner & Table Config */}
            <div className="space-y-4 pt-3">
              <h3 className="font-bold text-sm text-secondary-900 dark:text-white pb-2 border-b border-gray-100 dark:border-secondary-800 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-primary" />
                <span>2. Table & QR Setup</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Number of Tables
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={tablesCount}
                    onChange={(e) => setTablesCount(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white font-mono font-bold"
                  />
                  <span className="text-[10px] text-gray-400 block mt-1">Generates unique QR tokens</span>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Phone (WhatsApp alerts)
                  </label>
                  <input
                    type="tel"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="+91 98888 11111"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Inclusions checklist */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2 text-[11px] text-amber-900 dark:text-amber-200">
              <div className="font-bold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400">
                What you get immediately:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>Unique Table QR Codes (T-01 to T-{tablesCount})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>Interactive Customer Digital Menu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>Staff POS & Kitchen KDS Display</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  <span>Customer CRM & Loyalty Points</span>
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-4 text-sm font-bold shadow-lg"
            >
              <span>{isSubmitting ? 'Provisioning Your Cafe...' : 'Launch My Business Dashboard'}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

