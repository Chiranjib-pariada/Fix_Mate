import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  X,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { Provider, Category, Service } from '../types';
import { useAuth } from '../context/AuthContext';

export const ServicesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const [sortBy, setSortBy] = useState('rating');

  // Booking Modal State
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    Promise.all([
      apiRequest<Category[]>('/categories'),
      apiRequest<Service[]>('/services'),
    ]).then(([catRes, srvRes]) => {
      setCategories(catRes.data);
      setServices(srvRes.data);
    });
  }, []);

  // Fetch providers matching filter
  useEffect(() => {
    setIsLoading(true);
    const query = new URLSearchParams();
    if (categoryParam) query.set('category', categoryParam);
    if (searchParam) query.set('search', searchParam);
    if (sortBy) query.set('sortBy', sortBy);

    apiRequest<Provider[]>(`/providers?${query.toString()}`)
      .then(res => setProviders(res.data))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [categoryParam, searchParam, sortBy]);

  // Load availability when provider or date changes
  useEffect(() => {
    if (bookingProvider && bookingDate) {
      apiRequest<{ availableSlots: string[] }>(`/providers/${bookingProvider._id}/availability?date=${bookingDate}`)
        .then(res => {
          setAvailableSlots(res.data.availableSlots || []);
          if (res.data.availableSlots?.length > 0) {
            setTimeSlot(res.data.availableSlots[0]);
          } else {
            setTimeSlot('');
          }
        })
        .catch(console.error);
    }
  }, [bookingProvider, bookingDate]);

  const handleOpenBooking = (prov: Provider) => {
    setBookingProvider(prov);
    setBookingSuccess(null);
    setBookingError(null);
    if (prov.servicesOffered?.length > 0) {
      setSelectedService(prov.servicesOffered[0].serviceId);
    } else {
      const match = services.find(s => prov.serviceCategories.includes(s.categorySlug));
      setSelectedService(match ? match._id : services[0]?._id || '');
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingProvider || !selectedService || !bookingDate || !timeSlot) {
      setBookingError('Please select a service, date, and available time slot.');
      return;
    }

    if (!user) {
      navigate('/profile');
      return;
    }

    const currentAddress = user.addresses[0] || {
      _id: 'default_addr',
      title: 'Current Location',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'Metro City',
      state: 'California',
      postalCode: '90001',
      latitude: 34.0522,
      longitude: -118.2437,
      isDefault: true,
    };

    setIsSubmitting(true);
    setBookingError(null);

    const srv = services.find(s => s._id === selectedService);
    const amount = srv?.basePrice || 49;

    try {
      const res = await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          providerId: bookingProvider._id,
          serviceId: selectedService,
          bookingDate,
          timeSlot,
          address: currentAddress,
          specialInstructions: specialNotes,
          amount,
        }),
      });

      setBookingSuccess(res.data);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to complete booking. Please choose another time slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Filter bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Find Service Professionals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse background-checked professionals ready to help in your area
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchParam}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set('search', e.target.value);
                else next.delete('search');
                setSearchParams(next);
              }}
              placeholder="Search by name, skill..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none"
            >
              <option value="rating">Top Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="jobs">Completed Jobs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => {
            const next = new URLSearchParams(searchParams);
            next.delete('category');
            setSearchParams(next);
          }}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            !categoryParam
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set('category', cat.slug);
              setSearchParams(next);
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryParam === cat.slug
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Provider Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-4">
              <div className="flex gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded" />
              <div className="h-8 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-slate-600 font-medium">No verified professionals found matching your filter.</p>
          <p className="text-xs text-slate-400">Try choosing a different service category or search keyword.</p>
          <button
            onClick={() => setSearchParams({})}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {providers.map((prov) => (
            <div
              key={prov._id}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <img
                    src={prov.avatar}
                    alt={prov.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-slate-900 truncate">{prov.name}</h3>
                      <span title="FixMate Verified Pro">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{prov.rating}</span>
                      <span className="text-slate-400 font-normal">({prov.reviewCount} reviews)</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {prov.experienceYears} yrs experience • {prov.completedJobsCount} jobs
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prov.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {prov.serviceCategories.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium capitalize"
                    >
                      {c.replace('-', ' ')}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px]">
                    📍 {prov.serviceAreas.join(', ')}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Available Hours</div>
                  <div className="text-xs font-semibold text-slate-800">
                    {prov.workingHours.start} - {prov.workingHours.end}
                  </div>
                </div>
                <button
                  onClick={() => handleOpenBooking(prov)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all"
                >
                  Book Service
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Booking Confirmed!</h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  Reference: <span className="font-semibold text-slate-900">{bookingSuccess.bookingNumber}</span>
                  <br />
                  Your appointment with <span className="font-semibold">{bookingProvider.name}</span> is confirmed for {bookingSuccess.bookingDate} ({bookingSuccess.timeSlot}).
                </p>
                <div className="pt-4 flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      setBookingProvider(null);
                      navigate('/bookings');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    View in Bookings
                  </button>
                  <button
                    onClick={() => setBookingProvider(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={bookingProvider.avatar}
                      alt={bookingProvider.name}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Book with {bookingProvider.name}</h3>
                      <p className="text-[11px] text-slate-500">★ {bookingProvider.rating} • Verified Professional</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setBookingProvider(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {bookingError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* Service Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Specific Service:
                  </label>
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                  >
                    {services
                      .filter(s => bookingProvider.serviceCategories.includes(s.categorySlug))
                      .map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} — ${s.basePrice} ({s.estimatedDuration})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Appointment Date:
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Available Time Slot:
                  </label>
                  {availableSlots.length === 0 ? (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                      No open slots on this date. Please choose another day.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`p-2 rounded-xl text-xs font-medium border text-center transition-colors ${
                            timeSlot === slot
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Special Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Job Notes / Details (Optional):
                  </label>
                  <textarea
                    rows={2}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Bring extra 10A socket plates, apartment buzzer is #4B"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-slate-800"
                  />
                </div>

                {/* Transparent Price Summary */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Base Service Labor</span>
                    <span>${services.find(s => s._id === selectedService)?.basePrice || 49}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Platform & Warranty Fee</span>
                    <span className="text-emerald-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
                    <span>Estimated Total</span>
                    <span>${services.find(s => s._id === selectedService)?.basePrice || 49}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting || !timeSlot}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  {isSubmitting ? 'Confirming Appointment...' : 'Confirm & Schedule Booking'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
