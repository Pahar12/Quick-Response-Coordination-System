import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import MapComponent from '../components/MapComponent';
import {
  AlertCircle,
  MapPin,
  AlignLeft,
  FileText,
  ChevronLeft,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';

const EMERGENCY_TYPES = ['Accident', 'Medical', 'Fire', 'Crime', 'Flood', 'Earthquake', 'Other'];

const TYPE_CONFIG = {
  'Accident': { color: '#dc2626', bg: '#fef2f2' },
  'Medical': { color: '#2563eb', bg: '#eff6ff' },
  'Fire': { color: '#ea580c', bg: '#fff7ed' },
  'Crime': { color: '#7c3aed', bg: '#faf5ff' },
  'Flood': { color: '#0891b2', bg: '#ecfeff' },
  'Earthquake': { color: '#b45309', bg: '#fffbeb' },
  'Other': { color: '#64748b', bg: '#f8fafc' },
};

export default function ReportIncident() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    emergencyType: 'Other',
    address: '',
  });
  const [location, setLocation] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      setError('Please select your location on the map before submitting.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/incidents/report', {
        title: form.title,
        description: form.description,
        emergencyType: form.emergencyType,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: form.address || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
        },
        reportedBy: user.id,
      });
      setSubmitted(true);
      setTimeout(() => navigate('/citizen'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit your report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* ─── Success state ─── */
  if (submitted) {
    return (
      <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--surface-2)' }} className="flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Report Submitted</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your emergency report has been received. Responders have been notified and will be with you shortly.
          </p>
          <p className="text-xs text-slate-400 mt-4">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  const selectedTypeConfig = TYPE_CONFIG[form.emergencyType];

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'var(--surface-2)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fadeIn">

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <ChevronLeft size={16} /> Back
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Report Emergency</h1>
            <p className="text-sm text-slate-500 mt-0.5">Complete all fields and mark your location on the map.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Left — form fields */}
            <div className="lg:col-span-2 space-y-5">

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Emergency type selector */}
              <div className="card p-5">
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Emergency Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EMERGENCY_TYPES.map((type) => {
                    const cfg = TYPE_CONFIG[type];
                    const isSelected = form.emergencyType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, emergencyType: type }))}
                        className="px-3 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-150 text-left"
                        style={{
                          background: isSelected ? cfg.bg : 'white',
                          color: isSelected ? cfg.color : '#64748b',
                          borderColor: isSelected ? cfg.color : '#e2e8f0',
                          boxShadow: isSelected ? `0 0 0 2px ${cfg.color}25` : 'none',
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="card p-5 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5"><FileText size={14} /> Incident Title <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Car accident on main road"
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5"><AlignLeft size={14} /> Description <span className="text-red-500">*</span></span>
                  </label>
                  <textarea
                    className="form-input resize-none"
                    rows={4}
                    placeholder="Describe the situation in detail — number of people involved, visible hazards, current conditions..."
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> Address or Landmark <span className="text-slate-400 font-normal text-xs">(optional)</span></span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nearest building, intersection, or landmark"
                    value={form.address}
                    onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !location}
                className="btn btn-danger btn-xl w-full"
                style={{ background: selectedTypeConfig.color, borderColor: selectedTypeConfig.color }}
              >
                {loading ? (
                  <><RefreshCw size={17} className="animate-spin" /> Submitting...</>
                ) : (
                  <><AlertCircle size={17} /> Submit Emergency Report</>
                )}
              </button>

              {!location && (
                <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                  <MapPin size={12} /> Click on the map to pin your location before submitting.
                </p>
              )}
            </div>

            {/* Right — Map */}
            <div className="lg:col-span-3">
              <div className="card overflow-hidden" style={{ height: '560px' }}>
                <div className="section-header flex-shrink-0">
                  <h2 className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400" />
                    Pin Your Location
                    <span className="text-red-500">*</span>
                  </h2>
                  {location && (
                    <span className="badge badge-resolved flex items-center gap-1">
                      <CheckCircle2 size={11} /> Location set
                    </span>
                  )}
                </div>
                <div className="relative flex-1" style={{ height: 'calc(560px - 53px)' }}>
                  <MapComponent onLocationSelected={(latlng) => setLocation(latlng)} />
                </div>
              </div>

              {location && (
                <div className="mt-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 size={15} />
                  <span className="font-medium">Location selected:</span>
                  <span className="text-green-600 font-mono text-xs">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
                </div>
              )}
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}