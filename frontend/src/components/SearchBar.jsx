import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Wrench } from 'lucide-react';
import { districts, services } from '../data/services';

const SearchableDropdown = ({ value, onChange, options, placeholder, label, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
      <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--dark-gray)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        {Icon && <Icon size={16} />} {label}
      </label>
      
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder={value || placeholder}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
              onChange(''); // Reset selection if text is cleared
            }
          }}
          onFocus={() => setIsOpen(true)}
          style={{
            width: '100%',
            padding: '12px',
            paddingRight: '36px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--medium-gray)',
            outline: 'none',
            backgroundColor: 'var(--white)',
            fontSize: '0.95rem',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && filteredOptions.length > 0) {
              e.preventDefault();
              handleSelect(filteredOptions[0]);
            }
          }}
        />
        {/* Dropdown indicator */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <span style={{
            display: 'inline-block',
            width: '0',
            height: '0',
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid var(--text-secondary)',
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s'
          }}></span>
        </div>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          backgroundColor: 'var(--white)',
          border: '1px solid var(--medium-gray)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '220px',
          overflowY: 'auto',
          zIndex: 100,
        }} className="custom-scrollbar">
          {filteredOptions.length === 0 ? (
            <div style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              No matches found
            </div>
          ) : (
            <>
              {/* Reset to placeholder default */}
              <div
                onClick={() => handleSelect('')}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  backgroundColor: value === '' ? 'rgba(10, 132, 255, 0.08)' : 'transparent',
                  color: value === '' ? 'var(--primary-blue)' : 'var(--text-primary)',
                  fontWeight: value === '' ? 600 : 400,
                  transition: 'background-color 0.15s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--light-gray)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = value === '' ? 'rgba(10, 132, 255, 0.08)' : 'transparent'}
              >
                {placeholder}
              </div>
              {filteredOptions.map((option) => (
                <div
                  key={option}
                  onClick={() => handleSelect(option)}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    backgroundColor: value === option ? 'rgba(10, 132, 255, 0.08)' : 'transparent',
                    color: value === option ? 'var(--primary-blue)' : 'var(--text-primary)',
                    fontWeight: value === option ? 600 : 400,
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--light-gray)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = value === option ? 'rgba(10, 132, 255, 0.08)' : 'transparent'}
                >
                  {option}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const SearchBar = () => {
  const [district, setDistrict] = useState('');
  const [service, setService] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (district) params.append('district', district);
    if (service) params.append('serviceType', service);
    if (vehicleType) params.append('vehicleType', vehicleType);
    
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div style={{
      backgroundColor: 'var(--white)',
      padding: '24px',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      maxWidth: '900px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 10
    }}>
      <form onSubmit={handleSearch} className="search-form">
        {/* District Searchable Dropdown */}
        <SearchableDropdown
          value={district}
          onChange={setDistrict}
          options={districts}
          placeholder="All Districts"
          label="District"
          icon={MapPin}
        />

        {/* Service Type Searchable Dropdown */}
        <SearchableDropdown
          value={service}
          onChange={setService}
          options={services}
          placeholder="Any Service"
          label="Service Type"
          icon={Wrench}
        />

        {/* Vehicle Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--dark-gray)' }}>
            Vehicle Type
          </label>
          <select 
            value={vehicleType} 
            onChange={(e) => setVehicleType(e.target.value)}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--medium-gray)',
              outline: 'none',
              backgroundColor: 'var(--white)',
              fontSize: '0.95rem',
              height: '46px'
            }}
          >
            <option value="">Any Vehicle</option>
            <option value="Car">Car</option>
            <option value="Van">Van</option>
            <option value="Bike">Bike</option>
            <option value="Three-Wheeler">Three-Wheeler</option>
            <option value="Truck">Truck</option>
            <option value="SUV">SUV</option>
            <option value="Electric Vehicle">Electric Vehicle</option>
          </select>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-primary" style={{
          padding: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          height: '46px'
        }}>
          <Search size={18} /> Find Garages
        </button>
      </form>

      {/* Popular Tags */}
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Popular:</span>
        <button className="tag" onClick={() => navigate('/search?serviceType=Oil Change&district=Colombo')}>Oil Change - Colombo</button>
        <button className="tag" onClick={() => navigate('/search?serviceType=Engine Repair&district=Kandy')}>Engine Repair - Kandy</button>
        <button className="tag" onClick={() => navigate('/search?vehicleType=Electric Vehicle&district=Colombo')}>EV Service - Colombo</button>
      </div>

      <style>{`
        .search-form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          align-items: end;
        }
        @media (max-width: 600px) {
          .search-form {
            grid-template-columns: 1fr;
          }
          .search-form button {
            width: 100%;
            height: 50px !important;
            font-size: 1.05rem;
            margin-top: 10px;
          }
        }
        
        .tag {
          font-size: 0.8rem;
          padding: 4px 10px;
          background-color: var(--light-gray);
          border: 1px solid var(--medium-gray);
          border-radius: 20px;
          color: var(--dark-gray);
          transition: all 0.2s ease;
        }
        .tag:hover {
          background-color: var(--primary-blue);
          color: white;
          border-color: var(--primary-blue);
        }

        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--light-gray);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--medium-gray);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--dark-gray);
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
