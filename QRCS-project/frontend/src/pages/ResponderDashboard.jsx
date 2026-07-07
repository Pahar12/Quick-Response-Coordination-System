import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import { Shield, Activity, CheckCircle2, MapPin, Clock, RefreshCw, TriangleAlert } from 'lucide-react';

const TYPE_COLORS = {
  'Accident': '#dc2626',
  'Medical': '#2563eb',
  'Fire': '#ea580c',
  'Crime': '#7c3aed',
  'Flood': '#0891b2',
  'Earthquake': '#b45309',
  'Other': '#64748b',
};

export default function ResponderDashboard() {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(() => localStorage.getItem('selectedTeamId') || '');
  const [teamData, setTeamData] = useState(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch all teams (for dropdown)
  const fetchTeams = async () => {
    try {
      const res = await API.get('/teams');
      setTeams(res.data.teams);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTeams(false);
    }
  };

  // Fetch a single team's full data (with populated incident)
  const fetchSelectedTeam = async (id) => {
    if (!id) { setTeamData(null); return; }
    try {
      const res = await API.get(`/teams/${id}`);
      setTeamData(res.data.team);
    } catch (err) {
      console.error('Failed to fetch team', err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // When selectedTeamId changes, fetch that team's data
  useEffect(() => {
    fetchSelectedTeam(selectedTeamId);
  }, [selectedTeamId]);

  // Socket events: refresh team data when incidents change
  useEffect(() => {
    if (!socket) return;

    const refresh = () => fetchSelectedTeam(selectedTeamId);

    socket.on('incidentUpdated', refresh);
    socket.on('incidentAssigned', refresh);
    socket.on('incidentCreated', fetchTeams);

    return () => {
      socket.off('incidentUpdated', refresh);
      socket.off('incidentAssigned', refresh);
      socket.off('incidentCreated', fetchTeams);
    };
  }, [socket, selectedTeamId]);

  const handleSelectTeam = (e) => {
    const id = e.target.value;
    setSelectedTeamId(id);
    localStorage.setItem('selectedTeamId', id);
  };

  const updateIncidentStatus = async (status) => {
    if (!teamData?.currentIncident) return;
    setUpdating(true);
    try {
      // PUT /incidents/:id  (the route is /:id with updateStatus controller)
      await API.put(`/incidents/${teamData.currentIncident._id}`, {
        status,
        updatedBy: teamData.teamName
      });
      // Socket will trigger refresh via incidentUpdated event
      await fetchSelectedTeam(selectedTeamId);
    } catch (err) {
      console.error('Failed to update incident status', err);
    } finally {
      setUpdating(false);
    }
  };

  const toggleTeamStatus = async (newStatus) => {
    if (!teamData) return;
    setUpdating(true);
    try {
      await API.put(`/teams/${teamData._id}`, { status: newStatus });
      await fetchSelectedTeam(selectedTeamId);
      fetchTeams(); // update dropdown too
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--surface-2)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }} className="space-y-6 animate-fadeIn">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <Shield size={24} className="text-blue-700" />
              Team Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">Select your team to monitor and respond to assigned emergencies.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              className="form-input font-semibold text-slate-700 flex-1 sm:w-64"
              value={selectedTeamId}
              onChange={handleSelectTeam}
            >
              <option value="">-- Select Your Team --</option>
              {teams.map(t => (
                <option key={t._id} value={t._id}>{t.teamName} ({t.category})</option>
              ))}
            </select>
            <button
              onClick={() => fetchSelectedTeam(selectedTeamId)}
              className="btn btn-ghost btn-sm"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {loadingTeams ? (
          <div className="py-12 text-center text-slate-500">Loading teams...</div>
        ) : !selectedTeamId ? (
          <div className="py-12 text-center text-slate-400 flex flex-col items-center">
            <TriangleAlert size={40} className="mb-3 opacity-50" />
            <p>Please select a team from the dropdown above.</p>
          </div>
        ) : !teamData ? (
          <div className="py-12 text-center text-slate-400">Loading team data...</div>
        ) : (
          <div className="space-y-6">

            {/* Team Status Card */}
            <div
              className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4"
              style={{
                borderLeftColor:
                  teamData.status === 'Available' ? '#16a34a' :
                  teamData.status === 'Busy' ? '#d97706' : '#64748b'
              }}
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900">{teamData.teamName}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1">
                  <span>Category: <strong className="text-slate-700">{teamData.category}</strong></span>
                  <span>Organization: <strong className="text-slate-700">{teamData.organization}</strong></span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  teamData.status === 'Available' ? 'bg-green-100 text-green-700' :
                  teamData.status === 'Busy' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  ● {teamData.status}
                </span>
                {teamData.status !== 'Busy' && (
                  <button
                    onClick={() => toggleTeamStatus(teamData.status === 'Available' ? 'Offline' : 'Available')}
                    disabled={updating}
                    className="btn btn-ghost btn-sm"
                  >
                    Go {teamData.status === 'Available' ? 'Offline' : 'Available'}
                  </button>
                )}
              </div>
            </div>

            {/* Current Assignment */}
            <div className="card overflow-hidden">
              <div className="section-header" style={{ background: '#1e293b' }}>
                <h2 className="text-white flex items-center gap-2">
                  <Activity size={18} />
                  Current Assigned Incident
                </h2>
              </div>

              <div className="p-6">
                {!teamData.currentIncident ? (
                  <div className="text-center py-10">
                    <CheckCircle2 size={52} className="mx-auto text-green-500 mb-3 opacity-70" />
                    <h3 className="text-lg font-bold text-slate-700">No Active Assignment</h3>
                    <p className="text-slate-500 mt-1 text-sm">You are available and waiting for dispatch.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <span
                          className="px-2 py-1 rounded text-white text-xs font-bold mb-2 inline-block"
                          style={{ background: TYPE_COLORS[teamData.currentIncident.emergencyType] || '#000' }}
                        >
                          {teamData.currentIncident.emergencyType}
                        </span>
                        <h3 className="text-xl font-extrabold text-slate-900 mt-1">{teamData.currentIncident.title}</h3>
                        <p className="text-slate-600 mt-2 text-sm leading-relaxed max-w-xl">
                          {teamData.currentIncident.description}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-500">Status</p>
                        <p className="text-base font-extrabold text-blue-600 mt-0.5">{teamData.currentIncident.status}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(teamData.currentIncident.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {teamData.currentIncident.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <MapPin size={16} className="text-red-500 flex-shrink-0" />
                        <strong>Location:</strong>&nbsp;{teamData.currentIncident.location.address}
                      </div>
                    )}

                    {/* Timeline */}
                    {teamData.currentIncident.timeline?.length > 0 && (
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Incident Timeline</h4>
                        <div className="space-y-3">
                          {teamData.currentIncident.timeline.map((event, idx) => (
                            <div key={idx} className="relative pl-5">
                              <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-500"></span>
                              <p className="text-sm font-bold text-slate-800">{event.status}</p>
                              <p className="text-[10px] text-slate-400">{new Date(event.timestamp).toLocaleString()} · {event.updatedBy}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                      {teamData.currentIncident.status === 'Assigned' && (
                        <button
                          onClick={() => updateIncidentStatus('Accepted')}
                          disabled={updating}
                          className="btn btn-primary flex-1 py-3 text-base font-bold"
                        >
                          {updating ? <RefreshCw size={16} className="animate-spin" /> : null}
                          ✓ Accept Assignment
                        </button>
                      )}
                      {teamData.currentIncident.status === 'Accepted' && (
                        <button
                          onClick={() => updateIncidentStatus('On The Way')}
                          disabled={updating}
                          className="flex-1 py-3 text-base font-bold text-white rounded-lg border-none cursor-pointer"
                          style={{ background: '#d97706' }}
                        >
                          {updating ? <RefreshCw size={16} className="animate-spin inline mr-1" /> : null}
                          🚗 On The Way
                        </button>
                      )}
                      {teamData.currentIncident.status === 'On The Way' && (
                        <button
                          onClick={() => updateIncidentStatus('Resolved')}
                          disabled={updating}
                          className="btn btn-success flex-1 py-3 text-base font-bold"
                          style={{ background: '#16a34a', color: 'white', border: 'none' }}
                        >
                          {updating ? <RefreshCw size={16} className="animate-spin inline mr-1" /> : null}
                          <CheckCircle2 size={18} className="inline mr-1" />
                          Mark Resolved
                        </button>
                      )}
                      {teamData.currentIncident.status === 'Resolved' && (
                        <div className="flex-1 py-4 text-center text-green-700 font-bold bg-green-50 rounded-lg border border-green-200">
                          <CheckCircle2 size={20} className="inline mr-2" />
                          Incident Resolved — Team is now Available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}