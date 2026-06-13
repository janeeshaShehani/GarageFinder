import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');

  const handleSubmit = async (e) => { // 1. Added async here so await works properly
    e.preventDefault();
    
    try {
      // 2. Make the API request to your Express backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Store the secure JSON Web Token and user payload from MongoDB
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 4. Use the dynamic role verified by the database to handle navigation
        const isGarageOwner = data.user.role === 'garage' || data.user.role === 'garage_owner';
        
        if (isGarageOwner) {
          // Keep your structural dashboard template logic for new garage sessions
          const registeredGarage = localStorage.getItem('registeredGarage');
          if (!registeredGarage) {
            localStorage.setItem('registeredGarage', JSON.stringify({
              garageName: data.user.name || 'City Auto Garage',
              ownerName: 'Nimal Perera',
              phone: '077 123 4567',
              email: data.user.email,
              district: 'Colombo',
              address: '45 Galle Rd, Colombo 03',
              description: 'Specialists in engine repair and general service. We have all modern diagnostic tools.',
              openTime: '08:00',
              closeTime: '18:00',
              openDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              vehicleTypes: ['Car', 'SUV', 'Van'],
              services: ['Engine Repair', 'Oil Change', 'Battery Service']
            }));
          }
        }

        if (redirectPath) {
          navigate(redirectPath);
        } else if (isGarageOwner) {
          navigate('/dashboard');
        } else {
          navigate('/');
        }
      } else {
        // 5. Alert user with "Invalid email or password" or custom errors straight from the backend
        alert(data.message);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Unable to connect to backend server. Ensure it is actively running on port 5000.");
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 300px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      backgroundColor: 'var(--light-gray)'
    }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', color: 'white', marginBottom: '16px' }}>
            <Car size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--dark-navy)' }}>Welcome Back</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log in to your GarageFinder account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--medium-gray)', outline: 'none', transition: 'border-color 0.2s', width: '100%' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--medium-gray)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Password</label>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary-blue)' }}>Forgot password?</a>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--medium-gray)', outline: 'none', transition: 'border-color 0.2s', width: '100%' }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--medium-gray)'}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '10px', cursor: 'pointer' }}>
            Login
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link to={redirectPath ? `/register?redirect=${encodeURIComponent(redirectPath)}` : "/register"} style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;