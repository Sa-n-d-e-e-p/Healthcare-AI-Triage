import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft,
  User,
  FileText
} from 'lucide-react';

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const preselectedSpecialty = queryParams.get('specialty') || '';
  const symptomCheckId = queryParams.get('symptomCheckId') || '';
  const initialReason = queryParams.get('reason') || '';

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [patientId, setPatientId] = useState('1');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(30);
  const [reason, setReason] = useState(initialReason || 'Routine consultation and health review');
  const [filterSpecialty, setFilterSpecialty] = useState(preselectedSpecialty);

  const [loading, setLoading] = useState(false);
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    apiClient.get('/api/profiles/doctors')
      .then(res => {
        setDoctors(res.data);
        if (res.data.length > 0) {
          // If we have preselected specialty, find matching doctor
          if (preselectedSpecialty) {
            const match = res.data.find(d => 
              d.specialization?.toLowerCase() === preselectedSpecialty.toLowerCase()
            );
            if (match) {
              setSelectedDoctorId(match.id.toString());
            } else {
              setSelectedDoctorId(res.data[0].id.toString());
            }
          } else {
            setSelectedDoctorId(res.data[0].id.toString());
          }
        }
      })
      .catch(err => {
        setStatusMsg({ type: 'error', text: 'Failed to load doctors directory.' });
      })
      .finally(() => setFetchingDocs(false));
  }, [preselectedSpecialty]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl shadow-md text-center border border-slate-200">
        <Stethoscope className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Sign In to Book</h2>
        <p className="text-sm text-slate-500 mb-6">You need an active patient account to book an appointment.</p>
        <Link to="/login" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
          Sign In Now
        </Link>
      </div>
    );
  }

  if (user.role !== 'PATIENT') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl shadow-md text-center border border-slate-200">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Patient Access Only</h2>
        <p className="text-sm text-slate-500">Only registered patients can book clinical consultations.</p>
      </div>
    );
  }

  const filteredDoctors = filterSpecialty
    ? doctors.filter(d => d.specialization?.toLowerCase() === filterSpecialty.toLowerCase())
    : doctors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setStatusMsg({ type: 'error', text: 'Please select a physician.' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);

    try {
      const scheduledIso = new Date(`${date}T${time}:00Z`).toISOString();
      await apiClient.post('/api/appointments', {
        patientId: Number(patientId),
        doctorId: Number(selectedDoctorId),
        scheduledAt: scheduledIso,
        durationMinutes: Number(duration),
        reason: reason,
        symptomCheckId: symptomCheckId || null,
        aiTriageSummary: initialReason || null
      });

      setStatusMsg({
        type: 'success',
        text: 'Appointment successfully booked! Notification has been dispatched to the clinic.'
      });

      setTimeout(() => {
        navigate('/my-appointments');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.detail || err.response?.data?.error || err.message;
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Doctors
        </Link>

        {/* AI Referral Banner if arrived from Symptom Checker */}
        {symptomCheckId && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-start gap-3.5 shadow-md">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300">AI Clinical Referral Active</p>
              <p className="text-sm font-semibold mt-0.5">
                Specialty: <span className="underline decoration-teal-400">{preselectedSpecialty || 'General Care'}</span>
              </p>
              <p className="text-xs text-blue-200 mt-1">
                Your AI triage results are linked to this booking for your doctor to review.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Book Consultation</h1>
              <p className="text-xs text-slate-500">Schedule an appointment with a clinic specialist</p>
            </div>
          </div>

          {statusMsg && (
            <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Specialty Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Filter by Specialty
              </label>
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none bg-slate-50"
              >
                <option value="">All Specialties</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="General Medicine">General Medicine</option>
              </select>
            </div>

            {/* Select Doctor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Physician *
              </label>
              {fetchingDocs ? (
                <div className="p-3 text-sm text-slate-500">Loading clinic physicians...</div>
              ) : (
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  {filteredDoctors.length === 0 ? (
                    <option value="">No doctors found for this specialty</option>
                  ) : (
                    filteredDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        Dr. {doc.firstName} {doc.lastName} — {doc.specialization} ({doc.email})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* Date, Time, Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Time (UTC) *
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Duration (min)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                </select>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Consultation Reason / Clinical Notes *
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State your main concern, symptoms, or follow-up goals..."
                className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedDoctorId}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {loading ? 'Confirming with Schedule...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
