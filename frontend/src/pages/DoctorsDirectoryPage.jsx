import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Calendar, Search, Filter, Mail, Phone, ArrowRight, UserCheck, Shield } from 'lucide-react';

export default function DoctorsDirectoryPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');

  useEffect(() => {
    apiClient.get('/api/profiles/doctors')
      .then(res => setDoctors(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const specialties = Array.from(new Set(doctors.map(d => d.specialization).filter(Boolean)));

  const filtered = doctors.filter(d => {
    const nameMatch = `${d.firstName} ${d.lastName}`.toLowerCase().includes(search.toLowerCase());
    const specMatch = selectedSpec ? d.specialization === selectedSpec : true;
    return nameMatch && specMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <Stethoscope className="w-3.5 h-3.5" />
            Clinic Medical Staff
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Physicians & Specialists</h1>
          <p className="text-sm text-slate-500 mt-2">
            Explore our board-certified medical doctors and schedule a consultation tailored to your AI triage assessment.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search doctor by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div className="sm:w-64">
            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-white"
            >
              <option value="">All Specialties</option>
              {specialties.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading physicians...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Doctors Found</h3>
            <p className="text-sm text-slate-500 mt-1">Try broadening your search or resetting the specialty filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                      {doc.firstName[0]}{doc.lastName[0]}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {doc.specialization}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Dr. {doc.firstName} {doc.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {doc.email}
                  </p>
                  {doc.phone && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {doc.phone}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  {(!user || user.role === 'PATIENT') ? (
                    <Link
                      to={`/book?specialty=${encodeURIComponent(doc.specialization)}`}
                      className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-xl transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Book Consultation
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="w-full py-2.5 px-3 bg-slate-100 rounded-xl text-center text-xs font-semibold text-slate-500 border border-slate-200">
                      {user.role === 'DOCTOR' ? 'Colleague Directory' : 'Staff Directory'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
