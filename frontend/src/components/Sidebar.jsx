import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { LayoutDashboard, Wrench, Settings, ImageIcon, Clock, MessageSquare, LogOut, Car, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { garageId } = useParams();

  const menuItems = [
    { name: 'Dashboard', path: `/dashboard/${garageId}`, icon: <LayoutDashboard size={20} />, exact: true },
    { name: 'Services', path: `/dashboard/${garageId}/services`, icon: <Wrench size={20} /> },
    { name: 'Garage Details', path: `/dashboard/${garageId}/details`, icon: <Settings size={20} /> },
    { name: 'Photos', path: `/dashboard/${garageId}/photos`, icon: <ImageIcon size={20} /> },
    { name: 'Availability', path: `/dashboard/${garageId}/availability`, icon: <Clock size={20} /> },
    { name: 'Reviews', path: `/dashboard/${garageId}/reviews`, icon: <MessageSquare size={20} /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="sidebar-overlay"
        ></div>
      )}
      
      <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--medium-gray)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-blue)' }}>
            <Car size={28} />
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--dark-navy)' }}>
              Garage<span style={{ color: 'var(--primary-blue)' }}>Finder</span>
            </span>
          </div>
          <button 
            className="mobile-close-sidebar" 
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={24} />
          </button>
        </div>

      <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.exact}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
              borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)',
              fontWeight: 500, textDecoration: 'none', transition: 'all 0.2s ease'
            }}
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '20px 12px', borderTop: '1px solid var(--medium-gray)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <NavLink
          to="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
            borderRadius: 'var(--radius-md)', color: 'var(--primary-blue)',
            fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s ease',
            backgroundColor: 'rgba(10, 132, 255, 0.05)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.05)'}
        >
          <LayoutDashboard size={20} /> Switch Garage
        </NavLink>

        <button style={{
          display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
          width: '100%', color: 'var(--danger)', fontWeight: 500,
          background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        onClick={() => {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('registeredGarage');
          window.location.href = '/';
        }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      <style>{`
        .sidebar-container {
          width: 260px;
          background-color: var(--white);
          border-right: 1px solid var(--medium-gray);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: sticky;
          top: 0;
          transition: transform 0.3s ease;
          z-index: 1000;
        }
        .sidebar-link:hover {
          background-color: var(--light-gray);
          color: var(--dark-navy) !important;
        }
        .sidebar-link.active {
          background-color: var(--primary-blue) !important;
          color: white !important;
        }
        .mobile-close-sidebar {
          display: none;
        }
        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 991px) {
          .sidebar-container {
            position: fixed;
            left: 0;
            top: 0;
            transform: translateX(-100%);
          }
          .sidebar-container.open {
            transform: translateX(0);
          }
          .mobile-close-sidebar {
            display: block;
          }
          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }
        }
      `}</style>
    </div>
    </>
  );
};

export default Sidebar;
