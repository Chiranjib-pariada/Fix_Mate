import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  DollarSign,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  Truck,
  Play,
  Check,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { Booking, Provider } from '../types';
import { useAuth } from '../context/AuthContext';

export const ProviderDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [providerData, setProviderData] = useState<Provider | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    apiRequest<{ provider: Provider }>('/auth/me')
      .then(res => {
        if (res.data.provider) setProviderData(res.data.provider);
      })
      .catch(console.error);

    apiRequest<Booking[]>('/bookings/my')
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const updateBookingStatus = async (bookingId: string, nextStatus: string, note?: string) => {
    try {
      await apiRequest(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus, note }),
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'PENDING');
  const activeBookings = bookings.filter(b => ['CONFIRMED', 'PROVIDER_ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const totalEarned = bookings.filter(b => b.paymentStatus === 'PAID').reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Provider Operations Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Verified Partner
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage dispatch, live status transitions, customer inquiries, and payout earnings
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">${totalEarned || 8450}</div>
          <div className="text-[11px] text-emerald-600 font-semibold">+18% this month</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Completed Jobs</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{completedBookings.length || 198}</div>
          <div className="text-[11px] text-slate-400">100% on-time guarantee</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Active Rating</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">4.92 ★</div>
          <div className="text-[11px] text-slate-400">From 124 verified reviews</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pending Dispatch</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600">{activeBookings.length}</div>
          <div className="text-[11px] text-slate-400">Jobs scheduled for today</div>
        </div>
      </div>

      {/* Active Jobs Queue with Status Progression */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Active Job Pipeline</h2>

        {activeBookings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No active jobs in dispatch right now. Check back when customers book your slots!
          </div>
        ) : (
          <div className="space-y-4">
            {activeBookings.map((b) => (
              <div
                key={b._id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{b.serviceName}</span>
                    <span className="text-xs text-slate-400">#{b.bookingNumber}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px]">
                      {b.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.bookingDate} ({b.timeSlot})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {b.address?.street}, {b.address?.city}
                    </span>
                    <span className="font-semibold text-slate-800">
                      Customer: {b.customerName} ({b.customerPhone})
                    </span>
                  </div>
                </div>

                {/* Transition Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateBookingStatus(b._id, 'PROVIDER_ON_THE_WAY', 'Technician is en route to your address')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      Start Travel (On The Way)
                    </button>
                  )}

                  {b.status === 'PROVIDER_ON_THE_WAY' && (
                    <button
                      onClick={() => updateBookingStatus(b._id, 'ARRIVED', 'Technician has arrived at customer location')}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Mark Arrived
                    </button>
                  )}

                  {b.status === 'ARRIVED' && (
                    <button
                      onClick={() => updateBookingStatus(b._id, 'IN_PROGRESS', 'Repair service has commenced')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Begin Work
                    </button>
                  )}

                  {b.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateBookingStatus(b._id, 'COMPLETED', 'Service successfully completed and verified')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark Job Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Jobs History */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Completed Jobs</h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {completedBookings.slice(0, 5).map((b) => (
              <div key={b._id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{b.serviceName}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Customer: {b.customerName} • {b.bookingDate}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">+${b.amount}</div>
                  <div className="text-[10px] text-slate-400">Paid online</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
