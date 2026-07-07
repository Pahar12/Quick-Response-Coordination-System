import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, ShieldCheck, LayoutDashboard, CalendarDays } from 'lucide-react';

export default function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return (
      <div style={{ paddingTop: '64px' }} className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
        Loading profile...
      </div>
    );
  }

  const ROLE_CONFIG = {
    'Admin': { cls: 'badge badge-inprogress', label: 'Administrator' },
    'Responder': { cls: 'badge badge-dispatched', label: 'Emergency Responder' },
    'Citizen': { cls: 'badge badge-resolved', label: 'Citizen' },
  };
  const roleCfg = ROLE_CONFIG[user.role] || { cls: 'badge', label: user.role };

  const getDashboardLink = () => {
    if (user.role === 'Admin') return '/admin';
    if (user.role === 'Responder') return '/responder';
    return '/citizen';
  };

  const fields = [
    { icon: User, label: 'Full Name', value: user.name },
    { icon: Mail, label: 'Email Address', value: user.email },
    { icon: Phone, label: 'Phone Number', value: user.phone || 'Not provided' },
    { icon: ShieldCheck, label: 'Account Role', value: user.role },
  ];

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--surface-2)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem' }} className="space-y-5 animate-fadeIn">

        {/* Profile card header */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
        >
          {/* Blue banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              padding: '2rem 2rem 3.5rem',
              position: 'relative',
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-8 rounded-t-3xl bg-white" style={{ bottom: '-1px' }} />
          </div>

          {/* Avatar + info */}
          <div className="bg-white px-8 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-10 sm:-mt-12">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-700 flex items-center justify-center flex-shrink-0 ring-4 ring-white"
                style={{ boxShadow: '0 4px 14px rgba(29,78,216,0.3)' }}
              >
                <User size={36} className="text-white" />
              </div>
              <div className="text-center sm:text-left sm:pb-1 flex-1">
                <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 justify-center sm:justify-start">
                  <span className={roleCfg.cls}>{roleCfg.label}</span>
                  <span className="text-xs text-slate-400">{user.email}</span>
                </div>
              </div>
              <Link to={getDashboardLink()} className="btn btn-ghost btn-sm flex-shrink-0">
                <LayoutDashboard size={15} />
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card overflow-hidden">
          <div className="section-header">
            <h2>Account Details</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {fields.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Role note */}
        <div
          className="rounded-xl border p-4 text-sm"
          style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
        >
          <p className="font-semibold text-blue-800 mb-0.5">Account Role: {user.role}</p>
          <p className="text-blue-600 text-xs leading-relaxed">
            {user.role === 'Citizen' && 'As a Citizen, you can report emergencies and track the status of your reports in real time.'}
            {user.role === 'Responder' && 'As a Responder, you can view and accept incident assignments, update statuses, and mark incidents as resolved.'}
            {user.role === 'Admin' && 'As an Administrator, you have full access to all incidents, users, and resources across the QRCS platform.'}
          </p>
        </div>

      </div>
    </div>
  );
}