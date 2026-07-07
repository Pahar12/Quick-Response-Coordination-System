import React from "react";
import { Link } from "react-router-dom";
import {
  Shield, Globe, Share2, ExternalLink,
  Ambulance, Flame, Mail, Phone, MapPin, Heart
} from "lucide-react";

function Footer() {
  return (
    <footer id="contact" style={{ background: "#0a192f", color: "#e2e8f0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "4rem 1.5rem 2rem" }}>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "3rem",
          marginBottom: "3rem",
        }}>

          {/* Brand */}
          <div style={{ gridColumn: "span 2" }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Shield size={20} color="#3b82f6" />
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>QRCS</span>
            </Link>
            <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.6, maxWidth: "300px", marginBottom: "1.5rem" }}>
              Quick Response Coordination System helps citizens report emergencies and enables responders to react quickly, securely, and efficiently.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {[Globe, Share2, ExternalLink].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: "32px", height: "32px",
                  borderRadius: "50%",
                  background: "#1e293b",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#3b82f6",
                  transition: "background 0.2s, color 0.2s",
                  textDecoration: "none"
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.color = "#ffffff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#1e293b"; e.currentTarget.style.color = "#3b82f6"; }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginBottom: "1.25rem" }}>Quick Links</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {['Home', 'Services', 'About', 'Report Incident'].map(link => (
                <li key={link}>
                  <a href={link === 'Report Incident' ? '/report' : `#${link.toLowerCase()}`} style={{
                    color: "#94a3b8", fontSize: "0.875rem", textDecoration: "none", transition: "color 0.2s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = "#ffffff"}
                    onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginBottom: "1.25rem" }}>Emergency</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", fontSize: "0.875rem" }}>
                <Ambulance size={14} color="#ef4444" /> Ambulance : 108
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", fontSize: "0.875rem" }}>
                <Shield size={14} color="#3b82f6" /> Police : 100
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", fontSize: "0.875rem" }}>
                <Flame size={14} color="#f97316" /> Fire : 101
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", marginBottom: "1.25rem" }}>Contact Us</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", fontSize: "0.875rem" }}>
                <Mail size={14} /> support@qrcs.com
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", fontSize: "0.875rem" }}>
                <Phone size={14} /> +91 98765 43210
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", fontSize: "0.875rem" }}>
                <MapPin size={14} /> India
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: "1px solid #1e293b",
          paddingTop: "1.5rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.25rem",
          fontSize: "0.75rem",
          color: "#94a3b8",
        }}>
          © {new Date().getFullYear()} QRCS
        </div>

      </div>
    </footer>
  );
}

export default Footer;