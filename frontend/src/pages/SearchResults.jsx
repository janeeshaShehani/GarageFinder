import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GarageCard from '../components/GarageCard';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { districts, services } from '../data/services';

const SearchResults = () => {
  const [allGarages, setAllGarages] = useState([]);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [districtSearch, setDistrictSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  
  const location = useLocation();

  // 1. Fetch live matching record entries from MongoDB on page mount/URL parameters change
  useEffect(() => {
    const fetchGarages = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(location.search);
        const searchDistrict = searchParams.get('district') || '';
        const searchService = searchParams.get('serviceType') || searchParams.get('service') || '';
        
        // Sync the sidebar checkbox check states with initial URL gateway lookups
        if (searchDistrict && searchDistrict !== '') {
          setSelectedDistricts([searchDistrict]);
        } else {
          setSelectedDistricts([]);
        }
        
        if (searchService && searchService !== '') {
          setSelectedServices([searchService]);
        } else {
          setSelectedServices([]);
        }

        // Send a dynamic request over to your backend endpoint query filter
        const response = await fetch(`http://localhost:5000/api/garage/search?district=${searchDistrict}&serviceType=${searchService}`);
        const data = await response.json();

        if (response.ok) {
          setAllGarages(data); // Cache full collection return array
          setGarages(data);    // Render active results view
        } else {
          console.error("Database query processing failed");
        }
      } catch (error) {
        console.error("Network search error connection:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGarages();
  }, [location.search]);

  // 2. Refined filter implementation to dynamically calculate against state selections
  const handleApplyFilters = () => {
    let filtered = allGarages;
    
    if (selectedDistricts.length > 0) {
      filtered = filtered.filter(g => selectedDistricts.includes(g.district));
    }
    
    if (selectedServices.length > 0) {
      filtered = filtered.filter(g => 
        g.services && g.services.some(s => selectedServices.includes(s))
      );
    }
    
    setGarages(filtered);
    setShowMobileFilters(false);
  };

  const handleDistrictChange = (d) => {
    setSelectedDistricts(prev => 
      prev.includes(d) ? prev.filter(item => item !== d) : [...prev, d]
    );
  };

  const handleServiceChange = (s) => {
    setSelectedServices(prev => 
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <div className="results-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dark-navy)' }}>Search Results</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Showing {garages.length} garages based on your criteria</p>
        </div>
        <button 
          className="btn-secondary mobile-filter-btn" 
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal size={18} /> Sort & Filter
        </button>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        {/* Sidebar Filters */}
        <div style={{ width: '280px', flexShrink: 0, display: showMobileFilters ? 'block' : 'none' }} className="desktop-sidebar">
          <div className="card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Filter size={18} /> Filters
              </h3>
              <button className="mobile-close-btn" onClick={() => setShowMobileFilters(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', marginBottom: '10px' }}>District</h4>
              <input
                type="text"
                placeholder="Search district..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--medium-gray)',
                  outline: 'none',
                  fontSize: '0.85rem',
                  marginBottom: '10px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                {districts.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase())).length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '4px' }}>No matches found</div>
                ) : (
                  districts.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase())).map(d => (
                    <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedDistricts.includes(d)}
                        onChange={() => handleDistrictChange(d)}
                      /> {d}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--dark-gray)', marginBottom: '10px' }}>Services</h4>
              <input
                type="text"
                placeholder="Search service..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--medium-gray)',
                  outline: 'none',
                  fontSize: '0.85rem',
                  marginBottom: '10px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }} className="custom-scrollbar">
                {services.filter(s => s.toLowerCase().includes(serviceSearch.toLowerCase())).length === 0 ? (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '4px' }}>No matches found</div>
                ) : (
                  services.filter(s => s.toLowerCase().includes(serviceSearch.toLowerCase())).map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={selectedServices.includes(s)}
                        onChange={() => handleServiceChange(s)}
                      /> {s}
                    </label>
                  ))
                )}
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </div>
        </div>

        {/* Results Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
              Loading garages...
            </div>
          ) : garages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--dark-navy)', marginBottom: '10px' }}>No garages found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {garages.map(garage => (
                <GarageCard key={garage._id} garage={garage} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        /* Premium custom scrollbar styling */
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

        @media (min-width: 992px) {
          .desktop-sidebar { display: block !important; }
          .mobile-filter-btn { display: none !important; }
          .mobile-close-btn { display: none !important; }
        }
        @media (max-width: 991px) {
          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .results-header .mobile-filter-btn {
            width: 100%;
          }
          .desktop-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100% !important;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            padding: 40px 20px;
            overflow-y: auto;
          }
          .desktop-sidebar > .card {
            max-width: 400px;
            margin: 0 auto;
            position: relative !important;
            top: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchResults;