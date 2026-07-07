import React from "react";
import { Users, AlertTriangle, Clock, CheckCircle } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "1000+",
    label: "Registered Citizens",
    color: "#3b82f6", // blue
  },
  {
    icon: AlertTriangle,
    value: "350+",
    label: "Incidents Reported",
    color: "#ef4444", // red
  },
  {
    icon: Clock,
    value: "24/7",
    label: "Emergency Support",
    color: "#eab308", // yellow
  },
  {
    icon: CheckCircle,
    value: "98%",
    label: "Successful Response",
    color: "#22c55e", // green
  },
];

function Stats() {
  return (
    <section id="stats" style={{ background: "#f1f5f9", padding: "4rem 0" }}>
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
            QRCS Statistics
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
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
        }}>
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                border: "1px solid #e2e8f0",
              }}>
                <Icon size={42} color={stat.color} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
                    {stat.value}
                  </h3>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.25rem" }}>
                    {stat.label}
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

export default Stats;