import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, TrendingUp } from 'lucide-react';

const About = () => {
  return (
    <div style={{ paddingBottom: '80px' }}>
      <section style={{ backgroundColor: 'var(--dark-navy)', color: 'white', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>About GarageFinder</h1>
          <p style={{ color: 'var(--medium-gray)', fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto' }}>
            Connecting vehicle owners with trusted, verified, and highly-rated mechanics across Sri Lanka.
          </p>
        </div>
      </section>

      <section className="container" style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '80px' }}>
        
        {/* Mission */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 400px' }}>
            <h2 style={{ fontSize: '2rem', color: 'var(--dark-navy)', marginBottom: '20px' }}>Our Mission</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '16px', lineHeight: 1.6 }}>
              At GarageFinder, our mission is to simplify vehicle maintenance. We understand the frustration of finding a reliable mechanic when you need one the most. 
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
              We've built a platform that brings transparency to the auto repair industry in Sri Lanka, allowing you to compare garages based on real customer reviews, ratings, and service availability.
            </p>
          </div>
          <div style={{ flex: '1 1 400px', backgroundColor: 'var(--light-gray)', borderRadius: 'var(--radius-lg)', padding: '60px', display: 'flex', justifyContent: 'center' }}>
            <img src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80" alt="Mechanic working" style={{ width: '100%', borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>

        {/* Why Choose Us */}
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--dark-navy)', marginBottom: '40px', textAlign: 'center' }}>Why Choose GarageFinder?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <div className="card" style={{ padding: '40px 30px', textAlign: 'center' }}>
              <ShieldCheck size={48} style={{ color: 'var(--primary-blue)', margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>Verified Garages</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Every garage on our platform is verified to ensure they provide quality services and use genuine parts.</p>
            </div>
            <div className="card" style={{ padding: '40px 30px', textAlign: 'center' }}>
              <Users size={48} style={{ color: 'var(--primary-blue)', margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>Community Reviews</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Make informed decisions based on genuine reviews and ratings left by other vehicle owners in your community.</p>
            </div>
            <div className="card" style={{ padding: '40px 30px', textAlign: 'center' }}>
              <TrendingUp size={48} style={{ color: 'var(--primary-blue)', margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '15px' }}>Grow Your Business</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Are you a garage owner? Join our network to increase your visibility and reach thousands of potential new customers.</p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', backgroundColor: 'var(--white)', padding: '40px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--medium-gray)' }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Need a repair?</h3>
            <Link to="/search" className="btn-primary">Find a Garage Near You</Link>
          </div>
          <div style={{ width: '1px', backgroundColor: 'var(--medium-gray)', display: 'block' }}></div>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Own a garage?</h3>
            <Link to="/register-garage" className="btn-secondary">Register Your Garage</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
