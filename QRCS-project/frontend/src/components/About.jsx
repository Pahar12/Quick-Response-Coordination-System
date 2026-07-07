import React from "react";
import { Zap, MapPin, Users, ShieldCheck } from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Fast Response",
    description: "Emergency teams are notified instantly.",
    color: "#eab308", // yellow
  },
  {
    icon: MapPin,
    title: "Live Location",
    description: "Share your location with responders.",
    color: "#3b82f6", // blue
  },
  {
    icon: Users,
    title: "Citizen Support",
    description: "Citizens and responders stay connected.",
    color: "#22c55e", // green
  },
  {
    icon: ShieldCheck,
    title: "Secure System",
    description: "Protected reports and secure authentication.",
    color: "#ef4444", // red
  },
];

function About() {
  return (
    <section id="about" style={{ background: "#ffffff", padding: "4rem 0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
        
        {/* Section Title */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "#0f172a",
            display: "inline-block",
            position: "relative",
          }}>
            Why Choose QRCS?
            {/* Underline accent */}
            <div style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "40px",
              height: "4px",
              background: "#1a56db",
              borderRadius: "2px",
            }} />
          </h2>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1.5rem",
        }}>
          {reasons.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                border: "1px solid #f1f5f9",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.03)";
              }}
              >
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={32} color={item.color} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.25rem" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default About;