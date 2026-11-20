import React from 'react';
import { ShieldCheck, Heart, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-bold text-white">OmniHealth</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering patients and physicians with intelligent pre-consultation triage, structured health insights, and direct specialist care.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Patient Services</h4>
            <ul className="text-xs space-y-2 text-slate-400">
              <li>
                <Link to="/symptoms" className="hover:text-blue-400 transition-colors">
                  • AI Symptom Assessment
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-blue-400 transition-colors">
                  • Find Board-Certified Specialists
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-blue-400 transition-colors">
                  • Schedule an Appointment
                </Link>
              </li>
              <li>
                <span className="text-slate-500">• 24/7 Digital Health Guidance</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Clinical Disclaimer</h4>
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
              OmniHealth is an educational pre-consultation and triage support system. It does not provide definitive medical diagnoses. In acute emergencies, call 911 or your local emergency number immediately.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} OmniHealth. Secure & Confidential Digital Health Platform.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Dedicated to <Heart className="w-3.5 h-3.5 text-red-500 inline fill-red-500" /> modern patient care
          </p>
        </div>
      </div>
    </footer>
  );
}
