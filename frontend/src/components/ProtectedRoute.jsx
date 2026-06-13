import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldAlert, Store, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const registeredGarage = localStorage.getItem('registeredGarage');

  // Case 1: User is not logged in at all -> redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Case 2: User is logged in but is not a garage owner -> show premium Access Denied page
  const isGarageOwner = user.role === 'garage_owner' || user.role === 'garage';
  
  if (!isGarageOwner) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--light-gray)',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div className="card" style={{
          maxWidth: '550px',
          width: '100%',
          padding: '48px 40px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--white)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Animated/Glowing Alert Icon */}
          <div style={{
            position: 'relative',
            marginBottom: '28px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <div style={{
              position: 'absolute',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              animation: 'pulse 2s infinite'
            }}></div>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2
            }}>
              <ShieldAlert size={36} />
            </div>
          </div>

          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--dark-navy)',
            marginBottom: '14px',
            letterSpacing: '-0.5px'
          }}>
            Garage Registration Required
          </h1>
          
          <p style={{
            fontSize: '1rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '420px'
          }}>
            The Garage Dashboard is reserved for registered partners. Register your service center or garage now to list your business and manage bookings.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%'
          }}>
            <button 
              onClick={() => navigate('/register-garage')}
              className="btn-primary" 
              style={{
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              <Store size={20} /> Register Your Garage
            </button>
            
            <button 
              onClick={() => navigate('/')}
              className="btn-secondary" 
              style={{
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={20} /> Back to Home
            </button>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
            70% { transform: scale(1.1); box-shadow: 0 0 0 12px rgba(239, 68, 68, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
          }
        `}</style>
      </div>
    );
  }

  // Case 3: Authorized -> show dashboard
  return children;
};

export default ProtectedRoute;
