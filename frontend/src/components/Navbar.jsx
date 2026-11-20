import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Stethoscope, 
  Calendar, 
  Clock, 
  User, 
  ShieldCheck, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X,
  Sparkles,
  History
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group focus:outline-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Omni<span className="text-blue-600">Health</span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                  AI Triage
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links - Evenly Spaced & No Wrap */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            {(!user || user.role === 'PATIENT') && (
              <Link
                to="/symptoms"
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive('/symptoms')
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                AI Symptom Checker
              </Link>
            )}

            <Link
              to="/doctors"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
                isActive('/doctors')
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              <Stethoscope className="w-4 h-4 flex-shrink-0" />
              {user?.role === 'DOCTOR' ? 'Colleagues' : user?.role === 'ADMIN' ? 'Staff Directory' : 'Doctors'}
            </Link>

            {user?.role === 'PATIENT' && (
              <>
                <Link
                  to="/book"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive('/book')
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  Book Visit
                </Link>

                <Link
                  to="/my-appointments"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive('/my-appointments')
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  My Appointments
                </Link>

                <Link
                  to="/history"
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
                    isActive('/history')
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/60'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  <History className="w-4 h-4 flex-shrink-0" />
                  Triage History
                </Link>
              </>
            )}

            {user?.role === 'DOCTOR' && (
              <Link
                to="/doctor/dashboard"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive('/doctor/dashboard')
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                }`}
              >
                <Stethoscope className="w-4 h-4 flex-shrink-0" />
                Doctor Console
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs xl:text-sm font-semibold whitespace-nowrap transition-colors ${
                  isActive('/admin/dashboard')
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                Admin Console
              </Link>
            )}
          </div>

          {/* Right Action / Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors whitespace-nowrap shadow-2xs"
                  title="View Profile Details"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {user.email[0].toUpperCase()}
                  </div>
                  <div className="text-left text-xs whitespace-nowrap">
                    <p className="font-bold text-slate-800 leading-tight truncate max-w-[130px]">{user.email}</p>
                    <span className="font-extrabold text-[10px] text-blue-600 tracking-wider uppercase">
                      {user.role === 'DOCTOR' ? 'PHYSICIAN' : user.role === 'ADMIN' ? 'ADMINISTRATOR' : 'PATIENT'}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-xs xl:text-sm font-semibold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 text-xs xl:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-xs transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {(!user || user.role === 'PATIENT') && (
            <Link
              to="/symptoms"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50"
            >
              AI Symptom Checker
            </Link>
          )}
          <Link
            to="/doctors"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50"
          >
            {user?.role === 'DOCTOR' ? 'Colleagues' : user?.role === 'ADMIN' ? 'Staff Directory' : 'Doctors'}
          </Link>
          {user?.role === 'PATIENT' && (
            <>
              <Link
                to="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50"
              >
                Book Visit
              </Link>
              <Link
                to="/my-appointments"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50"
              >
                My Appointments
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md font-medium text-slate-700 hover:bg-slate-50"
              >
                Triage History
              </Link>
            </>
          )}
          {user?.role === 'DOCTOR' && (
            <Link
              to="/doctor/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-indigo-700 hover:bg-indigo-50"
            >
              Doctor Console
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md font-medium text-purple-700 hover:bg-purple-50"
            >
              Admin Console
            </Link>
          )}
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex justify-between items-center px-3 py-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-semibold text-slate-700 hover:text-blue-600"
                >
                  Profile: {user.email}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center text-sm py-2 rounded border border-slate-300 font-semibold"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 text-center text-sm py-2 rounded bg-blue-600 text-white font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
