import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Users, Star, Eye, CalendarCheck, Menu, Trash2, UploadCloud, CheckCircle } from 'lucide-react';
import MapPicker from '../components/MapPicker';

const DashboardHome = () => {
  const { garageId } = useParams();
  const [garageDetails, setGarageDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!garageId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/garage/${garageId}`);
        const data = await response.json();
        if (response.ok) {
          setGarageDetails(data);
          localStorage.setItem('registeredGarage', JSON.stringify(data));
        }
      } catch (error) {
        console.error("Dashboard metric synchronization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [garageId]);

  if (isLoading) {
    return <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>Loading your dashboard...</div>;
  }

  const businessName = garageDetails ? garageDetails.garageName : 'Your Garage';

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '4px' }}>Welcome back,</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-blue)', marginBottom: '28px' }}>{businessName}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Total Views" value={garageDetails?.views || "0"} icon={<Eye size={24} />} color="var(--primary-blue)" />
        <StatCard title="Total Reviews" value={garageDetails?.numReviews || "0"} icon={<Star size={24} />} color="var(--warning)" />
        <StatCard title="Booking Requests" value="0" icon={<CalendarCheck size={24} />} color="var(--success)" />
        <StatCard title="Customer Inquiries" value="0" icon={<Users size={24} />} color="#8B5CF6" />
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--dark-navy)', marginBottom: '16px' }}>Recent Activity</h2>
        <div style={{ color: 'var(--text-secondary)' }}>
          Displaying localized operational updates for {businessName}.
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: `${color}20`, color: color, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {icon}
    </div>
    <div>
      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '4px' }}>{title}</h3>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--dark-navy)' }}>{value}</div>
    </div>
  </div>
);

const GaragePhotosEdit = () => {
  const { garageId } = useParams();
  const [photos, setPhotos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchGarage = async () => {
      if (!garageId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/garage/${garageId}`);
        const data = await response.json();
        if (response.ok) {
          setPhotos(data.images || []);
          localStorage.setItem('registeredGarage', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to fetch photos:", err);
      }
    };
    fetchGarage();
  }, [garageId]);

  const handleDelete = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 10) {
      alert('You can only upload a maximum of 10 photos.');
      return;
    }
    
    const newPhotos = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPhotos.push(reader.result);
        if (newPhotos.length === files.length) {
          setPhotos(prev => [...prev, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!garageId) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch(`http://localhost:5000/api/garage/update/${garageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: photos })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('registeredGarage', JSON.stringify(data.garage || data));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(`Failed to save photos: ${data.message}`);
      }
    } catch (error) {
      console.error("Photos update error:", error);
      alert("Network connection error connecting to server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '24px' }}>Garage Photos</h1>
      
      {saveSuccess && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--success)' }}>
          Photos updated successfully!
        </div>
      )}

      <div className="card" style={{ padding: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Upload up to 10 photos of your garage, equipment, and past work.</p>
          <span style={{ fontSize: '0.9rem', color: 'var(--dark-gray)' }}>{photos.length} / 10</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          {photos.map((url, idx) => (
            <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '150px', border: '1px solid var(--medium-gray)' }}>
              <img src={url} alt={`Garage photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button 
                onClick={() => handleDelete(idx)}
                style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                title="Delete Photo"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {photos.length < 10 && (
            <label style={{ 
              border: '2px dashed var(--medium-gray)', borderRadius: '8px', height: '150px',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              cursor: 'pointer', backgroundColor: 'var(--light-gray)', color: 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; e.currentTarget.style.color = 'var(--primary-blue)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--medium-gray)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <UploadCloud size={32} style={{ marginBottom: '8px' }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>Upload Photo</span>
              <input type="file" multiple accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const GarageServicesEdit = () => {
  const { garageId } = useParams();
  const allServicesList = [
    'Engine Repair', 'Oil Change', 'Battery Service', 'Tyre Service', 
    'AC Repair', 'Full Service', 'Electrical Repair', 'Body & Paint',
    'Brake Repair', 'Wheel Alignment', 'Diagnostic Check'
  ];

  const [selectedServices, setSelectedServices] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchGarage = async () => {
      if (!garageId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/garage/${garageId}`);
        const data = await response.json();
        if (response.ok) {
          setSelectedServices(data.services || []);
          localStorage.setItem('registeredGarage', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to fetch services:", err);
      }
    };
    fetchGarage();
  }, [garageId]);

  const handleToggle = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSave = async () => {
    if (!garageId) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch(`http://localhost:5000/api/garage/update/${garageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: selectedServices })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('registeredGarage', JSON.stringify(data.garage || data));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(`Failed to save services: ${data.message}`);
      }
    } catch (error) {
      console.error("Services update error:", error);
      alert("Network connection error connecting to server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '24px' }}>Manage Services</h1>
      
      {saveSuccess && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--success)' }}>
          Services updated successfully!
        </div>
      )}

      <div className="card" style={{ padding: '30px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Select the services your garage offers. This helps vehicle owners find you when they search for specific repairs.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {allServicesList.map((service, idx) => {
            const isSelected = selectedServices.includes(service);
            return (
              <div 
                key={idx}
                onClick={() => handleToggle(service)}
                style={{ 
                  padding: '16px', borderRadius: '8px', border: `2px solid ${isSelected ? 'var(--primary-blue)' : 'var(--medium-gray)'}`,
                  display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(10, 132, 255, 0.05)' : 'var(--white)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', 
                  border: `2px solid ${isSelected ? 'var(--primary-blue)' : 'var(--medium-gray)'}`,
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  backgroundColor: isSelected ? 'var(--primary-blue)' : 'transparent'
                }}>
                  {isSelected && <CheckCircle size={14} color="white" />}
                </div>
                <span style={{ fontWeight: isSelected ? 600 : 400, color: isSelected ? 'var(--dark-navy)' : 'var(--text-secondary)' }}>
                  {service}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const districtsList = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
  'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
  'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Moneragala', 'Ratnapura', 'Kegalle'
];

const vehicleTypesList = [
  'Motorbike', 'Three Wheeler', 'Car', 'Van', 'SUV', 'Pickup Cab', 'Lorry', 'Bus'
];

const GarageDetailsEdit = () => {
  const { garageId } = useParams();
  const [formData, setFormData] = useState({
    _id: '',
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
    images: [],
    latitude: null,
    longitude: null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchGarage = async () => {
      if (!garageId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/garage/${garageId}`);
        const data = await response.json();
        if (response.ok) {
          setFormData(data);
          localStorage.setItem('registeredGarage', JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to fetch garage details:", err);
      }
    };
    fetchGarage();
  }, [garageId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.vehicleTypes.length === 0) {
      alert("Please select at least one supported vehicle type.");
      return;
    }

    if (!garageId) return;
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const response = await fetch(`http://localhost:5000/api/garage/update/${garageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('registeredGarage', JSON.stringify(data.garage || formData));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert(`Update failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Failed to sync structural form records:", error);
      alert("Network connection error connecting to server.");
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyle = { padding: '12px 16px', borderRadius: '8px', border: '1px solid #D1D5DB', outline: 'none', width: '100%', fontFamily: 'inherit' };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '24px' }}>Garage Details</h1>
      
      {saveSuccess && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--success)' }}>
          Garage details updated successfully!
        </div>
      )}

      <div className="card" style={{ padding: '30px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Garage Name</label>
              <input type="text" name="garageName" value={formData.garageName} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Owner Name</label>
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Phone Number</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Business Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>District</label>
              <select name="district" value={formData.district} onChange={handleChange} required style={inputStyle}>
                <option value="">Select District</option>
                {districtsList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Full Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required style={inputStyle} />
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
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{...inputStyle, resize: 'vertical'}}></textarea>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ fontSize: '0.95rem', fontWeight: 500 }}>Operating Hours & Days</label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--dark-gray)', marginBottom: '8px', display: 'block' }}>Open Time</label>
                <input type="time" name="openTime" value={formData.openTime} onChange={handleChange} required style={inputStyle} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--dark-gray)', marginBottom: '8px', display: 'block' }}>Close Time</label>
                <input type="time" name="closeTime" value={formData.closeTime} onChange={handleChange} required style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--dark-gray)', marginBottom: '8px', display: 'block' }}>Open Days</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                  <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.openDays && formData.openDays.includes(day)}
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
                    checked={formData.vehicleTypes && formData.vehicleTypes.includes(type)}
                    onChange={() => handleVehicleChange(type)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px' }}>
            <button type="button" className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GarageAvailabilityEdit = () => {
  const [availability, setAvailability] = useState({
    acceptingBookings: true,
    emergencyService: false,
    statusOverride: 'none'
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (field) => {
    setAvailability({ ...availability, [field]: !availability[field] });
  };

  const handleSave = () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '24px' }}>Manage Availability</h1>
      
      {saveSuccess && (
        <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: 'var(--radius-md)', marginBottom: '24px', border: '1px solid var(--success)' }}>
          Availability settings updated successfully!
        </div>
      )}

      <div className="card" style={{ padding: '30px' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
          Control your real-time status on the GarageFinder platform. Note that your regular operating hours are managed in the <b>Garage Details</b> tab.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--medium-gray)' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--dark-navy)', marginBottom: '4px' }}>Accepting Bookings</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Allow vehicle owners to send booking requests.</p>
            </div>
            <button 
              onClick={() => handleToggle('acceptingBookings')}
              style={{
                width: '50px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                backgroundColor: availability.acceptingBookings ? 'var(--success)' : 'var(--medium-gray)',
                position: 'relative', transition: 'background-color 0.3s'
              }}
            >
              <div style={{
                width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%',
                position: 'absolute', top: '2px', left: availability.acceptingBookings ? '24px' : '2px',
                transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--medium-gray)' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--dark-navy)', marginBottom: '4px' }}>24/7 Emergency Service</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Show a badge on your profile indicating you offer emergency support.</p>
            </div>
            <button 
              onClick={() => handleToggle('emergencyService')}
              style={{
                width: '50px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                backgroundColor: availability.emergencyService ? 'var(--success)' : 'var(--medium-gray)',
                position: 'relative', transition: 'background-color 0.3s'
              }}
            >
              <div style={{
                width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%',
                position: 'absolute', top: '2px', left: availability.emergencyService ? '24px' : '2px',
                transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--dark-navy)', marginBottom: '12px' }}>Manual Status Override</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Temporarily override your regular business hours.</p>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input 
                  type="radio" name="statusOverride" value="none" 
                  checked={availability.statusOverride === 'none'} 
                  onChange={() => setAvailability({...availability, statusOverride: 'none'})}
                />
                Use Regular Hours
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--success)' }}>
                <input 
                  type="radio" name="statusOverride" value="force_open" 
                  checked={availability.statusOverride === 'force_open'} 
                  onChange={() => setAvailability({...availability, statusOverride: 'force_open'})}
                />
                Force Open
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--danger)' }}>
                <input 
                  type="radio" name="statusOverride" value="force_closed" 
                  checked={availability.statusOverride === 'force_closed'} 
                  onChange={() => setAvailability({...availability, statusOverride: 'force_closed'})}
                />
                Force Closed
              </label>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', justifycontent: 'flex-end' }}>
          <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const GarageReviewsView = () => {
  const { garageId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const reviewsWithComments = reviews.filter(rev => rev.comment && rev.comment.trim() !== '');

  useEffect(() => {
    const fetchReviews = async () => {
      if (!garageId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5000/api/reviews?garageId=${garageId}`);
        const data = await response.json();
        if (response.ok) {
          setReviews(data);
        }
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [garageId]);

  if (loading) {
    return <div style={{ color: 'var(--text-secondary)', padding: '20px' }}>Loading reviews...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '24px' }}>Customer Reviews</h1>
      
      {reviewsWithComments.length === 0 ? (
        <div className="card" style={{ padding: '24px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          No reviews yet. As customers rate and comment on your garage, they will appear here.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {reviewsWithComments.map(review => {
            const reviewerName = review.user?.name || review.name || 'Anonymous User';
            const reviewDate = review.createdAt ? new Date(review.createdAt).toISOString().split('T')[0] : '';
            return (
              <div key={review._id || review.id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--dark-navy)' }}>{reviewerName}</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{reviewDate}</span>
                  </div>

                </div>
                
                <p style={{ color: 'var(--dark-gray)', lineHeight: 1.6, marginBottom: review.reply ? '16px' : '0' }}>
                  "{review.comment}"
                </p>

                {review.reply ? (
                  <div style={{ backgroundColor: 'var(--light-gray)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--primary-blue)' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-blue)', display: 'block', marginBottom: '4px' }}>Your Reply:</span>
                    <p style={{ fontSize: '0.95rem', color: 'var(--dark-gray)' }}>{review.reply}</p>
                  </div>
                ) : (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Write a reply..." 
                      style={{ flex: 1, padding: '10px 16px', borderRadius: '6px', border: '1px solid var(--medium-gray)', outline: 'none' }} 
                    />
                    <button className="btn-secondary" style={{ padding: '10px 16px' }}>Reply</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const GarageSelectorScreen = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGarages = async () => {
      if (!currentUser || !currentUser.id) return;
      try {
        const response = await fetch(`http://localhost:5000/api/garage/owner/${currentUser.id}/all`);
        const data = await response.json();
        if (response.ok) {
          setGarages(data);
          if (data.length === 1) {
            navigate(`/dashboard/${data[0]._id}`, { replace: true });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGarages();
  }, []);

  const handleDeleteGarage = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone and will delete all reviews and data associated with it.`)) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/garage/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const remaining = garages.filter(g => g._id !== id);
        setGarages(remaining);
        
        if (remaining.length === 0) {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user) {
            user.role = 'customer';
            localStorage.setItem('user', JSON.stringify(user));
            // Force reload to update Navbar / sidebar state and show empty dashboard
            window.location.reload();
          }
        } else {
          alert("Garage deleted successfully.");
        }
      } else {
        const data = await response.json();
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    }
  };

  if (loading) {
    return <div style={{ padding: '100px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your garages...</div>;
  }

  if (garages.length === 0) {
    return (
      <div style={{ maxWidth: '500px', margin: '100px auto', textAlign: 'center', padding: '40px' }} className="card">
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '16px' }}>No Garage Listed</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6 }}>You haven't registered any garages yet. List your garage now to access the dashboard and manage bookings.</p>
        <Link to="/register-garage" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Register Your Garage</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '12px' }}>Your Garages</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Select a garage to view and manage its dashboard metrics.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {garages.map(g => (
          <div key={g._id} className="card" style={{ position: 'relative', padding: '30px', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--medium-gray)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease', cursor: 'pointer' }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
            onClick={() => navigate(`/dashboard/${g._id}`)}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteGarage(g._id, g.garageName);
              }}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)',
                border: 'none', borderRadius: '50%', width: '36px', height: '36px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                cursor: 'pointer', transition: 'all 0.2s ease',
                zIndex: 10
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--danger)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.color = 'var(--danger)';
              }}
              title="Delete Garage Listing"
            >
              <Trash2 size={16} />
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '8px', paddingRight: '40px' }}>{g.garageName}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
              <span style={{ backgroundColor: 'var(--light-gray)', padding: '4px 8px', borderRadius: '4px', fontWeight: 600, marginRight: '8px' }}>{g.district}</span>
              {g.address}
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', justifycontent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--light-gray)', paddingTop: '16px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Rating: <b>{g.rating || 'New'}</b></span>
              <span style={{ color: 'var(--primary-blue)', fontWeight: 600, fontSize: '0.9rem' }}>Manage &rarr;</span>
            </div>
          </div>
        ))}

        <div className="card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px', border: '2px dashed var(--medium-gray)', backgroundColor: 'transparent', textAlign: 'center' }}>
          <Link to="/register-garage" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--primary-blue)' }}>
            <span style={{ fontSize: '3rem', lineHeight: 1 }}>+</span>
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Register New Garage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

const GarageDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Extract active garage ID from /dashboard/:garageId/...
  const pathParts = location.pathname.split('/');
  const activeGarageId = pathParts[2] && pathParts[2] !== 'services' && pathParts[2] !== 'details' && pathParts[2] !== 'photos' && pathParts[2] !== 'availability' && pathParts[2] !== 'reviews' ? pathParts[2] : '';
  const showSidebar = activeGarageId && activeGarageId !== '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--light-gray)' }}>
      {showSidebar && <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />}
      
      <div className="dashboard-content" style={{ flex: 1, padding: showSidebar ? '40px' : '20px', overflowY: 'auto' }}>
        {showSidebar && (
          <div className="mobile-header" style={{ display: 'none', alignItems: 'center', marginBottom: '24px' }}>
            <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginRight: '16px' }}>
              <Menu size={28} color="var(--dark-navy)" />
            </button>
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--dark-navy)' }}>Dashboard</span>
          </div>
        )}

        <Routes>
          <Route path="/" element={<GarageSelectorScreen />} />
          <Route path="/:garageId" element={<DashboardHome />} />
          <Route path="/:garageId/services" element={<GarageServicesEdit />} />
          <Route path="/:garageId/details" element={<GarageDetailsEdit />} />
          <Route path="/:garageId/photos" element={<GaragePhotosEdit />} />
          <Route path="/:garageId/availability" element={<GarageAvailabilityEdit />} />
          <Route path="/:garageId/reviews" element={<GarageReviewsView />} />
        </Routes>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .dashboard-content {
            padding: 20px !important;
          }
          .mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};

export default GarageDashboard;