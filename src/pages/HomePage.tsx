import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Wrench,
  Zap,
  Wind,
  Sparkles,
  Hammer,
  ShieldCheck,
  Clock,
  Award,
  Star,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Bot,
  MapPin,
  Calendar,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { Category, Provider } from '../types';
import { useAI } from '../context/AIContext';

export const HomePage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  const { openAi } = useAI();

  useEffect(() => {
    apiRequest<Category[]>('/categories')
      .then(res => setCategories(res.data))
      .catch(console.error);

    apiRequest<Provider[]>('/providers?sortBy=rating')
      .then(res => setFeaturedProviders(res.data.slice(0, 3)))
      .catch(console.error);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/services?${params.toString()}`);
  };

  const categoryIcons: Record<string, any> = {
    electrician: Zap,
    plumbing: Wrench,
    'ac-repair': Wind,
    'home-cleaning': Sparkles,
    carpenter: Hammer,
  };

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Next-Gen Home Services Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Trusted help. <br />
              <span className="text-blue-600">Right when you need it.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Book certified local electricians, plumbers, AC specialists, and cleaning professionals with transparent pricing and real-time tracking.
            </p>

            {/* Smart Search Form */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-8 max-w-2xl mx-auto bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200 flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-2 px-3 w-full">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you need help with? (e.g. pipe leak, fan repair)"
                  className="w-full py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="w-full sm:w-auto flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Select service category"
                  className="py-2 px-3 text-xs sm:text-sm text-slate-700 bg-transparent rounded-lg focus:outline-none cursor-pointer"
                >
                  <option value="">All Services</option>
                  <option value="electrician">Electrician</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="ac-repair">AC Repair</option>
                  <option value="home-cleaning">Cleaning</option>
                  <option value="carpenter">Carpenter</option>
                </select>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all shrink-0"
                >
                  Find Pro
                </button>
              </div>
            </form>

            {/* Quick AI Suggestions */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700 flex items-center gap-1">
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                Try asking AI:
              </span>
              <button
                onClick={() => openAi('My AC is blowing warm air')}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
              >
                "My AC is blowing warm air"
              </button>
              <button
                onClick={() => openAi('I have a leaking pipe under kitchen sink')}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-colors shadow-2xs"
              >
                "Leaking kitchen sink"
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Popular Home Services</h2>
            <p className="text-sm text-slate-500 mt-1">Verified experts on demand with clear upfront rates</p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Explore all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.slice(0, 5).map((cat) => {
            const Icon = categoryIcons[cat.slug] || Wrench;
            return (
              <Link
                key={cat._id}
                to={`/services?category=${cat.slug}`}
                className="group p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all text-center flex flex-col items-center justify-between"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{cat.description}</p>
                </div>
                <div className="mt-3 text-xs font-semibold text-slate-700">
                  Starts at <span className="text-blue-600">${cat.startingPrice}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* HOW FIXMATE WORKS */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              How FixMate Works
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              From problem to completion in four simple, protected steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Choose Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Describe your repair need or let FixMate AI match the correct specialized category instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Select Verified Pro</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Compare ratings, reviews, experience, and book directly into their real-time open calendar slot.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Live Tracking & Chat</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track appointment progress from dispatch to arrival, and message your technician directly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">Secure & Guaranteed</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pay securely online only when satisfied. Every service is protected by a 30-day warranty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED VERIFIED PROFESSIONALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Top Rated Professionals</h2>
            <p className="text-sm text-slate-500 mt-1">100% background checked and license verified</p>
          </div>
          <Link
            to="/services"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all pros <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProviders.map((prov) => (
            <div
              key={prov._id}
              className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm flex flex-col justify-between"
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
                      <span title="Verified Professional">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{prov.rating}</span>
                      <span className="text-slate-400 font-normal">({prov.reviewCount} reviews)</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {prov.experienceYears} years experience • {prov.completedJobsCount} jobs completed
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {prov.bio}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prov.serviceCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium capitalize"
                    >
                      {cat.replace('-', ' ')}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium">
                    {prov.serviceAreas[0]} area
                  </span>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Available from</div>
                  <div className="text-xs font-semibold text-slate-800">{prov.workingHours.start} today</div>
                </div>
                <Link
                  to={`/services?provider=${prov._id}`}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-xs font-semibold transition-colors"
                >
                  Book Pro
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY FIXMATE (TRUST INDICATORS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">100% Background Checked</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every provider passes strict government ID verification, criminal background screening, and trade license audits.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Transparent Slot Booking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No waiting for quotes. Pick an exact time slot, view locked upfront pricing, and track your technician in real time.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">30-Day FixMate Warranty</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an issue recurs within 30 days of service, our technician re-inspects and fixes it with zero additional labor charge.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
