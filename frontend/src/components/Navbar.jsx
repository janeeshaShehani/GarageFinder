import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Car } from 'lucide-react';
import '../styles/global.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isGarageOwner, setIsGarageOwner] = useState(false);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    setUser(currentUser);
    setIsGarageOwner(!!currentUser && (currentUser.role === 'garage' || currentUser.role === 'garage_owner'));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('registeredGarage');
    setUser(null);
    setIsGarageOwner(false);
    navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Search', path: '/search' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      backgroundColor: 'var(--white)',
      boxShadow: isScrolled ? 'var(--shadow-md)' : 'none',
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img 
          src="/src/assets/garageFinderLogo.png" // Path to your logo image file
          alt="GarageFinder Logo" 
          style={{ 
            height: '30px',          // Controls the vertical size of the logo
            width: 'auto',           // Keeps the original aspect ratio perfectly intact
            objectFit: 'contain' 
          }} 
        />
      </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'none' }} className="desktop-nav">
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                style={{
                  fontWeight: 500,
                  color: location.pathname === link.path ? 'var(--primary-blue)' : 'var(--text-primary)',
                  transition: 'color 0.2s ease'
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Actions */}
        <div style={{ display: 'none', gap: '12px', alignItems: 'center' }} className="desktop-actions">
          {user ? (
            <>
              <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)', marginRight: '4px' }}>
                Hello, <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
              </span>
              {isGarageOwner ? (
                <Link to="/dashboard" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Garage Dashboard</Link>
              ) : (
                <Link to="/register-garage" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Register Garage</Link>
              )}
              <button onClick={handleLogout} className="btn-secondary" style={{ cursor: 'pointer', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--medium-gray)', background: 'transparent', fontSize: '0.9rem' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Login</Link>
              <Link to="/register-garage" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Register Garage</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="mobile-menu-btn"
          style={{ display: 'block', color: 'var(--text-primary)' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: 0,
          width: '100%',
          backgroundColor: 'var(--white)',
          padding: '20px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontWeight: 500,
                color: location.pathname === link.path ? 'var(--primary-blue)' : 'var(--text-primary)',
                padding: '8px 0',
                borderBottom: '1px solid var(--light-gray)'
              }}
            >
              {link.name}
            </Link>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
            {user ? (
              <>
                <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '4px' }}>
                  Hello, <span style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>{user.name}</span>
                </span>
                {isGarageOwner ? (
                  <Link to="/dashboard" className="btn-primary" style={{ textAlign: 'center', padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setMobileMenuOpen(false)}>Garage Dashboard</Link>
                ) : (
                  <Link to="/register-garage" className="btn-primary" style={{ textAlign: 'center', padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setMobileMenuOpen(false)}>Register Garage</Link>
                )}
                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                  className="btn-secondary" 
                  style={{ width: '100%', cursor: 'pointer', textAlign: 'center', padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--medium-gray)', background: 'transparent', fontSize: '0.9rem' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" style={{ textAlign: 'center', padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/register-garage" className="btn-primary" style={{ textAlign: 'center', padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setMobileMenuOpen(false)}>Register Garage</Link>
              </>
            )}
          </div>
        </div>
      )}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
