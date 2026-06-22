import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import GarageCard from '../components/GarageCard';
import { Filter, SlidersHorizontal, X, MapPin, Navigation, ArrowLeft } from 'lucide-react';
import { districts, services } from '../data/services';
import NearestGaragesMap from '../components/NearestGaragesMap';

const SearchResults = () => {
  const [allGarages, setAllGarages] = useState([]);
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [districtSearch, setDistrictSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  
  const [showNearestMode, setShowNearestMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestGarages, setNearestGarages] = useState([]);
  const [selectedGarageId, setSelectedGarageId] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  
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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(2)); // Distance in km with 2 decimal places
  };

  const handleFindNearest = () => {
    if (showNearestMode) {
      setShowNearestMode(false);
      return;
    }

    setGeoLoading(true);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        setUserLocation({ latitude: uLat, longitude: uLng });

        try {
          // Fetch all garages to do global distance calculation
          const response = await fetch('http://localhost:5000/api/garage/search');
          const allData = await response.json();

          if (response.ok) {
            // Filter only garages that have coordinates set
            const coordsGarages = allData.filter(g => 
              g.latitude !== undefined && g.latitude !== null && 
              g.longitude !== undefined && g.longitude !== null
            );

            if (coordsGarages.length === 0) {
              alert("No garages with map locations found in the system. Please register garage locations first.");
              setGeoLoading(false);
              return;
            }

            // Calculate distance using Haversine formula
            const withDistance = coordsGarages.map(g => {
              const distance = calculateDistance(uLat, uLng, g.latitude, g.longitude);
              return { ...g, distance };
            });

            // Sort by distance ascending
            withDistance.sort((a, b) => a.distance - b.distance);

            // Take top 5
            const top5 = withDistance.slice(0, 5);

            setNearestGarages(top5);
            if (top5.length > 0) {
              setSelectedGarageId(top5[0]._id);
            }
            setShowNearestMode(true);
          } else {
            alert("Failed to retrieve garage list for distance calculation.");
          }
        } catch (err) {
          console.error("Error fetching garages:", err);
          alert("Network error fetching garage list.");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(`Failed to fetch your location: ${error.message}. Please check your location permissions.`);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      
      {showNearestMode ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dark-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={28} color="var(--primary-blue)" /> Nearest 5 Garages
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
                Displaying the closest garages within GPS reach. Select a garage to view its direct path.
              </p>
            </div>
            <button 
              className="btn-secondary" 
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setShowNearestMode(false)}
            >
              <ArrowLeft size={16} /> Back to Search Results
            </button>
          </div>

          {/* Interactive Map */}
          {userLocation && (
            <NearestGaragesMap 
              userLocation={userLocation}
              garages={nearestGarages}
              selectedGarageId={selectedGarageId}
              onSelectGarage={setSelectedGarageId}
            />
          )}

          {/* List under the Map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--dark-navy)', borderBottom: '2px solid var(--medium-gray)', paddingBottom: '10px', margin: 0 }}>
              Nearest Garages List
            </h3>

            {nearestGarages.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No garages with map locations found in the system.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {nearestGarages.map((garage, index) => {
                  const isSelected = garage._id === selectedGarageId;
                  return (
                    <div 
                      key={garage._id}
                      onClick={() => setSelectedGarageId(garage._id)}
                      style={{
                        padding: '24px',
                        borderRadius: 'var(--radius-lg)',
                        backgroundColor: isSelected ? 'rgba(10, 132, 255, 0.04)' : 'var(--white)',
                        border: `2px solid ${isSelected ? 'var(--primary-blue)' : 'var(--medium-gray)'}`,
                        boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '16px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--dark-navy)' }}>
                            {index + 1}. {garage.garageName}
                          </h4>
                          <span style={{ 
                            padding: '6px 12px', 
                            backgroundColor: isSelected ? 'var(--primary-blue)' : 'var(--light-gray)', 
                            color: isSelected ? 'white' : 'var(--text-primary)', 
                            borderRadius: '20px', 
                            fontSize: '0.85rem', 
                            fontWeight: 700,
                            whiteSpace: 'nowrap'
                          }}>
                            {garage.distance} km
                          </span>
                        </div>
                        
                        <p style={{ margin: '12px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                          <MapPin size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary-blue)' }} />
                          <span>{garage.address}, {garage.district}</span>
                        </p>

                        {garage.services && garage.services.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px' }}>
                            {garage.services.slice(0, 3).map((svc, i) => (
                              <span key={i} style={{ fontSize: '0.75rem', backgroundColor: 'var(--light-gray)', padding: '2px 8px', borderRadius: '4px', color: 'var(--dark-gray)' }}>
                                {svc}
                              </span>
                            ))}
                            {garage.services.length > 3 && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                                +{garage.services.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <Link 
                          to={`/garage/${garage._id}`}
                          className="btn-secondary"
                          style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '10px', fontSize: '0.9rem', fontWeight: 600 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Details
                        </Link>
                        <button
                          className="btn-primary"
                          style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', padding: '10px', fontSize: '0.9rem', fontWeight: 600 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${garage.latitude},${garage.longitude}`, '_blank');
                          }}
                        >
                          <Navigation size={14} /> Directions
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="results-header">
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--dark-navy)' }}>Search Results</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Showing {garages.length} garages based on your criteria</p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                type="button"
                className="btn-primary" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  backgroundColor: 'var(--primary-blue)'
                }}
                onClick={handleFindNearest}
                disabled={geoLoading}
              >
                📍 {geoLoading ? 'Finding Location...' : 'Show Nearest 5 Garages'}
              </button>
              
              <button 
                className="btn-secondary mobile-filter-btn" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => setShowMobileFilters(true)}
              >
                <SlidersHorizontal size={18} /> Sort & Filter
              </button>
            </div>
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
        </>
      )}
      
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