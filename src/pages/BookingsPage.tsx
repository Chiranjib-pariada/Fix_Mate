import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Star,
  ChevronRight,
  ShieldCheck,
  FileText,
  User,
  X,
  CreditCard,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { Booking, BookingStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  const fetchBookings = () => {
    setIsLoading(true);
    apiRequest<Booking[]>('/bookings/my')
      .then(res => setBookings(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await apiRequest(`/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CANCELLED', note: 'Cancelled by customer' }),
      });
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Unable to cancel booking');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking || !comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: reviewBooking._id,
          rating,
          comment,
        }),
      });
      setReviewMessage('Review published successfully! Thank you.');
      setTimeout(() => {
        setReviewBooking(null);
        setReviewMessage(null);
        setComment('');
        fetchBookings();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'ACTIVE') {
      return ['PENDING', 'CONFIRMED', 'PROVIDER_ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(b.status);
    }
    if (filter === 'COMPLETED') {
      return b.status === 'COMPLETED';
    }
    return true;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">Confirmed</span>;
      case 'PROVIDER_ON_THE_WAY':
        return <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold animate-pulse">On The Way</span>;
      case 'ARRIVED':
        return <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold">Arrived at Location</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">Service In Progress</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">Completed</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">{status}</span>;
    }
  };

  const renderTimelineProgress = (status: BookingStatus) => {
    const steps = [
      { key: 'CONFIRMED', label: 'Confirmed' },
      { key: 'PROVIDER_ON_THE_WAY', label: 'On The Way' },
      { key: 'ARRIVED', label: 'Arrived' },
      { key: 'IN_PROGRESS', label: 'In Progress' },
      { key: 'COMPLETED', label: 'Completed' },
    ];

    const stepOrder: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 1,
      PROVIDER_ON_THE_WAY: 2,
      ARRIVED: 3,
      IN_PROGRESS: 4,
      COMPLETED: 5,
      CANCELLED: -1,
      REJECTED: -1,
    };

    if (status === 'CANCELLED' || status === 'REJECTED') {
      return (
        <div className="py-2 text-xs text-rose-600 font-medium">
          This appointment was {status.toLowerCase()}.
        </div>
      );
    }

    const currentIdx = stepOrder[status] || 0;

    return (
      <div className="py-3">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 relative">
          <div className="absolute top-2 left-0 right-0 h-0.5 bg-slate-200 -z-0" />
          <div
            className="absolute top-2 left-0 h-0.5 bg-blue-600 transition-all duration-300 -z-0"
            style={{ width: `${Math.min(100, (currentIdx / 5) * 100)}%` }}
          />
          {steps.map((st, idx) => {
            const isCompleted = currentIdx >= idx + 1;
            const isCurrent = currentIdx === idx + 1;
            return (
              <div key={st.key} className="flex flex-col items-center gap-1 z-10">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 ring-4 ring-blue-100 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
                <span className={`text-[10px] hidden sm:block ${isCurrent ? 'font-bold text-blue-600' : 'text-slate-500'}`}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            My Appointments & Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track status transitions, contact your technician, and view receipts
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ACTIVE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'COMPLETED' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Booking List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-6 bg-slate-100 rounded" />
              <div className="h-10 bg-slate-50 rounded" />
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-semibold text-slate-800">No bookings in this tab</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Book professional home repair or maintenance service anytime with upfront pricing and verified technicians.
          </p>
          <Link
            to="/services"
            className="inline-block px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b._id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5"
            >
              {/* Top Row: Service name, Number, and Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{b.serviceName}</span>
                    <span className="text-xs text-slate-400 font-mono">({b.bookingNumber})</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Provider: <strong className="text-slate-700">{b.providerName}</strong></span>
                    <span>•</span>
                    <span>Category: <strong className="capitalize text-slate-700">{b.categorySlug.replace('-', ' ')}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(b.status)}
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                    ${b.amount} • {b.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Progress step bar */}
              {renderTimelineProgress(b.status)}

              {/* Details grid: Date, Time, Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Date</div>
                    <div className="font-medium">{b.bookingDate}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-400">Time Window</div>
                    <div className="font-medium">{b.timeSlot}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="truncate">
                    <div className="text-[10px] text-slate-400">Location</div>
                    <div className="font-medium truncate">{b.address?.street}, {b.address?.city}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-500">
                  {b.specialInstructions ? `Note: "${b.specialInstructions}"` : 'Standard 30-day labor guarantee included.'}
                </div>

                <div className="flex items-center gap-2">
                  {/* Chat Button */}
                  <Link
                    to={`/messages?user=${b.providerId}&name=${encodeURIComponent(b.providerName)}`}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    Chat with Pro
                  </Link>

                  {/* Review Button if completed */}
                  {b.status === 'COMPLETED' && (
                    <button
                      onClick={() => setReviewBooking(b)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      Rate & Review
                    </button>
                  )}

                  {/* Cancel Button if eligible */}
                  {['PENDING', 'CONFIRMED'].includes(b.status) && (
                    <button
                      onClick={() => handleCancelBooking(b._id)}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Review {reviewBooking.providerName}</h3>
              <button
                onClick={() => setReviewBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewMessage ? (
              <div className="py-6 text-center space-y-2 text-emerald-600 text-sm font-semibold">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p>{reviewMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4 pt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-slate-600 ml-2">{rating} of 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your Feedback & Comments
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe how the technician handled the repair, punctuality, and cleanliness..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview || !comment.trim()}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors"
                >
                  {isSubmittingReview ? 'Submitting Review...' : 'Publish Customer Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
