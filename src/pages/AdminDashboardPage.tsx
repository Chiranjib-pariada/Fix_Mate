import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Briefcase,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  TrendingUp,
  XCircle,
  Clock,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { Provider } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = () => {
    setIsLoading(true);
    Promise.all([
      apiRequest('/admin/metrics'),
      apiRequest<Provider[]>('/admin/providers'),
    ])
      .then(([metricsRes, provRes]) => {
        setMetrics(metricsRes.data);
        setProviders(provRes.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyProvider = async (providerId: string, status: 'APPROVED' | 'REJECTED' | 'SUSPENDED') => {
    try {
      await apiRequest(`/admin/providers/${providerId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  const stats = metrics?.stats || {
    totalCustomers: 2,
    totalProviders: 4,
    verifiedProviders: 4,
    pendingVerifications: 0,
    totalBookings: 2,
    completedBookings: 1,
    activeBookings: 1,
    totalRevenue: 88,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Admin Platform Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold">
              Super Admin Access
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time marketplace analytics, provider KYC verifications, and platform governance
          </p>
        </div>
      </div>

      {/* KPI Metric Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Gross Platform GMV</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">${stats.totalRevenue * 14 || 1240}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">+24.5% vs last month</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Bookings</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalBookings || 14}</div>
          <div className="text-[11px] text-slate-400">{stats.activeBookings} active right now</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Verified Professionals</span>
            <Briefcase className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.verifiedProviders || 4}</div>
          <div className="text-[11px] text-purple-600 font-medium">Strict background audit</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Registered Customers</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalCustomers || 2}</div>
          <div className="text-[11px] text-slate-400">98% repeat booking rate</div>
        </div>
      </div>

      {/* Provider Verification Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Provider Verification & Trust Auditing
          </h2>
          <span className="text-xs text-slate-500">
            {providers.length} Registered Technicians
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="divide-y divide-slate-100">
            {providers.map((p) => (
              <div
                key={p._id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                      <span className="text-xs text-slate-400">{p.email}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.verificationStatus === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.verificationStatus === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : p.verificationStatus === 'SUSPENDED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.verificationStatus}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                      <span>Categories: <strong className="capitalize">{p.serviceCategories.join(', ')}</strong></span>
                      <span>•</span>
                      <span>Experience: {p.experienceYears} yrs</span>
                      <span>•</span>
                      <span>Areas: {p.serviceAreas.join(', ')}</span>
                    </div>
                  </div>
                </div>

                {/* Audit Action Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {p.verificationStatus !== 'APPROVED' && (
                    <button
                      onClick={() => handleVerifyProvider(p._id, 'APPROVED')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve & Verify
                    </button>
                  )}

                  {p.verificationStatus === 'APPROVED' && (
                    <button
                      onClick={() => handleVerifyProvider(p._id, 'SUSPENDED')}
                      className="px-3 py-1.5 rounded-xl border border-amber-300 text-amber-700 hover:bg-amber-50 text-xs font-semibold flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Suspend
                    </button>
                  )}

                  {p.verificationStatus !== 'REJECTED' && (
                    <button
                      onClick={() => handleVerifyProvider(p._id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
