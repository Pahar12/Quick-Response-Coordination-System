import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { SocketContext } from '../context/SocketContext';
import MapComponent from '../components/MapComponent';
import {
  LayoutDashboard,
  Users,
  FileText,
  Truck,
  Activity,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
  Trash2,
  RefreshCw,
  PlusCircle,
  X,
  ShieldAlert,
  TriangleAlert,
  ChevronRight,
  Shield
} from 'lucide-react';

/* ─── Status badge ─── */
const STATUS_CFG = {
  'Reported': { cls: 'badge badge-pending', icon: Clock },
  'Assigned': { cls: 'badge badge-inprogress', icon: Activity },
  'Accepted': { cls: 'badge badge-inprogress', icon: Activity },
  'On The Way': { cls: 'badge badge-inprogress', icon: Activity },
  'Resolved': { cls: 'badge badge-resolved', icon: CheckCircle2 },
  'Closed': { cls: 'badge badge-resolved', icon: CheckCircle2 },
};
function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG['Reported'];
  const Icon = cfg.icon;
  return <span className={cfg.cls}><Icon size={11} />{status}</span>;
}

/* ─── Sidebar nav ─── */
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'incidents', label: 'Incidents', icon: FileText },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'teams', label: 'Response Teams', icon: Shield },
];

/* ─── Add Team Modal ─── */
function AddTeamModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ teamName: '', category: 'Medical', organization: '', status: 'Available' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await API.post('/teams', form);
      onAdded(res.data.team);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn" style={{ border: '1px solid #e2e8f0' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Add Response Team</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Team Name</label>
            <input type="text" className="form-input" placeholder="e.g., Fire Team Alpha" value={form.teamName} onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
            <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {['Accident', 'Medical', 'Fire', 'Crime', 'Flood', 'Earthquake', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Organization</label>
            <input type="text" className="form-input" placeholder="e.g., City Hospital" value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} required />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary flex-1">
              {loading ? <RefreshCw size={15} className="animate-spin" /> : 'Add Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function AdminDashboard() {
  const socket = useContext(SocketContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, incRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/incidents'),
      ]);
      setStats(dashRes.data.dashboard);
      setIncidents(incRes.data.incidents);
      setUsers(dashRes.data.dashboard.users || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await API.get('/teams');
      setTeams(res.data.teams);
    } catch (err) {
      console.error('Failed to fetch teams', err);
    }
  };

  useEffect(() => {
    fetchAll();
    fetchTeams();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNew = (inc) => setIncidents((prev) => [inc, ...prev]);
    const onUpdate = (updated) => {
      setIncidents((prev) => prev.map((i) => i._id === updated._id ? updated : i));
      fetchTeams(); // update team statuses if affected
    };
    const onDelete = (id) => setIncidents((prev) => prev.filter((i) => i._id !== id));
    socket.on('incidentCreated', onNew);
    socket.on('incidentUpdated', onUpdate);
    socket.on('incidentAssigned', onUpdate);
    socket.on('incidentDeleted', onDelete);
    return () => {
      socket.off('incidentCreated', onNew);
      socket.off('incidentUpdated', onUpdate);
      socket.off('incidentAssigned', onUpdate);
      socket.off('incidentDeleted', onDelete);
    };
  }, [socket]);

  const handleDeleteIncident = async (id) => {
    if (!window.confirm('Delete this incident? This action cannot be undone.')) return;
    setDeletingId(id);
    try {
      await API.delete(`/incidents/${id}`);
    } catch (err) {
      console.error('Failed to delete incident', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteTeam = async (id) => {
    if (!window.confirm('Delete this team?')) return;
    try {
      await API.delete(`/teams/${id}`);
      setTeams(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Failed to delete team', err);
    }
  };

  const handleUpdateTeamStatus = async (id, status) => {
    try {
      const res = await API.put(`/teams/${id}`, { status });
      setTeams(prev => prev.map(r => r._id === id ? res.data.team : r));
    } catch (err) {
      console.error('Failed to update team', err);
    }
  };

  const handleManualAssign = async (incidentId, teamId) => {
    if (!teamId) return;
    try {
      // Manual assign via incident update + team update
      // Let's do a basic backend update, but since we didn't expose an assign route, 
      // we can just use the status update API with "Assigned" and handle it on backend, 
      // or we can just send it as "Assigned" to incidentController.
      alert('Manual assignment route not explicitly defined in requirements. Skipping actual backend call.');
    } catch (err) {
      console.error(err);
    }
  }

  const markers = incidents
    .filter((i) => i.location?.lat && i.location?.lng && !['Resolved', 'Closed'].includes(i.status))
    .map((i) => ({ lat: i.location.lat, lng: i.location.lng, popupText: `${i.title} — ${i.status}` }));

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--surface-2)' }}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <ShieldAlert size={17} className="text-red-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Command Center</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors text-left ${
                activeTab === id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={17} />
              {label}
              {id === 'incidents' && incidents.filter(i => i.status === 'Reported').length > 0 && (
                <span className="ml-auto px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                  {incidents.filter(i => i.status === 'Reported').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content animate-fadeIn">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Overview</h1>
                <p className="text-sm text-slate-500 mt-0.5">System-wide status and recent activity.</p>
              </div>
              <button onClick={() => { fetchAll(); fetchTeams(); }} className="btn btn-ghost btn-sm">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <span className="stat-label">Total Incidents</span>
                  <div className="stat-icon" style={{ background: '#fef2f2' }}>
                    <TriangleAlert size={16} style={{ color: '#dc2626' }} />
                  </div>
                </div>
                <span className="stat-value">{stats?.totalIncidents ?? '—'}</span>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <span className="stat-label">Reported</span>
                  <div className="stat-icon" style={{ background: '#fef3c7' }}>
                    <Clock size={16} style={{ color: '#d97706' }} />
                  </div>
                </div>
                <span className="stat-value" style={{ color: '#d97706' }}>{incidents.filter(i => i.status === 'Reported').length}</span>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <span className="stat-label">Active</span>
                  <div className="stat-icon" style={{ background: '#dbeafe' }}>
                    <Activity size={16} style={{ color: '#1d4ed8' }} />
                  </div>
                </div>
                <span className="stat-value" style={{ color: '#1d4ed8' }}>{incidents.filter(i => ['Assigned', 'Accepted', 'On The Way'].includes(i.status)).length}</span>
              </div>
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <span className="stat-label">Teams</span>
                  <div className="stat-icon" style={{ background: '#f3e8ff' }}>
                    <Shield size={16} style={{ color: '#7c3aed' }} />
                  </div>
                </div>
                <span className="stat-value" style={{ color: '#7c3aed' }}>{teams.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card overflow-hidden flex flex-col" style={{ height: '440px' }}>
                <div className="section-header flex-shrink-0">
                  <h2 className="flex items-center gap-2"><MapPin size={14} className="text-slate-400" /> Active Incidents Map</h2>
                  <span className="text-xs text-slate-400">{markers.length} pins</span>
                </div>
                <div className="flex-1 relative">
                  <MapComponent readOnly markers={markers} />
                </div>
              </div>

              <div className="card overflow-hidden flex flex-col" style={{ height: '440px' }}>
                <div className="section-header flex-shrink-0">
                  <h2>Recent Incidents</h2>
                  <button onClick={() => setActiveTab('incidents')} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-semibold">
                    View all <ChevronRight size={13} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {incidents.slice(0, 5).map((inc) => (
                    <div key={inc._id} className="px-4 py-3.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{inc.title}</p>
                        <StatusBadge status={inc.status} />
                      </div>
                      <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(inc.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── INCIDENTS ── */}
        {activeTab === 'incidents' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-slate-900">All Incidents</h1>
              <button onClick={fetchAll} className="btn btn-ghost btn-sm"><RefreshCw size={14} /> Refresh</button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Assigned</th>
                      <th>Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={7} className="py-8 text-center text-sm text-slate-400">Loading incidents...</td></tr>
                    ) : incidents.length === 0 ? (
                      <tr><td colSpan={7} className="py-10 text-center text-sm text-slate-400">No incidents found.</td></tr>
                    ) : incidents.map((inc) => (
                      <tr key={inc._id}>
                        <td>
                          <p className="font-semibold text-slate-900 text-sm">{inc.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{inc.description}</p>
                        </td>
                        <td>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: '#f1f5f9', color: '#475569' }}>
                            {inc.emergencyType}
                          </span>
                        </td>
                        <td><StatusBadge status={inc.status} /></td>
                        <td className="text-xs">{inc.location?.address || '—'}</td>
                        <td className="text-xs font-medium text-slate-700">
                          {inc.assignedTeam ? (
                            <span className="text-blue-600 font-bold">
                              {inc.assignedTeam.teamName || inc.assignedTeam}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="text-xs">{new Date(inc.createdAt).toLocaleDateString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteIncident(inc._id)}
                            disabled={deletingId === inc._id}
                            className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 hover:text-red-700"
                          >
                            {deletingId === inc._id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <h1 className="text-2xl font-extrabold text-slate-900">User Management</h1>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td className="font-semibold text-slate-900 text-sm">{u.name}</td>
                        <td className="text-sm">{u.email}</td>
                        <td>
                          <span className="badge badge-resolved">{u.role}</span>
                        </td>
                        <td className="text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TEAMS ── */}
        {activeTab === 'teams' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-extrabold text-slate-900">Manage Response Teams</h1>
              <button onClick={() => setShowAddTeam(true)} className="btn btn-primary">
                <PlusCircle size={16} /> Add Team
              </button>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Team Name</th>
                      <th>Category</th>
                      <th>Organization</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          No teams added yet.
                        </td>
                      </tr>
                    ) : teams.map((team) => (
                      <tr key={team._id}>
                        <td className="font-semibold text-slate-900 text-sm">{team.teamName}</td>
                        <td className="text-sm font-semibold text-slate-600">{team.category}</td>
                        <td className="text-sm">{team.organization}</td>
                        <td>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            team.status === 'Available' ? 'bg-green-100 text-green-700' :
                            team.status === 'Busy' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {team.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteTeam(team._id)}
                            className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add team modal */}
      {showAddTeam && (
        <AddTeamModal
          onClose={() => setShowAddTeam(false)}
          onAdded={(team) => setTeams(prev => [team, ...prev])}
        />
      )}
    </div>
  );
}