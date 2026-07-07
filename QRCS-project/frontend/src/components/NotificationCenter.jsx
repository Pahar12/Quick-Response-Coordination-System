import React, { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Bell, X, CheckCheck, Info, Shield, AlertCircle } from 'lucide-react';

export default function NotificationCenter() {
  const socket = useContext(SocketContext);
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const push = (notif) => {
    setNotifications(prev => [
      { id: Date.now() + Math.random(), ...notif, time: new Date(), read: false },
      ...prev.slice(0, 29),
    ]);
  };

  useEffect(() => {
    if (!socket || !user) return;

    const onIncidentCreated = (incident) => {
      // Admins/Responders see all new incidents in bell
      if (user.role === 'Admin' || user.role === 'Responder') {
        push({ type: 'new', message: `🚨 New incident: ${incident.title} (${incident.emergencyType})` });
      }
      // Citizens: confirmation of their own report
      const mine = incident.reportedBy === user.id || incident.reportedBy?._id === user.id;
      if (user.role === 'Citizen' && mine) {
        push({ type: 'info', message: `✅ Report submitted: ${incident.title}` });
      }
    };

    const onIncidentAssigned = (incident) => {
      const mine = incident.reportedBy === user.id || incident.reportedBy?._id === user.id;
      if (user.role === 'Citizen' && mine) {
        const team = incident.assignedTeam?.teamName || 'a response team';
        push({ type: 'dispatch', message: `🛡️ ${team} assigned to your report` });
      }
      if (user.role === 'Admin') {
        const team = incident.assignedTeam?.teamName || 'Team';
        push({ type: 'info', message: `Auto-assigned: ${team} → "${incident.title}"` });
      }
    };

    const onIncidentUpdated = (incident) => {
      const mine = incident.reportedBy === user.id || incident.reportedBy?._id === user.id;
      if (user.role === 'Citizen' && mine) {
        push({ type: 'update', message: `Status updated → ${incident.status}: ${incident.title}` });
      }
      if (user.role === 'Admin') {
        push({ type: 'update', message: `Incident ${incident.status}: ${incident.title}` });
      }
      if (user.role === 'Responder') {
        push({ type: 'update', message: `Incident updated: ${incident.title} → ${incident.status}` });
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
  }, [socket, user]);

  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const remove = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const formatTime = (date) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  const getIcon = (type) => {
    if (type === 'dispatch') return <Shield size={12} style={{ color: '#7c3aed' }} />;
    if (type === 'new') return <AlertCircle size={12} style={{ color: '#dc2626' }} />;
    return <Info size={12} style={{ color: '#2563eb' }} />;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-slideInRight">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{unread}</span>
                )}
              </div>
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  <CheckCheck size={13} /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Info size={32} strokeWidth={1.5} className="mb-2" />
                  <p className="text-sm">No notifications yet</p>
                  <p className="text-xs mt-0.5 text-slate-300">Real-time updates appear here</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`relative px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${!notif.read ? 'bg-blue-50/40' : ''}`}
                  >
                    {!notif.read && (
                      <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    )}
                    <div className="pr-6 pl-3 flex items-start gap-2">
                      <div className="mt-0.5">{getIcon(notif.type)}</div>
                      <div>
                        <p className={`text-sm leading-snug ${!notif.read ? 'font-medium text-slate-800' : 'text-slate-600'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatTime(notif.time)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => remove(notif.id)}
                      className="absolute right-2 top-2 p-1 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
