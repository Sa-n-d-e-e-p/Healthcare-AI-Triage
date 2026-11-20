import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  ShieldCheck, 
  HeartPulse, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Phone, 
  Mail, 
  Award,
  ArrowRight,
  Activity,
  Layers,
  CalendarCheck
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();

  // Patient profile state
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('Female');
  const [preExisting, setPreExisting] = useState('');

  // Doctor profile state
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [docPhone, setDocPhone] = useState('');
  const [docSpecialization, setDocSpecialization] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (user.role === 'PATIENT') {
      apiClient.get('/api/user/profile')
        .then(res => {
          if (res.data) {
            if (res.data.age) setAge(res.data.age);
            if (res.data.gender) setGender(res.data.gender);
            if (res.data.pre_existing_conditions) setPreExisting(res.data.pre_existing_conditions);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (user.role === 'DOCTOR') {
      apiClient.get(`/api/profiles/doctors/by-email/${encodeURIComponent(user.email)}`)
        .then(res => {
          if (res.data) {
            setDoctorInfo(res.data);
            setDocPhone(res.data.phone || '');
            setDocSpecialization(res.data.specialization || '');
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      // ADMIN
      setLoading(false);
    }
  }, [user]);

  // Handle saving patient health profile
  const handleSavePatient = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await apiClient.post('/api/user/profile', {
        age: Number(age),
        gender,
        pre_existing_conditions: preExisting
      });
      setMsg({ type: 'success', text: 'Health profile updated! AI triage will now incorporate these medical demographics.' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update health profile.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle saving doctor profile updates
  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    if (!doctorInfo?.id) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await apiClient.put(`/api/profiles/doctors/${doctorInfo.id}`, {
        specialization: docSpecialization,
        phone: docPhone
      });
      setDoctorInfo(res.data);
      setMsg({ type: 'success', text: 'Physician credentials and contact details successfully saved!' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update physician profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-sm">
          <User className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Please Sign In</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">You need an active account to view your profile.</p>
          <Link to="/login" className="inline-block bg-blue-600 text-white font-bold px-5 py-2 rounded-xl text-xs">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* ==================== DOCTOR PROFILE VIEW ==================== */}
        {user.role === 'DOCTOR' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-xs">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
                  <Award className="w-3.5 h-3.5" />
                  Board-Certified Attending Physician
                </div>
                <h1 className="text-2xl font-black text-slate-900">
                  {doctorInfo ? `Dr. ${doctorInfo.firstName} ${doctorInfo.lastName}` : 'Physician Profile'}
                </h1>
                <p className="text-xs text-slate-500">{user.email} • ID #{doctorInfo?.id || 'Staff'}</p>
              </div>
            </div>

            {msg && (
              <div className={`mb-6 p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Specialization</p>
                <p className="text-base font-extrabold text-indigo-700 mt-1">
                  {doctorInfo?.specialization || 'General Practice'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Phone</p>
                <p className="text-base font-bold text-slate-800 mt-1">
                  {doctorInfo?.phone || '+1 (555) 0100'}
                </p>
              </div>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Activity className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-indigo-950 leading-relaxed">
                <strong>Specialist Practice Overview:</strong> As an attending clinician in the OmniHealth network, patients with matching AI triage assessments are routed directly to your schedule.
              </div>
            </div>

            <form onSubmit={handleSaveDoctor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={docSpecialization}
                    onChange={(e) => setDocSpecialization(e.target.value)}
                    placeholder="e.g. Cardiology, Neurology, General Medicine"
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Contact
                  </label>
                  <input
                    type="text"
                    value={docPhone}
                    onChange={(e) => setDocPhone(e.target.value)}
                    placeholder="e.g. +1-555-0155"
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-all"
                >
                  {saving ? 'Updating Credentials...' : 'Save Physician Details'}
                </button>
                <Link
                  to="/doctor/dashboard"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all"
                >
                  <CalendarCheck className="w-4 h-4 text-indigo-600" />
                  Doctor Console
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </form>
          </div>
        )}

        {/* ==================== ADMIN PROFILE VIEW ==================== */}
        {user.role === 'ADMIN' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 mb-1">
                  Executive Security Clearance
                </div>
                <h1 className="text-2xl font-black text-slate-900">System Administrator</h1>
                <p className="text-xs text-slate-500">{user.email} • Tier-1 Master Authorization</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Access Scope</p>
                <p className="text-sm font-extrabold text-purple-700 mt-1">Full Clinic Operations</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Audit Stream</p>
                <p className="text-sm font-extrabold text-teal-700 mt-1">Real-Time Event Bus</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Identity Management</p>
                <p className="text-sm font-extrabold text-blue-700 mt-1">Physician Provisioning</p>
              </div>
            </div>

            <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-4 mb-6">
              <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-700" />
                Administrative Operational Privileges
              </h4>
              <ul className="text-xs text-purple-950 space-y-1.5 mt-2 list-disc list-inside">
                <li>Register and issue cryptographic credentials for specialist physicians.</li>
                <li>Monitor live notification streams across appointment and triage microservices.</li>
                <li>Inspect cross-service API routes through Spring Cloud Gateway.</li>
                <li>Audit patient-doctor booking collisions and resolve scheduling disputes.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/admin/dashboard"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Open Executive Admin Console
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/doctors"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-all"
              >
                <Stethoscope className="w-4 h-4 text-purple-600" />
                Staff Directory
              </Link>
            </div>
          </div>
        )}

        {/* ==================== PATIENT PROFILE VIEW ==================== */}
        {user.role === 'PATIENT' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold shadow-xs">
                <User className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 mb-1">
                  Registered Patient Profile
                </div>
                <h1 className="text-2xl font-black text-slate-900">Personal Health Context</h1>
                <p className="text-xs text-slate-500">{user.email} • ID #{user.patientId || 'Patient'}</p>
              </div>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
              <HeartPulse className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Context-Aware AI Calibration:</strong> Your age, biological gender, and pre-existing medical history are securely passed into the Gemini AI clinical prompt to compute personalized triage risk and recommend the appropriate specialist.
              </span>
            </div>

            {msg && (
              <div className={`mb-6 p-3.5 rounded-xl text-sm flex items-center gap-2 ${
                msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{msg.text}</span>
              </div>
            )}

            <form onSubmit={handleSavePatient} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Biological Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other / Non-binary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pre-existing Conditions & Medical History
                </label>
                <textarea
                  rows={3}
                  value={preExisting}
                  onChange={(e) => setPreExisting(e.target.value)}
                  placeholder="e.g. Asthma, Type-2 Diabetes, Hypertension, Penicillin allergy..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Separate multiple conditions with commas.</p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all"
              >
                {saving ? 'Saving Profile...' : 'Save Health Profile'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}