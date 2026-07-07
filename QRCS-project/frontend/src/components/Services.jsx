import React from "react";
import { Ambulance, Shield, Flame, Phone } from "lucide-react";

const services = [
  {
    title: "Ambulance",
    description: "Instant medical emergency response.",
    icon: Ambulance,
    color: "#ef4444", // red
    bg: "#fee2e2",
  },
  {
    title: "Police",
    description: "Public safety and law enforcement.",
    icon: Shield,
    color: "#3b82f6", // blue
    bg: "#dbeafe",
  },
  {
    title: "Fire Rescue",
    description: "Fast response for fire emergencies.",
    icon: Flame,
    color: "#f97316", // orange
    bg: "#ffedd5",
  },
  {
    title: "24x7 Helpline",
    description: "Emergency support anytime.",
    icon: Phone,
    color: "#22c55e", // green
    bg: "#dcfce7",
  },
];

function Services() {
  return (
    <section id="services" style={{ background: "#f8fafc", padding: "4rem 0" }}>
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
            Emergency Services
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
          {services.map((srv, i) => {
            const Icon = srv.icon;
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
                  width: "50px", height: "50px",
                  borderRadius: "50%",
                  background: srv.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <Icon size={24} color={srv.color} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.25rem" }}>
                    {srv.title}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", lineHeight: 1.4 }}>
                    {srv.description}
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

export default Services;