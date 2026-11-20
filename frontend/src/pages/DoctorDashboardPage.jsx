import React, { useEffect, useState } from 'react';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  User, 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Activity,
  AlertTriangle
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTriage, setSelectedTriage] = useState(null);
  const [loadingTriage, setLoadingTriage] = useState(false);

  useEffect(() => {
    loadDoctorAppointments();
  }, []);

  const loadDoctorAppointments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/appointments?mine=true');
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiClient.patch(`/api/appointments/${id}/status`, { status });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) {
      alert('Failed to update consultation status.');
    }
  };

  const handleReviewDossier = async (checkId) => {
    setLoadingTriage(true);
    try {
      const res = await apiClient.get(`/api/symptoms/appointment-context/${checkId}`);
      setSelectedTriage(res.data);
    } catch (err) {
      alert('Could not retrieve AI intake dossier.');
    } finally {
      setLoadingTriage(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              Clinical Consultation Queue
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Doctor Console</h1>
            <p className="text-sm text-slate-500 mt-1">Logged in as {user?.email} • Review incoming appointments and pre-intake AI notes</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1.5 rounded-lg border border-emerald-300">
              ● Active Duty
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Patients</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{appointments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Pre-Intake Files</p>
            <p className="text-3xl font-black text-indigo-600 mt-2">
              {appointments.filter(a => a.symptomCheckId).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Consultations</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">
              {appointments.filter(a => a.status === 'COMPLETED').length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-600" />
            <p className="text-sm font-semibold">Loading patient appointment queue...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Consultations Scheduled</h3>
            <p className="text-sm text-slate-500 mt-1">You currently have no patient appointments assigned.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Upcoming Consultations</h3>
              <span className="text-xs text-slate-500">{appointments.length} Records</span>
            </div>

            <div className="divide-y divide-slate-100">
              {appointments.map((appt) => {
                const dateObj = new Date(appt.scheduledAt);
                return (
                  <div key={appt.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[10px] uppercase font-extrabold leading-none">
                          {dateObj.toLocaleString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-lg font-black leading-tight">
                          {dateObj.getDate()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-bold text-slate-900">
                            Patient: {appt.createdByEmail || `Patient #${appt.patientId}`}
                          </h4>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                            appt.status === 'COMPLETED' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {appt.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
                          {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({appt.durationMinutes} mins)
                        </p>

                        <p className="text-sm text-slate-700 mt-2 font-medium">
                          Clinical Reason: <span className="font-semibold">{appt.reason}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                      {appt.symptomCheckId ? (
                        <button
                          onClick={() => handleReviewDossier(appt.symptomCheckId)}
                          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-500/20 transition-all"
                        >
                          <Sparkles className="w-4 h-4" />
                          Review AI Dossier
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No AI intake</span>
                      )}

                      {appt.status !== 'COMPLETED' ? (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'COMPLETED')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Mark Completed
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal: Doctor Reviews AI Pre-Intake Dossier */}
        {selectedTriage && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Patient AI Pre-Consultation Dossier
                  </h3>
                  <p className="text-xs text-slate-500">Evaluated by OmniHealth Clinical Engine</p>
                </div>
                <button
                  onClick={() => setSelectedTriage(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedTriage.is_emergency && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-xs font-bold">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <span>ALERT: AI engine detected potential acute emergency indicators during intake.</span>
                </div>
              )}

              <div className="space-y-4 text-sm">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Chief Complaint</p>
                  <p className="font-semibold text-slate-800">{selectedTriage.symptoms}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Differential Diagnoses & Likelihood</p>
                  <div className="space-y-2">
                    {selectedTriage.conditions?.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white">
                        <div className="flex justify-between font-bold text-slate-900 text-sm">
                          <span>{c.name}</span>
                          <span className="text-xs uppercase font-extrabold text-indigo-600">{c.likelihood}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTriage.next_steps && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">AI Suggested Action Plan</p>
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm"
                >
                  Done Reviewing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
