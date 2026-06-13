import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin, Globe, MessageCircle, Camera } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--dark-navy)',
      color: 'var(--white)',
      padding: '60px 0 20px',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand & About */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <img 
          src="/src/assets/garageFinderwhiteLogo.png" // Path to your logo image file
          alt="GarageFinder Logo" 
          style={{ 
            height: '30px',          // Controls the vertical size of the logo
            width: 'auto',           // Keeps the original aspect ratio perfectly intact
            objectFit: 'contain' 
          }} 
        />
            </Link>
            <p style={{ color: 'var(--medium-gray)', marginBottom: '20px', fontSize: '0.9rem' }}>
              The premier platform for finding trusted vehicle service centers and garages across Sri Lanka.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: 600 }}>Quick Links</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/search" style={{ color: 'var(--medium-gray)', textDecoration: 'none' }}>Find a Garage</Link></li>
              <li><Link to="/services" style={{ color: 'var(--medium-gray)' }}>Our Services</Link></li>
              <li><Link to="/about" style={{ color: 'var(--medium-gray)' }}>About Us</Link></li>
              <li><Link to="/register-garage" style={{ color: 'var(--medium-gray)' }}>Register Your Garage</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', fontWeight: 600 }}>Contact Us</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', color: 'var(--medium-gray)' }}>
                <MapPin size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
                <span>123 Galle Road, Colombo 03, Sri Lanka</span>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--medium-gray)' }}>
                <Phone size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
                <span>+94 71 114 4854</span>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--medium-gray)' }}>
                <Mail size={20} style={{ color: 'var(--primary-blue)', flexShrink: 0 }} />
                <span>info@garagefinder.lk</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '20px',
          textAlign: 'center',
          color: 'var(--medium-gray)',
          fontSize: '0.85rem'
        }}>
          &copy; {new Date().getFullYear()} GarageFinder Sri Lanka. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
