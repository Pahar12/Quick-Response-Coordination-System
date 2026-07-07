import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NotificationCenter from "./NotificationCenter";
import { Shield, LogOut, User, LayoutDashboard, AlertCircle, Menu, X, ChevronDown } from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "Admin") return "/admin";
    if (user.role === "Responder") return "/responder";
    return "/citizen";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: '#fff',
      borderBottom: '1px solid #e8edf5',
      height: '64px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 1.5rem',
        height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #1a56db 0%, #1e40af 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(26,86,219,0.3)',
          }}>
            <Shield size={18} color="#fff" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1a56db', letterSpacing: '-0.02em' }}>QRCS</span>
        </Link>

        {/* Center links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hidden md:flex">
          {!user ? (
            <>
              {[
                { href: '#home', label: 'Home' },
                { href: '#services', label: 'Services' },
                { href: '#about', label: 'About' },
                { href: '#contact', label: 'Contact' },
              ].map(({ href, label }) => (
                <a key={label} href={href} style={{
                  padding: '0.4rem 0.875rem',
                  fontSize: '0.9rem', fontWeight: 600,
                  color: '#374151',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  transition: 'color 0.15s, background 0.15s',
                }}
                  onMouseEnter={e => { e.target.style.color = '#1a56db'; e.target.style.background = '#eff6ff'; }}
                  onMouseLeave={e => { e.target.style.color = '#374151'; e.target.style.background = 'transparent'; }}
                >
                  {label}
                </a>
              ))}
            </>
          ) : (
            <>
              <Link to={getDashboardLink()} style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.4rem 0.875rem', fontSize: '0.875rem', fontWeight: 600,
                color: isActive(getDashboardLink()) ? '#1a56db' : '#374151',
                background: isActive(getDashboardLink()) ? '#eff6ff' : 'transparent',
                borderRadius: '6px', textDecoration: 'none',
              }}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              {(user.role === 'Citizen' || user.role === 'Admin') && (
                <Link to="/report" style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.875rem', fontSize: '0.875rem', fontWeight: 600,
                  color: isActive('/report') ? '#dc2626' : '#374151',
                  background: isActive('/report') ? '#fef2f2' : 'transparent',
                  borderRadius: '6px', textDecoration: 'none',
                }}>
                  <AlertCircle size={15} /> Report
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!user ? (
            <>
              <Link to="/login" style={{
                padding: '0.5rem 1.125rem', fontSize: '0.9rem', fontWeight: 600,
                color: '#1a56db', border: '1.5px solid #1a56db',
                borderRadius: '8px', textDecoration: 'none',
                transition: 'all 0.15s',
              }}
                className="hidden sm:block"
              >Login</Link>
              <Link to="/register" style={{
                padding: '0.5rem 1.125rem', fontSize: '0.9rem', fontWeight: 600,
                color: '#fff', background: '#1a56db',
                borderRadius: '8px', textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(26,86,219,0.3)',
                transition: 'all 0.15s',
              }}
                className="hidden sm:block"
              >Register</Link>
            </>
          ) : (
            <>
              {user.role === 'Citizen' && (
                <Link to="/report" style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.45rem 1rem', fontSize: '0.8125rem', fontWeight: 700,
                  color: '#fff', background: '#dc2626', borderRadius: '8px',
                  textDecoration: 'none', boxShadow: '0 2px 8px rgba(220,38,38,0.3)',
                }} className="hidden md:flex">
                  <AlertCircle size={14} /> Report Emergency
                </Link>
              )}
              <NotificationCenter />

              {/* Profile */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setProfileOpen(!profileOpen)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.375rem 0.75rem', border: '1.5px solid #e5e7eb',
                  borderRadius: '8px', background: '#fff', cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User size={14} color="#1a56db" />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }} className="hidden sm:block">
                    {user.name}
                  </span>
                  <ChevronDown size={13} color="#9ca3af" style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {profileOpen && (
                  <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      width: '200px', background: '#fff',
                      border: '1px solid #e5e7eb', borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', overflow: 'hidden',
                      zIndex: 50,
                    }}>
                      <div style={{ padding: '0.75rem 1rem', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1px' }}>{user.role}</p>
                      </div>
                      {[
                        { to: '/profile', icon: User, label: 'My Profile' },
                        { to: getDashboardLink(), icon: LayoutDashboard, label: 'Dashboard' },
                      ].map(({ to, icon: Icon, label }) => (
                        <Link key={to} to={to} onClick={() => setProfileOpen(false)} style={{
                          display: 'flex', alignItems: 'center', gap: '0.625rem',
                          padding: '0.625rem 1rem', fontSize: '0.8125rem', fontWeight: 500,
                          color: '#374151', textDecoration: 'none',
                          transition: 'background 0.1s',
                        }}>
                          <Icon size={14} /> {label}
                        </Link>
                      ))}
                      <div style={{ borderTop: '1px solid #f3f4f6' }}>
                        <button onClick={handleLogout} style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                          padding: '0.625rem 1rem', fontSize: '0.8125rem', fontWeight: 500,
                          color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer',
                          transition: 'background 0.1s',
                        }}>
                          <LogOut size={14} /> Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{
            padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer',
            color: '#6b7280', borderRadius: '6px',
          }} className="md:hidden">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: '#fff', borderTop: '1px solid #e5e7eb',
          padding: '0.75rem 1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          {!user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {['Home', 'Services', 'About', 'Contact'].map(l => (
                <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.9rem', fontWeight: 600, color: '#374151', textDecoration: 'none', borderRadius: '6px' }}>
                  {l}
                </a>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f3f4f6', marginTop: '0.25rem' }}>
                <Link to="/login" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', border: '1.5px solid #1a56db', borderRadius: '8px', color: '#1a56db', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#1a56db', borderRadius: '8px', color: '#fff', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem' }}>Register</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Link to={getDashboardLink()} onClick={() => setMobileOpen(false)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LayoutDashboard size={15} /> Dashboard</Link>
              <Link to="/report" onClick={() => setMobileOpen(false)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={15} /> Report Emergency</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)} style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={15} /> My Profile</Link>
              <button onClick={handleLogout} style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LogOut size={15} /> Sign Out</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;