import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { Settings, Wrench, Battery, CheckCircle, Store, Shield } from 'lucide-react';

const Home = () => {
  const serviceCategories = [
    { name: 'Engine Repair', icon: <Settings size={32} /> },
    { name: 'Oil Change', icon: <Wrench size={32} /> },
    { name: 'Battery Service', icon: <Battery size={32} /> },
    { name: 'Tyre Service', icon: <CheckCircle size={32} /> },
  ];

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(135deg, var(--dark-navy) 0%, #1a2a4c 100%)',
        padding: '120px 0 160px',
        color: 'white',
        textAlign: 'center'
      }}>
        {/* Background decorative elements */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle at center, #0A84FF 0%, transparent 70%)'
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: '20px',
            lineHeight: 1.2,
            
          }}>
            Find the Perfect <span className="gradient-text">Garage</span><br/> for Your Vehicle
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--medium-gray)',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Discover trusted vehicle service centers across Sri Lanka based on your location, vehicle type, and needed services.
          </p>
        </div>
      </section>

      {/* Search Bar Section (Overlaps Hero) */}
      <div className="container" style={{ marginTop: '-100px' }}>
        <SearchBar />
      </div>

      {/* How It Works */}
      <section className="container" style={{ marginTop: '100px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '40px', color: 'var(--dark-navy)' }}>
          How It Works
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px'
        }}>
          {[
            { step: '1', title: 'Search', desc: 'Enter your location and needed service.' },
            { step: '2', title: 'Compare', desc: 'View garages, read reviews, and check ratings.' },
            { step: '3', title: 'Connect', desc: 'Call the garage directly or get directions.' },
          ].map((item, index) => (
            <div key={index} className="card" style={{ padding: '30px' }}>
              <div style={{
                width: '50px', height: '50px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-blue)',
                color: 'white',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '1.5rem', fontWeight: 'bold',
                margin: '0 auto 20px'
              }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Service Categories */}
      <section style={{ backgroundColor: 'var(--white)', padding: '80px 0', marginTop: '80px' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '40px', textAlign: 'center', color: 'var(--dark-navy)' }}>
            Popular Service Categories
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            {serviceCategories.map((cat, index) => (
              <div key={index} className="card category-card" style={{
                padding: '30px',
                textAlign: 'center',
                cursor: 'pointer'
              }}>
                <div style={{ color: 'var(--primary-blue)', marginBottom: '15px' }}>
                  {cat.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{cat.name}</h3>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/services" className="btn-secondary">View All Services</Link>
          </div>
        </div>
      </section>

      {/* Garage Owner CTA */}
      <section className="container" style={{ marginTop: '80px' }}>
        <div style={{
          background: 'linear-gradient(90deg, var(--primary-blue) 0%, #00C6FF 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '60px 40px',
          color: 'white',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '30px'
        }}>
          <div style={{ flex: '1 1 500px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '20px' }}>
              Are you a Garage Owner?
            </h2>
            <p style={{ fontSize: '1rem', marginBottom: '30px', opacity: 0.9 }}>
              List your garage on our platform to reach thousands of vehicle owners looking for services in your area. Manage bookings, respond to reviews, and grow your business.
            </p>
            <Link to="/register-garage" className="btn-primary" style={{ 
              backgroundColor: 'var(--white)', 
              color: 'var(--primary-blue)',
              fontSize: '1rem',
              padding: '12px 30px'
            }}>
              Register Your Garage Now
            </Link>
          </div>
          <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}>
            <Store size={150} opacity={0.2} />
          </div>
        </div>
      </section>

      <style>{`
        .category-card {
          transition: all 0.3s ease;
        }
        .category-card:hover {
          background-color: var(--primary-blue);
          color: white;
          transform: translateY(-5px);
        }
        .category-card:hover div {
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Home;
