import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => { // 1. Added async here
    e.preventDefault();
    
    if(formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    // 2. Prepare the object with all required fields (including phone)
    const newUser = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role
    };
    
    try {
      // 3. Make the API call to your Express backend
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully in MongoDB! Please log in.");
        if (redirectPath) {
          navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
        } else {
          navigate('/login');
        }
      } else {
        // Displays errors like "User already exists" from your backend controller
        alert(`Registration failed: ${data.message}`); 
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Something went wrong. Make sure your backend server is running.");
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 300px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
      backgroundColor: 'var(--light-gray)'
    }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', color: 'white', marginBottom: '16px' }}>
            <UserPlus size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--dark-navy)' }}>Create an Account</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Join GarageFinder to find and review services</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Full Name</label>
            <input 
              type="text" name="name"
              value={formData.name} onChange={handleChange}
              placeholder="John Doe" required
              style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Email Address</label>
            <input 
              type="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="john@example.com" required
              style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Phone Number</label>
            <input 
              type="tel" name="phone"
              value={formData.phone} onChange={handleChange}
              placeholder="077 123 4567" required
              style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>I want to join as a:</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              <label style={{
                flex: 1,
                padding: '16px',
                borderRadius: '8px',
                border: `2px solid ${formData.role === 'customer' ? 'var(--primary-blue)' : 'var(--medium-gray)'}`,
                backgroundColor: formData.role === 'customer' ? 'rgba(10, 132, 255, 0.05)' : 'var(--white)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                display: 'block'
              }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="customer" 
                  checked={formData.role === 'customer'}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <div style={{ fontWeight: 600, color: formData.role === 'customer' ? 'var(--primary-blue)' : 'var(--dark-navy)', marginBottom: '4px' }}>Garage Finder</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Search and book services</div>
              </label>

              <label style={{
                flex: 1,
                padding: '16px',
                borderRadius: '8px',
                border: `2px solid ${formData.role === 'garage' ? 'var(--primary-blue)' : 'var(--medium-gray)'}`,
                backgroundColor: formData.role === 'garage' ? 'rgba(10, 132, 255, 0.05)' : 'var(--white)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                display: 'block'
              }}>
                <input 
                  type="radio" 
                  name="role" 
                  value="garage" 
                  checked={formData.role === 'garage'}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <div style={{ fontWeight: 600, color: formData.role === 'garage' ? 'var(--primary-blue)' : 'var(--dark-navy)', marginBottom: '4px' }}>Garage Owner</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>List & manage business</div>
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Password</label>
              <input 
                type="password" name="password"
                value={formData.password} onChange={handleChange}
                placeholder="********" required
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Confirm</label>
              <input 
                type="password" name="confirmPassword"
                value={formData.confirmPassword} onChange={handleChange}
                placeholder="********" required
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '1rem', marginTop: '10px' }}>
            Create Account
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to={redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : "/login"} style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>Login here</Link>
        </div>
      </div>
    </div>
  );
};

const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', transition: 'border-color 0.2s', width: '100%' };
const focusStyle = (e) => e.target.style.borderColor = '#0A84FF';
const blurStyle = (e) => e.target.style.borderColor = '#D1D5DB';

export default Register;
