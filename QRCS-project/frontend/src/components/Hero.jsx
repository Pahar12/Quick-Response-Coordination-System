import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ArrowRight } from "lucide-react";
import heroImg from "../assets/images/hero_illustration.png";

function Hero() {
  const { user } = useContext(AuthContext);

  const getDashboardLink = () => {
    if (!user) return "/register";
    if (user.role === "Admin") return "/admin";
    if (user.role === "Responder") return "/responder";
    return "/citizen";
  };

  return (
    <section
      id="home"
      style={{
        background: 'linear-gradient(135deg, #ebf5ff 0%, #f0f7ff 50%, #e8f0fe 100%)',
        paddingTop: '96px',
        paddingBottom: '64px',
        minHeight: '520px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          alignItems: 'center',
        }}>
          {/* Left — text */}
          <div>
            <p style={{
              fontSize: '0.8125rem', fontWeight: 700,
              color: '#1a56db', textTransform: 'uppercase',
              letterSpacing: '0.1em', marginBottom: '1rem',
            }}>
              Emergency Response System
            </p>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#111827',
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              letterSpacing: '-0.03em',
            }}>
              Quick Response<br />
              Coordination<br />
              <span style={{ color: '#1a56db' }}>System</span>
            </h1>

            <p style={{
              fontSize: '1rem', color: '#6b7280',
              lineHeight: 1.7, maxWidth: '440px',
              marginBottom: '2rem',
            }}>
              Report emergencies instantly. Connect citizens with responders and authorities for faster rescue operations and safer communities.
            </p>

            <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
              <Link
                to={getDashboardLink()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#dc2626', color: '#fff',
                  borderRadius: '8px', fontWeight: 700, fontSize: '0.9375rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(220,38,38,0.35)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
              >
                Report Emergency
              </Link>

              <a
                href="#services"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#fff', color: '#374151',
                  border: '1.5px solid #d1d5db',
                  borderRadius: '8px', fontWeight: 600, fontSize: '0.9375rem',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
              >
                Learn More <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Right — illustration */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={heroImg}
              alt="Emergency Response Illustration"
              style={{
                width: '100%',
                maxWidth: '520px',
                borderRadius: '16px',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;