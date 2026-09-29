import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Clock, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">FixMate</span>
            </div>
            <p className="text-sm text-slate-400">
              Trusted help. Right when you need it. FixMate connects verified local technicians with homeowners for seamless maintenance and repair.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Background Verified Pros
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Top Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/services?category=electrician" className="hover:text-white transition-colors">Electrician Services</Link></li>
              <li><Link to="/services?category=plumbing" className="hover:text-white transition-colors">Plumbing & Leaks</Link></li>
              <li><Link to="/services?category=ac-repair" className="hover:text-white transition-colors">Air Conditioner Jet Clean</Link></li>
              <li><Link to="/services?category=home-cleaning" className="hover:text-white transition-colors">Deep Home Sanitization</Link></li>
              <li><Link to="/services?category=carpenter" className="hover:text-white transition-colors">Carpentry & Assembly</Link></li>
            </ul>
          </div>

          {/* Col 3: For Providers */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Professionals</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/provider/dashboard" className="hover:text-white transition-colors">Provider Dashboard</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Marketplace Standards</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Verification Requirements</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Verification Portal</Link></li>
            </ul>
          </div>

          {/* Col 4: Trust Guarantee */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">FixMate Guarantee</h4>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold">
                <Award className="w-4 h-4" />
                Service Quality Warranty
              </div>
              <p className="text-slate-400">
                Every booking comes with a 30-day service warranty and guaranteed transparent pricing.
              </p>
            </div>
            <div className="text-[11px] text-slate-500">
              * Note: Demonstrative application environment. Sample profiles and ratings are curated for system preview.
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>© {new Date().getFullYear()} FixMate Technologies Inc. All rights reserved.</div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for trusted home care
          </div>
        </div>
      </div>
    </footer>
  );
};
