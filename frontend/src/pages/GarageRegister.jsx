import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Store, ImagePlus, X } from 'lucide-react';
import { districts, services as servicesList } from '../data/services';
import MapPicker from '../components/MapPicker';

const vehicleTypesList = [
  'Motorbike', 'Three Wheeler', 'Car', 'Van', 'SUV', 'Pickup Cab', 'Lorry', 'Bus'
];

const GarageRegister = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login?redirect=/register-garage" replace />;
  }

  const [formData, setFormData] = useState({
    garageName: '',
    ownerName: '',
    phone: '',
    email: '',
    district: '',
    address: '',
    description: '',
    openTime: '',
    closeTime: '',
    openDays: [],
    vehicleTypes: [],
    services: [],
    latitude: null,
    longitude: null
  });
  const [customService, setCustomService] = useState('');
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      alert('You can only upload a maximum of 10 photos.');
      return;
    }
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImages([...images, ...newImages]);
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleDayChange = (day) => {
    setFormData(prev => {
      const days = prev.openDays.includes(day)
        ? prev.openDays.filter(d => d !== day)
        : [...prev.openDays, day];
      return { ...prev, openDays: days };
    });
  };

  const handleVehicleChange = (vehicle) => {
    setFormData(prev => {
      const vehicles = prev.vehicleTypes.includes(vehicle)
        ? prev.vehicleTypes.filter(v => v !== vehicle)
        : [...prev.vehicleTypes, vehicle];
      return { ...prev, vehicleTypes: vehicles };
    });
  };

  const handleServiceChange = (service) => {
    setFormData(prev => {
      const services = prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services };
    });
  };

  const addCustomService = (e) => {
    e.preventDefault();
    const serviceName = customService.trim();
    if (!serviceName) return;

    if (formData.services.includes(serviceName)) {
      alert("This service is already added.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      services: [...prev.services, serviceName]
    }));
    setCustomService('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.vehicleTypes.length === 0) {
      alert("Please select at least one supported vehicle type.");
      return;
    }

    if (formData.services.length === 0) {
      alert("Please select or add at least one service offered.");
      return;
    }

    // Get the currently logged-in user profile from local cache
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || !currentUser.id) {
      alert("Session missing. Please log in first.");
      navigate('/login');
      return;
    }

    // CRUCIAL: Every required backend field must be explicitly added to this object!
    const garagePayload = {
      owner: currentUser.id,
      garageName: formData.garageName,
      ownerName: formData.ownerName,   // <-- Added to fix your error!
      phone: formData.phone,
      email: formData.email,           // <-- Added to fix your error!
      district: formData.district,
      address: formData.address,
      description: formData.description,
      openTime: formData.openTime,     // <-- Added to fix your error!
      closeTime: formData.closeTime,   // <-- Added to fix your error!
      openDays: formData.openDays,
      vehicleTypes: formData.vehicleTypes,
      services: formData.services,
      latitude: formData.latitude,
      longitude: formData.longitude
    };

    try {
      const response = await fetch("http://localhost:5000/api/garage/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(garagePayload)
      });

      const data = await response.json();

      if (response.ok) {
        // Save the verified database object cleanly to your local client instance
        localStorage.setItem('registeredGarage', JSON.stringify(data.garage));
        
        // Match the frontend user profile status update locally
        currentUser.role = 'garage';
        localStorage.setItem('user', JSON.stringify(currentUser));

        alert("Garage registered successfully! Welcome to your Dashboard.");
        navigate('/dashboard');
      } else {
        alert(`Failed to save profile: ${data.message}`);
      }
    } catch (error) {
      console.error("Network connection issue:", error);
      alert("Something went wrong. Make sure your backend server is running on port 5000.");
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '800px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)', color: 'white', marginBottom: '16px' }}>
            <Store size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dark-navy)' }}>Register Your Garage</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Fill out the details below to list your garage on our platform</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Garage Name</label>
              <input type="text" name="garageName" value={formData.garageName} onChange={handleChange} placeholder="e.g. AutoCare Center" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Owner Name</label>
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="e.g. John Doe" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="077 123 4567" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Business Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="contact@garage.com" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }} className="responsive-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>District</label>
              <select name="district" value={formData.district} onChange={handleChange} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle}>
                <option value="">Select District</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Full Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="e.g. 123 Main Street, City" required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Garage Location on Map (Optional)</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-8px' }}>Pinpoint your garage on the map below. This helps customers route directly to your exact location.</p>
            <MapPicker 
              latitude={formData.latitude} 
              longitude={formData.longitude} 
              onChange={(lat, lng) => setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Tell us about your services and experience (Optional)..." 
              rows="4" 
              style={{...inputStyle, resize: 'vertical'}} 
              onFocus={focusStyle} 
              onBlur={blurStyle}
            ></textarea>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Operating Hours & Days</label>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--dark-gray)', marginBottom: '8px', display: 'block' }}>Open Time</label>
                <input type="time" name="openTime" value={formData.openTime} onChange={handleChange} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--dark-gray)', marginBottom: '8px', display: 'block' }}>Close Time</label>
                <input type="time" name="closeTime" value={formData.closeTime} onChange={handleChange} required style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--dark-gray)', marginBottom: '8px', display: 'block' }}>Open Days</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.openDays.includes(day)}
                      onChange={() => handleDayChange(day)}
                    /> {day.substring(0, 3)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Supported Vehicle Types */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Supported Vehicle Types</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-8px' }}>Select all vehicle types that your garage can service.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', padding: '20px', backgroundColor: 'var(--light-gray)', borderRadius: '8px', border: '1px solid var(--medium-gray)' }}>
              {vehicleTypesList.map(type => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', cursor: 'pointer', userSelect: 'none', padding: '6px', borderRadius: '4px', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input 
                    type="checkbox" 
                    checked={formData.vehicleTypes.includes(type)}
                    onChange={() => handleVehicleChange(type)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Services Offered */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Services Offered</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '-8px' }}>Select all services that your garage offers, or type a custom one below.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', padding: '20px', backgroundColor: 'var(--light-gray)', borderRadius: '8px', border: '1px solid var(--medium-gray)' }}>
              {servicesList.map(service => (
                <label key={service} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', cursor: 'pointer', userSelect: 'none', padding: '6px', borderRadius: '4px', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(10, 132, 255, 0.05)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input 
                    type="checkbox" 
                    checked={formData.services.includes(service)}
                    onChange={() => handleServiceChange(service)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>

            {/* Custom Services entry */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <input 
                type="text" 
                placeholder="Add custom service (e.g., Hybrid Care)"
                value={customService}
                onChange={(e) => setCustomService(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button 
                type="button" 
                onClick={addCustomService} 
                className="btn-secondary" 
                style={{ padding: '0 20px', whiteSpace: 'nowrap' }}
              >
                + Add Custom
              </button>
            </div>

            {/* Selected Services Badges */}
            {formData.services.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {formData.services.map(service => (
                  <span key={service} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'rgba(10, 132, 255, 0.1)',
                    color: 'var(--primary-blue)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {service}
                    <button 
                      type="button" 
                      onClick={() => handleServiceChange(service)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-blue)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        fontSize: '1rem',
                        lineHeight: 1
                      }}
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Garage Photos (Max 10)</label>
            <div style={{
              border: '2px dashed #D1D5DB',
              borderRadius: '8px',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: 'var(--white)',
              transition: 'border-color 0.2s',
            }}
            onClick={() => document.getElementById('imageUpload').click()}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
            >
              <ImagePlus size={32} style={{ color: 'var(--text-secondary)', marginBottom: '10px' }} />
              <p style={{ color: 'var(--text-secondary)', marginBottom: '5px' }}>Click to upload photos</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--medium-gray)' }}>JPG, PNG up to 5MB</p>
              <input 
                type="file" 
                id="imageUpload" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
            </div>

            {images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '10px' }}>
                {images.map((img, index) => (
                  <div key={index} style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={img.preview} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                      style={{
                        position: 'absolute', top: '4px', right: '4px',
                        backgroundColor: 'rgba(0,0,0,0.5)', color: 'white',
                        border: 'none', borderRadius: '50%', width: '24px', height: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: '1.1rem', marginTop: '20px', cursor: 'pointer' }}>
            Register Garage
          </button>
        </form>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .responsive-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', transition: 'border-color 0.2s', width: '100%', backgroundColor: 'var(--white)', fontFamily: 'inherit' };
const focusStyle = (e) => e.target.style.borderColor = '#0A84FF';
const blurStyle = (e) => e.target.style.borderColor = '#D1D5DB';

export default GarageRegister;