import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MobileNav } from './MobileNav';
import { FixMateAiWidget } from '../ai/FixMateAiWidget';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, X } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { toastMessage, clearToast } = useNotifications();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      {/* Global Real-time Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-sm bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1 rounded-lg bg-blue-600/40 text-blue-400 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-semibold text-white">{toastMessage.title}</div>
            <div className="text-slate-300 mt-0.5">{toastMessage.message}</div>
          </div>
          <button
            onClick={clearToast}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
      <MobileNav />
      <FixMateAiWidget />
    </div>
  );
};
