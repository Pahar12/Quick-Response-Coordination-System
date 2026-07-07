import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { SocketContext } from './SocketContext';
import { AuthContext } from './AuthContext';
import { CheckCircle2, AlertCircle, Info, X, Shield, Bell } from 'lucide-react';

export const ToastContext = createContext();

const TOAST_ICONS = {
  success: { Icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  error:   { Icon: AlertCircle,  color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  info:    { Icon: Info,         color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  warning: { Icon: Bell,         color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  dispatch:{ Icon: Shield,       color: '#7c3aed', bg: '#faf5ff', border: '#e9d5ff' },
};

function ToastItem({ toast, onRemove }) {
  const cfg = TOAST_ICONS[toast.type] || TOAST_ICONS.info;
  const Icon = cfg.Icon;

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className="animate-slideInRight"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        minWidth: '300px',
        maxWidth: '380px',
        position: 'relative',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '1px' }}>
        <Icon size={18} color={cfg.color} />
      </div>
      <div style={{ flex: 1 }}>
        {toast.title && (
          <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>
            {toast.title}
          </p>
        )}
        <p style={{ fontSize: '0.8125rem', color: '#374151', lineHeight: 1.4 }}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          flexShrink: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: '#9ca3af',
          borderRadius: '4px',
          display: 'flex',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 5000 }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, title, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Real-time socket events → toasts
  useEffect(() => {
    if (!socket || !user) return;

    const onIncidentCreated = (incident) => {
      // Only admin and responders see all new incidents
      if (user.role === 'Admin' || user.role === 'Responder') {
        addToast({
          title: '🚨 New Incident Reported',
          message: `${incident.emergencyType}: ${incident.title}`,
          type: 'warning',
          duration: 6000,
        });
      }
      // Citizens see their own new report confirmation
      const mine = incident.reportedBy === user.id || incident.reportedBy?._id === user.id;
      if (user.role === 'Citizen' && mine) {
        addToast({
          title: 'Report Submitted',
          message: 'Your emergency report has been received.',
          type: 'success',
        });
      }
    };

    const onIncidentAssigned = (incident) => {
      const mine = incident.reportedBy === user.id || incident.reportedBy?._id === user.id;
      if (user.role === 'Citizen' && mine) {
        const teamName = incident.assignedTeam?.teamName || 'a response team';
        addToast({
          title: '🛡️ Team Dispatched!',
          message: `${teamName} has been assigned to your emergency.`,
          type: 'dispatch',
          duration: 7000,
        });
      }
      if (user.role === 'Admin') {
        const teamName = incident.assignedTeam?.teamName || 'a team';
        addToast({
          title: 'Team Auto-Assigned',
          message: `${teamName} → "${incident.title}"`,
          type: 'info',
        });
      }
    };

    const onIncidentUpdated = (incident) => {
      const mine = incident.reportedBy === user.id || incident.reportedBy?._id === user.id;

      if (user.role === 'Citizen' && mine) {
        const messages = {
          'Accepted':   { title: '✅ Team Accepted', msg: 'The response team has accepted your emergency.', type: 'success' },
          'On The Way': { title: '🚗 Team On The Way!', msg: 'The response team is heading to your location.', type: 'dispatch', duration: 7000 },
          'Resolved':   { title: '✅ Incident Resolved', msg: 'Your emergency has been resolved. Stay safe!', type: 'success', duration: 8000 },
        };
        const cfg = messages[incident.status];
        if (cfg) {
          addToast({ title: cfg.title, message: cfg.msg, type: cfg.type, duration: cfg.duration });
        }
      }

      if (user.role === 'Admin') {
        addToast({
          title: `Incident ${incident.status}`,
          message: `"${incident.title}" is now ${incident.status}`,
          type: incident.status === 'Resolved' ? 'success' : 'info',
        });
      }
    };

    socket.on('incidentCreated', onIncidentCreated);
    socket.on('incidentAssigned', onIncidentAssigned);
    socket.on('incidentUpdated', onIncidentUpdated);

    return () => {
      socket.off('incidentCreated', onIncidentCreated);
      socket.off('incidentAssigned', onIncidentAssigned);
      socket.off('incidentUpdated', onIncidentUpdated);
    };
  }, [socket, user, addToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast stack — top-right corner */}
      <div
        style={{
          position: 'fixed',
          top: '76px',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
