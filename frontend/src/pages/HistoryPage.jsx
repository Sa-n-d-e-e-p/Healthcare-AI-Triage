import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api';
import { 
  History, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

const likelihoodBadge = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/api/history');
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this clinical check from your history?')) return;
    try {
      await apiClient.delete(`/api/history/${id}`);
      setHistory(history.filter(h => h.id !== id));
    } catch (err) {
      alert('Failed to delete history item.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">AI Triage History</h1>
            <p className="text-sm text-slate-500 mt-1">Review previous symptom evaluations and condition probabilities</p>
          </div>

          <Link
            to="/symptoms"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            New Assessment
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            <Clock className="w-8 h-8 animate-spin mx-auto mb-3 text-blue-600" />
            <p className="text-sm font-semibold">Loading clinical history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Assessment History</h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">You haven't run any AI symptom assessments yet.</p>
            <Link to="/symptoms" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm">
              Start First Check
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const isExpanded = expandedId === item.id;
              const dateStr = item.created_at ? new Date(item.created_at).toLocaleString() : 'Recent';
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {item.is_emergency && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Emergency Flagged
                          </span>
                        )}
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                          {item.recommended_specialty || 'General Medicine'}
                        </span>
                        <span className="text-xs text-slate-400">• {dateStr}</span>
                      </div>

                      <p className="text-sm font-bold text-slate-800 line-clamp-2">
                        {item.symptoms}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        to={`/book?specialty=${encodeURIComponent(item.recommended_specialty)}&symptomCheckId=${item.id}&reason=${encodeURIComponent('Referral from AI Triage: ' + item.symptoms.slice(0, 40))}`}
                        className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold px-3 py-1.5 rounded-lg border border-teal-200 flex items-center gap-1 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book
                      </Link>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evaluated Conditions</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.conditions?.map((c, i) => (
                            <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                              <div className="flex justify-between font-bold text-slate-800 mb-1">
                                <span>{c.name}</span>
                                <span className="uppercase text-[10px] text-blue-600">{c.likelihood}</span>
                              </div>
                              <p className="text-slate-600">{c.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {item.next_steps && (
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Next Steps</p>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-0.5">
                            {item.next_steps.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
