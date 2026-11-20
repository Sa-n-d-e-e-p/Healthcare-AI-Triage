import React, { useEffect, useState } from 'react';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  UserPlus, 
  Stethoscope, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Bell,
  User,
  Sparkles,
  FileText
} from 'lucide-react';

function HumanizedEventCard({ event, doctors }) {
  let data = null;
  if (event.payloadJson) {
    try {
      data = typeof event.payloadJson === 'string' ? JSON.parse(event.payloadJson) : event.payloadJson;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
    } catch (e) {
      data = null;
    }
  }

  const doctor = data && data.doctorId ? doctors.find(d => String(d.id) === String(data.doctorId)) : null;

  return (
    <div className="p-4 hover:bg-slate-50/60 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[11px] uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200 shadow-2xs">
            {event.type || 'SYSTEM_EVENT'}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-slate-700">
            {event.type === 'APPOINTMENT_BOOKED' ? 'Consultation Confirmed' : 'Notification Dispatched'}
          </span>
        </div>
        <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
          Event ID #{event.id}
        </span>
      </div>

      {data ? (
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {data.createdBy && (
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-500 font-medium">Patient:</span>
                <span className="font-bold text-slate-900 truncate" title={data.createdBy}>{data.createdBy}</span>
              </div>
            )}
            {data.doctorId && (
              <div className="flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                <span className="text-slate-500 font-medium">Physician:</span>
                <span className="font-bold text-indigo-700 truncate">
                  {doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : `Doctor #${data.doctorId}`}
                  {doctor?.specialization && <span className="text-[10px] text-slate-400 font-normal ml-1">({doctor.specialization})</span>}
                </span>
              </div>
            )}
            {data.scheduledAt && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="text-slate-500 font-medium">Schedule:</span>
                <span className="font-bold text-slate-800">
                  {new Date(data.scheduledAt).toLocaleString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            )}
            {data.appointmentId && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-500 font-medium">Appt ID:</span>
                <span className="font-mono font-bold text-emerald-700">#{data.appointmentId}</span>
              </div>
            )}
            {data.symptomCheckId && (
              <div className="flex items-center gap-2 sm:col-span-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                <span className="text-slate-500 font-medium">AI Triage Context:</span>
                <span className="font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Referral Ref #{data.symptomCheckId.slice(0, 8)}... (Clinical AI Calibration)
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-medium">
          {event.payloadJson ? event.payloadJson.replace(/[{}"\\]/g, ' ') : 'No additional metadata logged.'}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating a new doctor
  const [docEmail, setDocEmail] = useState('');
  const [docPassword, setDocPassword] = useState('DocPass@123');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [specialization, setSpecialization] = useState('Cardiology');
  const [phone, setPhone] = useState('+1-555-0155');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsRes, apptsRes, notifRes] = await Promise.all([
        apiClient.get('/api/profiles/doctors').catch(() => ({ data: [] })),
        apiClient.get('/api/appointments').catch(() => ({ data: [] })),
        apiClient.get('/api/notify').catch(() => ({ data: [] }))
      ]);
      setDoctors(docsRes.data);
      setAppointments(apptsRes.data);
      setNotifications(notifRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMsg(null);
    try {
      // 1. Create doctor account in auth-service
      await apiClient.post('/api/admin/users/doctors', {
        email: docEmail,
        password: docPassword
      });

      // 2. Create doctor profile in profile-service
      await apiClient.post('/api/profiles/doctors', {
        firstName,
        lastName,
        specialization,
        email: docEmail,
        phone
      });

      setMsg({ type: 'success', text: `Dr. ${firstName} ${lastName} successfully registered with specialization in ${specialization}!` });
      setDocEmail('');
      setFirstName('');
      setLastName('');
      loadData();
    } catch (err) {
      const errorText = err.response?.data?.message || err.message;
      setMsg({ type: 'error', text: `Failed to create doctor: ${errorText}` });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Executive Administration
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Clinic Admin Console</h1>
          <p className="text-sm text-slate-500 mt-1">Manage specialist staff credentials, patient consults, and system health</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Physicians</p>
            <p className="text-3xl font-black text-slate-900 mt-2">{doctors.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Consultations</p>
            <p className="text-3xl font-black text-blue-600 mt-2">{appointments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dispatched Events</p>
            <p className="text-3xl font-black text-teal-600 mt-2">{notifications.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Security Clearance</p>
            <p className="text-3xl font-black text-purple-600 mt-2">ADMIN</p>
          </div>
        </div>

        {/* Create Doctor Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-600" />
            Onboard New Specialist Physician
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Provisions a DOCTOR account in Auth Service and synchronizes physician profile into Profile Service.
          </p>

          {msg && (
            <div className={`mb-6 p-3.5 rounded-xl text-sm flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateDoctor} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email (Login) *</label>
                <input
                  type="email"
                  required
                  placeholder="doc@clinic.org"
                  value={docEmail}
                  onChange={(e) => setDocEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Specialization *</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={docPassword}
                  onChange={(e) => setDocPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {creating ? 'Creating Doctor...' : 'Provision Doctor'}
            </button>
          </form>
        </div>

        {/* Doctor List */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-base">Current Medical Staff</h3>
            <span className="text-xs text-slate-500">{doctors.length} Doctors</span>
          </div>

          <div className="divide-y divide-slate-100">
            {doctors.map(d => (
              <div key={d.id} className="p-4 flex justify-between items-center text-sm">
                <div>
                  <p className="font-bold text-slate-900">Dr. {d.firstName} {d.lastName}</p>
                  <p className="text-xs text-slate-500">{d.email}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  {d.specialization}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Notification & Event Audit Log */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600" />
              Real-Time Audit & Event Notifications Stream
            </h3>
            <span className="text-xs text-slate-500">{notifications.length} Events Logged</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No events dispatched yet.</div>
            ) : (
              notifications.map((n, idx) => (
                <HumanizedEventCard key={n.id || idx} event={n} doctors={doctors} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}