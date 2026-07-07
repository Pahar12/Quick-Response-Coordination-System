import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { PlusCircle, Clock, CheckCircle2, Activity, MapPin, Calendar, ChevronRight, TriangleAlert, Inbox, Shield } from 'lucide-react';

const STATUS_CONFIG = {
  'Reported': { label: 'Reported', cls: 'badge badge-pending', icon: Clock },
  'Assigned': { label: 'Assigned', cls: 'badge badge-inprogress', icon: Activity },
  'Accepted': { label: 'Accepted', cls: 'badge badge-inprogress', icon: Activity },
  'On The Way': { label: 'On The Way', cls: 'badge badge-inprogress', icon: Activity },
  'Resolved': { label: 'Resolved', cls: 'badge badge-resolved', icon: CheckCircle2 },
  'Closed': { label: 'Closed', cls: 'badge badge-resolved', icon: CheckCircle2 },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Reported'];
  const Icon = cfg.icon;
  return (
    <span className={cfg.cls}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

export default function CitizenDashboard() {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIncidents = async () => {
    try {
      const res = await API.get('/incidents');
      const mine = res.data.incidents.filter(
        (inc) => inc.reportedBy === user.id || inc.reportedBy?._id === user.id
      ).map(inc => ({
         ...inc,
         timeline: inc.timeline || [] // Ensure timeline array exists
      }));
      setIncidents(mine);
    } catch (err) {
      setError('Failed to load your reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [user.id]);

  useEffect(() => {
    if (!socket) return;
    const onNew = (incident) => {
      // Only add if it belongs to this user
      const belongsToMe = incident.reportedBy === user.id || incident.reportedBy?._id === user.id;
      if (belongsToMe) {
        setIncidents((prev) => [{ ...incident, timeline: incident.timeline || [] }, ...prev]);
      }
    };
    const onUpdate = (updated) => {
      setIncidents((prev) => prev.map((inc) => (inc._id === updated._id ? { ...updated, timeline: updated.timeline || [] } : inc)));
    };
    socket.on('incidentCreated', onNew);
    socket.on('incidentUpdated', onUpdate);
    socket.on('incidentAssigned', onUpdate);
    return () => {
      socket.off('incidentCreated', onNew);
      socket.off('incidentUpdated', onUpdate);
      socket.off('incidentAssigned', onUpdate);
    };
  }, [socket, user.id]);

  const activeCount = incidents.filter((i) => !['Resolved', 'Closed'].includes(i.status)).length;
  const resolvedCount = incidents.filter((i) => ['Resolved', 'Closed'].includes(i.status)).length;

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--surface-2)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }} className="space-y-6 animate-fadeIn">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My Emergency Reports</h1>
            <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user.name}. Track the live status of your reported emergencies.</p>
          </div>
          <Link to="/report" className="btn btn-danger btn-lg">
            <PlusCircle size={18} />
            Report Emergency
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Active Emergencies</span>
              <div className="stat-icon" style={{ background: '#dbeafe' }}>
                <Activity size={18} style={{ color: '#1d4ed8' }} />
              </div>
            </div>
            <span className="stat-value" style={{ color: '#1d4ed8' }}>{activeCount}</span>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <span className="stat-label">Resolved Emergencies</span>
              <div className="stat-icon" style={{ background: '#dcfce7' }}>
                <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
              </div>
            </div>
            <span className="stat-value" style={{ color: '#16a34a' }}>{resolvedCount}</span>
          </div>
        </div>

        {/* Incidents List */}
        <div className="card overflow-hidden">
          <div className="section-header">
            <h2>Your Reports</h2>
            <span className="badge badge-inprogress">{incidents.length} total</span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-sm">Loading your reports...</div>
          ) : error ? (
            <div className="py-12 flex flex-col items-center gap-2 text-red-500">
              <TriangleAlert size={32} strokeWidth={1.5} />
              <p className="text-sm">{error}</p>
            </div>
          ) : incidents.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
              <Inbox size={40} strokeWidth={1.5} />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-600">No reports yet</p>
                <p className="text-xs text-slate-400 mt-1">Use the button above to report an emergency.</p>
              </div>
            </div>
          ) : (
            <div>
              {incidents.map((incident) => (
                <div key={incident._id} className="px-6 py-6 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left: Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-extrabold text-slate-900">{incident.title}</h3>
                        <StatusBadge status={incident.status} />
                        <span className="badge bg-slate-100 text-slate-600 border border-slate-200">
                          {incident.emergencyType}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                        {incident.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 bg-white border border-slate-100 px-3 py-2 rounded-lg inline-flex">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin size={14} className="text-red-500" />
                          {incident.location?.address || 'Location on map'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(incident.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      {incident.assignedTeam && (
                        <div className="flex items-center gap-2 mt-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 max-w-md">
                          <Shield size={16} />
                          <strong>Response Team:</strong>&nbsp;
                          {incident.assignedTeam.teamName || incident.assignedTeam}
                        </div>
                      )}
                    </div>

                    {/* Right: Timeline */}
                    <div className="lg:w-80 flex-shrink-0 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Live Timeline</h4>
                      <div className="space-y-4">
                        {incident.timeline && incident.timeline.length > 0 ? (
                          incident.timeline.map((event, idx) => (
                            <div key={idx} className="relative pl-6">
                              <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500 shadow-sm"></span>
                              {idx !== incident.timeline.length - 1 && (
                                <span className="absolute left-[3px] top-4 bottom-[-16px] w-[2px] bg-slate-100"></span>
                              )}
                              <p className="text-sm font-bold text-slate-800">{event.status}</p>
                              <p className="text-[10px] text-slate-400">{new Date(event.timestamp).toLocaleTimeString()} - By {event.updatedBy}</p>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-400">Timeline not available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Help callout */}
        <div className="rounded-xl border p-5 flex items-center justify-between gap-4" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <div>
            <p className="text-sm font-semibold text-blue-900">Need immediate assistance?</p>
            <p className="text-xs text-blue-600 mt-0.5">Use the report button to alert responders with your location.</p>
          </div>
          <Link to="/report" className="btn btn-primary btn-sm flex-shrink-0">
            Report Now
            <ChevronRight size={15} />
          </Link>
        </div>

      </div>
    </div>
  );
}