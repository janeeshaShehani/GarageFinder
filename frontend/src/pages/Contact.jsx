import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for reaching out! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div style={{ paddingBottom: '80px' }}>
      <section style={{ backgroundColor: 'var(--dark-navy)', color: 'white', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '20px' }}>Contact Us</h1>
          <p style={{ color: 'var(--medium-gray)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
            Have a question or need assistance? We're here to help.
          </p>
        </div>
      </section>

      <section className="container" style={{ marginTop: '60px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
          
          {/* Contact Details */}
          <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--dark-navy)', marginBottom: '20px' }}>Get in Touch</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Whether you're a vehicle owner looking for a specific service or a garage owner wanting to join our platform, feel free to reach out using the form or our contact details below.
              </p>
            </div>

            <div className="card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(10, 132, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Our Office</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>123 Galle Road, Colombo 03, Sri Lanka</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(10, 132, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)' }}>
                  <Phone size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Phone Number</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>+94 11 234 5678</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(10, 132, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-blue)' }}>
                  <Mail size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Email Address</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>info@garagefinder.lk</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card" style={{ flex: '2 1 500px', padding: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Send us a Message</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Your Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Your Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} required style={inputStyle} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows="5" required style={{...inputStyle, resize: 'vertical'}}></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', marginTop: '10px' }}>
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
};

const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', transition: 'border-color 0.2s', width: '100%', backgroundColor: 'var(--white)', fontFamily: 'inherit' };

export default Contact;
