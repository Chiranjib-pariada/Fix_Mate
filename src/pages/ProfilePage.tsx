import React, { useState } from 'react';
import {
  User,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Shield,
  Briefcase,
  Sparkles,
  Phone,
  Mail,
  Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, switchDemoRole, addAddress, removeAddress } = useAuth();

  // Add address modal/form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [title, setTitle] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Metro City');
  const [postalCode, setPostalCode] = useState('90001');
  const [landmark, setLandmark] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !city || !postalCode) return;

    setIsSubmitting(true);
    try {
      await addAddress({
        title,
        street,
        city,
        state: 'California',
        postalCode,
        landmark,
        isDefault: user?.addresses?.length === 0,
      });
      setShowAddAddress(false);
      setStreet('');
      setLandmark('');
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                {user?.role}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user?.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {user?.phone || '+1 (555) 012-3456'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Persona Switcher */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            Instant Role Switcher (Evaluation & Testing Mode)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Switch between Customer, Verified Service Provider, and Super Admin in one click.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => switchDemoRole('CUSTOMER')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              user?.role === 'CUSTOMER'
                ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1 font-semibold text-xs">
              <span>Customer Persona</span>
              {user?.role === 'CUSTOMER' && <CheckCircle2 className="w-4 h-4" />}
            </div>
            <p className="text-[11px] opacity-80">Book services, track jobs, test reviews & chat.</p>
          </button>

          <button
            onClick={() => switchDemoRole('PROVIDER')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              user?.role === 'PROVIDER'
                ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1 font-semibold text-xs">
              <span>Provider Persona</span>
              {user?.role === 'PROVIDER' && <CheckCircle2 className="w-4 h-4" />}
            </div>
            <p className="text-[11px] opacity-80">Manage jobs, change statuses, review earnings.</p>
          </button>

          <button
            onClick={() => switchDemoRole('ADMIN')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1 font-semibold text-xs">
              <span>Administrator</span>
              {user?.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4" />}
            </div>
            <p className="text-[11px] opacity-80">Verify KYC, inspect platform GMV metrics.</p>
          </button>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Saved Service Addresses</h2>
            <p className="text-xs text-slate-500">Addresses used for dispatching local technicians</p>
          </div>
          <button
            onClick={() => setShowAddAddress(!showAddAddress)}
            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Address
          </button>
        </div>

        {/* Add Address Form */}
        {showAddAddress && (
          <form
            onSubmit={handleCreateAddress}
            className="p-5 rounded-2xl bg-white border border-blue-200 shadow-sm space-y-3 animate-in fade-in duration-150"
          >
            <h3 className="font-semibold text-xs text-slate-800">Add Service Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">Label (e.g. Home, Office)</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Postal Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddAddress(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {isSubmitting ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        )}

        {/* Addresses List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(user?.addresses || []).map((addr) => (
            <div
              key={addr._id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-xs sm:text-sm">{addr.title}</span>
                  {addr.isDefault && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600">{addr.street}</p>
                <p className="text-[11px] text-slate-400">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
              </div>

              <button
                onClick={() => removeAddress(addr._id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove address"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
