import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  User, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  X,
  Stethoscope,
  Activity
} from 'lucide-react';

export default function MyAppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctorsMap, setDoctorsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTriage, setSelectedTriage] = useState(null);
  const [loadingTriage, setLoadingTriage] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apptsRes, docsRes] = await Promise.all([
        apiClient.get('/api/appointments?mine=true'),
        apiClient.get('/api/profiles/doctors').catch(() => ({ data: [] }))
      ]);

      setAppointments(apptsRes.data);

      const map = {};
      docsRes.data.forEach(d => {
        map[d.id] = d;
      });
      setDoctorsMap(map);
    } catch (err) {
      setError('Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await apiClient.delete(`/api/appointments/${id}`);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      alert('Failed to cancel appointment.');
    }
  };

  const handleViewTriage = async (checkId) => {
    setLoadingTriage(true);
    try {
      const res = await apiClient.get(`/api/symptoms/appointment-context/${checkId}`);
      setSelectedTriage(res.data);
    } catch (err) {
      alert('Clinical triage record could not be loaded.');
    } finally {
      setLoadingTriage(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Appointments</h1>
            <p className="text-sm text-slate-500 mt-1">Manage scheduled visits and attached AI intake dossiers</p>
          </div>

          <Link
            to="/book"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4" />
            Book New Visit
          </Link>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
            <p className="text-sm font-semibold">Loading your medical appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Scheduled Appointments</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              You do not have any active clinical consultations booked at this time.
            </p>
            <Link
              to="/symptoms"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl"
            >
              <Sparkles className="w-4 h-4" />
              Check Symptoms with AI
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => {
              const doc = doctorsMap[appt.doctorId];
              const dateObj = new Date(appt.scheduledAt);
              return (
                <div
                  key={appt.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-[10px] uppercase font-extrabold leading-none">
                        {dateObj.toLocaleString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black leading-tight">
                        {dateObj.getDate()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-slate-900">
                          {doc ? `Dr. ${doc.firstName} ${doc.lastName}` : `Doctor #${appt.doctorId}`}
                        </h3>
                        {doc?.specialization && (
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                            {doc.specialization}
                          </span>
                        )}
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                          {appt.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({appt.durationMinutes} mins)
                      </p>

                      <p className="text-sm text-slate-700 mt-2 font-medium">
                        Reason: {appt.reason}
                      </p>

                      {/* Attached AI Triage Pill */}
                      {appt.symptomCheckId && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleViewTriage(appt.symptomCheckId)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg transition-colors"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            View Attached AI Pre-Triage Dossier
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <button
                      onClick={() => handleCancel(appt.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Cancel Appointment"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: View AI Triage Details */}
        {selectedTriage && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-lg">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  AI Clinical Pre-Triage Record
                </div>
                <button
                  onClick={() => setSelectedTriage(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-sm">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Reported Symptoms</p>
                  <p className="font-semibold text-slate-800">{selectedTriage.symptoms}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evaluated Conditions</p>
                  <div className="space-y-2">
                    {selectedTriage.conditions?.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white">
                        <div className="flex justify-between font-bold text-slate-900 text-sm">
                          <span>{c.name}</span>
                          <span className="text-xs uppercase font-extrabold text-blue-600">{c.likelihood}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTriage.next_steps && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Clinical Next Steps</p>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                      {selectedTriage.next_steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-right">
                <button
                  onClick={() => setSelectedTriage(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
