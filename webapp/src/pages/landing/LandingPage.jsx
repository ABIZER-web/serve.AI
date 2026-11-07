import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  Zap,
  Volume2,
  Receipt,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Tv,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-secondary-900 dark:text-white flex flex-col selection:bg-primary-100">
      {/* Top Navbar */}
      <header className="border-b border-gray-100 dark:border-secondary-800 bg-white/80 dark:bg-secondary-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-secondary-900 dark:text-white">
                Serve.AI
              </span>
              <span className="text-[9px] font-sans tracking-widest uppercase text-primary block -mt-1 font-bold">
                Hospitality OS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-wider uppercase text-gray-600 dark:text-gray-300">
            <a href="#features" className="hover:text-primary transition">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition">How It Works</a>
            <a href="#preview" className="hover:text-primary transition">Live Demo</a>
            <a href="#pricing" className="hover:text-primary transition">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/staff" className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 hover:text-primary px-3 py-2">
              Staff Sign In
            </Link>
            <Link to="/r/food-house/table/T-05">
              <Button size="sm" variant="primary">
                Demo Table T-05
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with Editorial Serif & Sweeping Italic Accent Matching Uploaded Reference */}
      <section className="relative overflow-hidden pt-14 pb-20 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800 text-primary text-[11px] font-bold tracking-widest uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>✦ The Intelligent Restaurant Operating System</span>
          </div>

          {/* High-Contrast Editorial Serif Headline with Calligraphic Italic */}
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-normal tracking-tight text-secondary-950 dark:text-white max-w-5xl mx-auto leading-[1.08]">
            Your Restaurant.{' '}
            <span className="font-display italic text-primary font-normal">
              One Scan.
            </span>{' '}
            Smarter Service.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-sans font-normal leading-relaxed">
            Let customers explore your menu, order from their table, and pay seamlessly while your team manages everything in real time.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link to="/r/food-house/table/T-05">
              <Button size="lg" className="shadow-xl shadow-primary/25 font-bold uppercase tracking-wider text-xs">
                <span>Start Table Ordering</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link to="/staff">
              <Button size="lg" variant="outline" className="font-bold uppercase tracking-wider text-xs">
                <span>Explore Staff POS</span>
              </Button>
            </Link>
            <Link to="/kitchen">
              <Button size="lg" variant="secondary" className="font-bold uppercase tracking-wider text-xs">
                <span>Open Kitchen Display</span>
              </Button>
            </Link>
          </div>

          {/* Feature Badges with Tracked Small Caps */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center justify-center gap-2.5 text-xs font-bold tracking-wide">
              <QrCode className="w-4 h-4 text-primary" />
              <span className="font-sans">QR Table Ordering</span>
            </div>
            <div className="bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center justify-center gap-2.5 text-xs font-bold tracking-wide">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="font-sans">Real-Time Orders</span>
            </div>
            <div className="bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center justify-center gap-2.5 text-xs font-bold tracking-wide">
              <Volume2 className="w-4 h-4 text-blue-500" />
              <span className="font-sans">AI Voice Alerts</span>
            </div>
            <div className="bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-gray-100 dark:border-secondary-800 shadow-sm flex items-center justify-center gap-2.5 text-xs font-bold tracking-wide">
              <Receipt className="w-4 h-4 text-emerald-500" />
              <span className="font-sans">Complete Billing</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid with Editorial Typography */}
      <section id="features" className="py-20 bg-white dark:bg-secondary-900 border-y border-gray-100 dark:border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-primary block mb-2">
              ENGINEERED FOR EXCELLENCE
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-normal tracking-tight">
              Built for <span className="italic">High-Velocity</span> Dining
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 font-sans">
              From zero-install customer phone orders to kitchen bump displays and native mobile apps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-7 rounded-2xl bg-background dark:bg-secondary-800/60 border border-gray-100 dark:border-secondary-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-950/60 text-primary flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2 text-secondary-900 dark:text-white">
                  Cryptographic Table QR
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed font-sans">
                  Every dining table gets a tamper-proof cryptographic token. Customers cannot simply edit the URL to order for someone else's table.
                </p>
              </div>
              <Link to="/admin/tables" className="text-primary text-xs font-bold mt-5 inline-flex items-center gap-1 uppercase tracking-wider font-sans">
                Table QR Generator &rarr;
              </Link>
            </div>

            <div className="p-7 rounded-2xl bg-background dark:bg-secondary-800/60 border border-gray-100 dark:border-secondary-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center mb-5">
                  <Volume2 className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2 text-secondary-900 dark:text-white">
                  AI Voice Speech Engine
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed font-sans">
                  Staff hear natural phonetic announcements for incoming orders with deduplication so multiple kitchen tabs never echo or repeat.
                </p>
              </div>
              <Link to="/staff" className="text-primary text-xs font-bold mt-5 inline-flex items-center gap-1 uppercase tracking-wider font-sans">
                Staff Voice Alerts &rarr;
              </Link>
            </div>

            <div className="p-7 rounded-2xl bg-background dark:bg-secondary-800/60 border border-gray-100 dark:border-secondary-800 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-5">
                  <Tv className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2 text-secondary-900 dark:text-white">
                  3-Column Touch KDS
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed font-sans">
                  Dedicated kitchen display kanban separating New Orders, Preparing, and Ready with live elapsed timers and color-coded urgency.
                </p>
              </div>
              <Link to="/kitchen" className="text-primary text-xs font-bold mt-5 inline-flex items-center gap-1 uppercase tracking-wider font-sans">
                Kitchen KDS &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-secondary-950 text-gray-400 text-xs border-t border-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-sans">
            &copy; 2026 Serve.AI. Production-ready restaurant ecosystem.
          </div>
          <div className="flex gap-4 uppercase font-bold tracking-wider text-[11px] font-sans">
            <Link to="/r/food-house/table/T-05" className="hover:text-white">Customer Menu</Link>
            <Link to="/staff" className="hover:text-white">Staff POS</Link>
            <Link to="/kitchen" className="hover:text-white">Kitchen KDS</Link>
            <Link to="/admin" className="hover:text-white">Admin Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
