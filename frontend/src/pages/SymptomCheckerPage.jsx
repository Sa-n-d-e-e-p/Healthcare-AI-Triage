import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Stethoscope, 
  Calendar, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock,
  UserCheck
} from 'lucide-react';

const exampleSymptoms = [
  {
    label: "Skin & Allergy",
    text: "Red itchy rash with raised bumps on forearms after using a new detergent for 3 days",
    category: "Dermatology"
  },
  {
    label: "Acute Emergency",
    text: "Crushing chest pain radiating down left arm, shortness of breath, and cold sweat",
    category: "Emergency / Cardiology"
  },
  {
    label: "Head & Neurological",
    text: "Severe throbbing headache on right side with sensitivity to light and nausea",
    category: "Neurology"
  },
  {
    label: "Joint & Muscular",
    text: "Persistent lower back pain and stiffness after lifting heavy equipment yesterday",
    category: "Orthopedics"
  },
  {
    label: "General Illness",
    text: "Mild fever 38.2°C, fatigue, sore throat and dry cough for the past 48 hours",
    category: "General Medicine"
  }
];

const likelihoodStyles = {
  high: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500', badge: 'High Probability' },
  medium: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500', badge: 'Moderate Probability' },
  low: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500', badge: 'Low Probability' }
};

export default function SymptomCheckerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patientProfile, setPatientProfile] = useState(null);

  // Fetch patient medical profile to show personalization status
  useEffect(() => {
    if (user) {
      apiClient.get('/api/user/profile')
        .then(res => setPatientProfile(res.data))
        .catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      setError('Please provide a descriptive explanation of what you are experiencing.');
      return;
    }

    if (!user) {
      // Redirect to login if guest
      navigate('/login?redirect=/symptoms');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await apiClient.post('/api/symptoms/check', { symptoms });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to complete AI triage assessment. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setResult(null);
    setError('');
  };

  const handleBookWithSpecialist = () => {
    if (!result) return;
    const topCondition = result.conditions[0]?.name || 'Clinical Evaluation';
    const params = new URLSearchParams({
      specialty: result.recommended_specialty || 'General Medicine',
      symptomCheckId: result.id,
      reason: `AI Triage: ${topCondition} (Symptoms: ${result.symptoms.slice(0, 60)}...)`
    });
    navigate(`/book?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-200 mb-4 border border-white/20">
            <Activity className="w-3.5 h-3.5" />
            AI Clinical Decision Support
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Clinical AI Symptom Checker
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto">
            Input your symptoms to receive instant condition likelihood assessments, emergency triage analysis, and automatic specialist matching.
          </p>

          {patientProfile && (patientProfile.age > 0 || patientProfile.pre_existing_conditions) && (
            <div className="mt-4 inline-flex items-center gap-2 bg-blue-950/60 border border-blue-400/40 rounded-lg px-3 py-1.5 text-xs text-blue-200">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>
                Personalized for: <strong>{patientProfile.age} y/o {patientProfile.gender}</strong>
                {patientProfile.pre_existing_conditions && ` • History: ${patientProfile.pre_existing_conditions}`}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Main Input Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                Describe Your Symptoms
              </label>
              {symptoms && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            <textarea
              rows={4}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Sharp pain in the lower right abdomen since this morning, accompanied by mild fever and loss of appetite..."
              className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all placeholder:text-slate-400 resize-none"
            />

            {/* Quick Example Pills */}
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 mb-2">Or select a clinical test case:</p>
              <div className="flex flex-wrap gap-2">
                {exampleSymptoms.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSymptoms(ex.text)}
                    className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                  >
                    <span className="font-bold text-slate-900">{ex.label}:</span>
                    <span className="truncate max-w-[200px]">{ex.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>AI Clinical Triage • Confidential & Secure</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    Analyzing with Clinical AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Symptoms
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Triage Results Display */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* EMERGENCY ALERT BANNER (If Acute) */}
            {result.is_emergency && (
              <div className="emergency-pulse bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl p-6 shadow-xl border-2 border-red-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold uppercase tracking-wide">
                      Critical Clinical Warning: Potential Emergency
                    </h3>
                    <p className="text-sm text-red-100 mt-1 max-w-xl">
                      Symptoms indicate a potentially life-threatening or acute condition requiring immediate emergency medical evaluation. Call emergency services (911) or proceed to the nearest emergency department right now.
                    </p>
                  </div>
                </div>

                <a
                  href="tel:911"
                  className="bg-white text-red-700 font-extrabold px-6 py-3 rounded-xl text-sm shadow-lg hover:bg-red-50 flex items-center gap-2 whitespace-nowrap self-stretch sm:self-auto justify-center"
                >
                  <AlertCircle className="w-4 h-4" />
                  Call Emergency (911)
                </a>
              </div>
            )}

            {/* Smart Specialist Recommendation & 1-Click Action */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-blue-500/30 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full">
                  Recommended Clinical Specialty
                </span>
                <h3 className="text-2xl font-black mt-2 text-white flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-teal-300" />
                  {result.recommended_specialty}
                </h3>
                <p className="text-sm text-blue-200 mt-1 max-w-xl">
                  Based on your symptoms and clinical probability, a consultation with a <strong>{result.recommended_specialty}</strong> specialist is recommended.
                </p>
              </div>

              <button
                onClick={handleBookWithSpecialist}
                className="w-full md:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-sm shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Book {result.recommended_specialty} Specialist
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Condition Breakdown Cards */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Possible Health Conditions
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  Engine: {result.engine || 'Gemini 2.5 Flash'}
                </span>
              </div>

              <div className="space-y-4">
                {result.conditions.map((cond, idx) => {
                  const style = likelihoodStyles[cond.likelihood?.toLowerCase()] || likelihoodStyles.medium;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-xl border ${style.border} ${style.bg} transition-all`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h4 className="text-base font-bold text-slate-900">{cond.name}</h4>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold ${style.text} bg-white border ${style.border}`}>
                          <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                          {style.badge}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{cond.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Actionable Next Steps */}
              {result.next_steps && result.next_steps.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Recommended Next Steps
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.next_steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-slate-700">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medical Disclaimer */}
              <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  {result.disclaimer || 'This analysis is for educational and clinical triage assistance only. It is not a clinical diagnosis. Always consult a licensed medical provider.'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
