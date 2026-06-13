import React from 'react';
import { Link } from 'react-router-dom';
import { Settings, Wrench, Battery, CheckCircle, Zap, Droplets, Shield, Fan } from 'lucide-react';

const Services = () => {
  const allServices = [
    { name: 'Engine Repair', desc: 'Comprehensive diagnostics and repair for all engine types.', icon: <Settings size={40} /> },
    { name: 'Oil Change', desc: 'Fast and reliable oil and filter change services.', icon: <Droplets size={40} /> },
    { name: 'Battery Service', desc: 'Battery testing, replacement, and electrical system checks.', icon: <Battery size={40} /> },
    { name: 'Tyre & Wheel', desc: 'Tyre replacement, balancing, alignment, and puncture repair.', icon: <CheckCircle size={40} /> },
    { name: 'AC Service', desc: 'Air conditioning gas refill, cleaning, and repair.', icon: <Fan size={40} /> },
    { name: 'General Service', desc: 'Full vehicle inspection, tuning, and routine maintenance.', icon: <Wrench size={40} /> },
    { name: 'Electrical Repair', desc: 'Wiring, lighting, and electronic component diagnostics.', icon: <Zap size={40} /> },
    { name: 'Body & Paint', desc: 'Denton repair, painting, and scratch removal.', icon: <Shield size={40} /> },
  ];

  return (
    <div style={{ paddingBottom: '80px' }}>
      <section style={{ backgroundColor: 'var(--dark-navy)', color: 'white', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>Our Services</h1>
          <p style={{ color: 'var(--medium-gray)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Find specialized garages for every type of vehicle maintenance and repair.
          </p>
        </div>
      </section>

      <section className="container" style={{ marginTop: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {allServices.map((service, idx) => (
            <div key={idx} className="card" style={{ padding: '40px 30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ color: 'var(--primary-blue)', marginBottom: '20px' }}>
                {service.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>{service.name}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', flex: 1 }}>{service.desc}</p>
              <Link to={`/search?serviceType=${service.name}`} className="btn-secondary" style={{ width: '100%' }}>
                Find Garages
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Services;
