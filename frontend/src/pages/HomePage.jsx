import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  Stethoscope, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  HeartPulse, 
  Users, 
  Clock,
  Lock
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white pt-20 pb-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-300 mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            Intelligent Health Triage & Care Management
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Intelligent Medical Insights & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
              Instant Specialist Care
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Describe your symptoms to receive instant health assessments, condition risk insights, and connect directly with verified medical specialists—all in one secure platform.
          </p>

          {/* Action CTAs based on Role */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {user?.role === 'DOCTOR' ? (
              <>
                <Link
                  to="/doctor/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all"
                >
                  <Stethoscope className="w-5 h-5" />
                  Doctor Dashboard
                </Link>
                <Link
                  to="/doctors"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-6 py-3.5 rounded-xl font-semibold text-base transition-colors"
                >
                  <Users className="w-5 h-5 text-indigo-400" />
                  Staff Directory
                </Link>
              </>
            ) : user?.role === 'ADMIN' ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-purple-600 hover:bg-purple-500 text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-purple-500/30 hover:scale-105 transition-all"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Admin Console
                </Link>
                <Link
                  to="/doctors"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-6 py-3.5 rounded-xl font-semibold text-base transition-colors"
                >
                  <Users className="w-5 h-5 text-purple-400" />
                  Doctor Directory
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/symptoms"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-xl font-bold text-base shadow-lg shadow-blue-500/30 hover:scale-105 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Check Symptoms Now
                </Link>

                <Link
                  to="/doctors"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 px-6 py-3.5 rounded-xl font-semibold text-base transition-colors"
                >
                  <Stethoscope className="w-5 h-5 text-blue-400" />
                  Browse Specialists
                </Link>
              </>
            )}
          </div>

          {/* Clinical Value Stats Banner */}
          <div className="mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-left">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <p className="text-2xl font-bold text-blue-400">24/7 Triage</p>
              <p className="text-xs text-slate-400 mt-0.5">Instant symptom guidance anytime</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <p className="text-2xl font-bold text-teal-400">Board Certified</p>
              <p className="text-xs text-slate-400 mt-0.5">Verified clinical specialists</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <p className="text-2xl font-bold text-indigo-400">Direct Booking</p>
              <p className="text-xs text-slate-400 mt-0.5">Seamless appointment scheduling</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <p className="text-2xl font-bold text-emerald-400">100% Secure</p>
              <p className="text-xs text-slate-400 mt-0.5">Private & confidential care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Care Workflow */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Complete Closed-Loop Patient Care
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Traditional checkers leave you stranded with confusing search results. OmniHealth assesses your clinical risk and connects you directly with the right specialist with pre-populated medical intake.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-blue-600" />
                Symptom Assessment
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Describe your symptoms naturally. Our triage engine analyzes age, gender, and pre-existing conditions to produce conditioned likelihood rankings and immediate emergency risk alerts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-indigo-600" />
                Specialist Matching
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The platform matches your clinical assessment to the exact medical specialty required (Cardiology, Dermatology, Neurology, General Medicine) for targeted consultations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                Physician Pre-Intake
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Doctors view your upcoming appointment alongside the clinical triage summary and conditions breakdown, improving consultation efficiency and diagnostic accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Pillars for Healthcare Roles */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Dedicated Care for Every Health Journey</h2>
            <p className="text-sm text-slate-500 mt-2">Designed to empower patients, physicians, and clinic teams</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* For Patients */}
            <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">For Patients</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Instant, confidential symptom assessments, personalized risk guidance, and easy booking with certified physicians.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-3 border-t border-blue-200/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  24/7 AI-guided symptom checks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Direct specialist appointment booking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  Personalized consultation history
                </li>
              </ul>
            </div>

            {/* For Doctors */}
            <div className="p-6 rounded-2xl border border-indigo-200 bg-indigo-50/40 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">For Doctors</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Structured patient intake dossiers and symptom assessments delivered prior to appointments to enhance consultation time.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-3 border-t border-indigo-200/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  Pre-consultation clinical dossiers
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  Structured patient appointment queue
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  Optimized patient-doctor encounter flow
                </li>
              </ul>
            </div>

            {/* For Healthcare Administration */}
            <div className="p-6 rounded-2xl border border-teal-200 bg-teal-50/40 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">For Health Systems</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Strict role-based governance, verified physician management, and secure clinic coordination across specialties.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 pt-3 border-t border-teal-200/60">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Role-based clinical access governance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Verified medical staff onboarding
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  Encrypted, confidential health records
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
