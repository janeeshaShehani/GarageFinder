import React, { useState, useEffect, useRef } from 'react';
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
  const [geoError, setGeoError] = useState(null);
  const lastProcessedCoordsRef = useRef(null);
  const [isLocationSimulated, setIsLocationSimulated] = useState(false);
  
  const location = useLocation();

  // 1. Fetch live matching record entries from MongoDB on page mount/URL parameters change
  useEffect(() => {
    const fetchGarages = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(location.search);
        const searchDistrict = searchParams.get('district') || '';
        const searchService = searchParams.get('serviceType') || searchParams.get('service') || '';
        const isNearestParam = searchParams.get('nearest') === 'true';
        
        if (isNearestParam) {
          setShowNearestMode(true);
        }
        
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
    } else {
      setShowNearestMode(true);
    }
  };

  useEffect(() => {
    if (!showNearestMode) {
      setNearestGarages([]);
      setUserLocation(null);
      setGeoError(null);
      setIsLocationSimulated(false);
      lastProcessedCoordsRef.current = null;
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setGeoLoading(false);
      return;
    }

    const handleSuccess = async (position) => {
      if (isLocationSimulated) {
        return;
      }
      const uLat = position.coords.latitude;
      const uLng = position.coords.longitude;

      if (lastProcessedCoordsRef.current) {
        const distanceMoved = calculateDistance(
          lastProcessedCoordsRef.current.latitude,
          lastProcessedCoordsRef.current.longitude,
          uLat,
          uLng
        );
        if (distanceMoved < 0.01) {
          setGeoLoading(false);
          return;
        }
      }

      lastProcessedCoordsRef.current = { latitude: uLat, longitude: uLng };
      setUserLocation({ latitude: uLat, longitude: uLng });

      try {
        const response = await fetch('http://localhost:5000/api/garage/search');
        const allData = await response.json();

        if (response.ok) {
          const coordsGarages = allData.filter(g => 
            g.latitude !== undefined && g.latitude !== null && 
            g.longitude !== undefined && g.longitude !== null
          );

          if (coordsGarages.length === 0) {
            setGeoError("No garages with map coordinates found in the database.");
            setGeoLoading(false);
            return;
          }

          const withDistance = coordsGarages.map(g => {
            const distance = calculateDistance(uLat, uLng, g.latitude, g.longitude);
            return { ...g, distance };
          });

          withDistance.sort((a, b) => a.distance - b.distance);
          const top5 = withDistance.slice(0, 5);

          setNearestGarages(top5);
          
          setSelectedGarageId(prev => {
            if (prev && top5.some(g => g._id === prev)) {
              return prev;
            }
            return top5.length > 0 ? top5[0]._id : null;
          });
        } else {
          setGeoError("Failed to fetch garages database records.");
        }
      } catch (err) {
        console.error("Error fetching nearest garages:", err);
        setGeoError("Network error: Could not fetch garages database records.");
      } finally {
        setGeoLoading(false);
      }
    };

    const handleError = (error) => {
      if (isLocationSimulated) return;

      console.error("GPS Watcher error:", error);
      let msg = "Failed to determine your location.";
      if (error.code === 1) {
        msg = "Location access was denied. Please enable location services in your browser settings.";
      } else if (error.code === 2) {
        msg = "GPS position unavailable. Please check your GPS signal or network connection.";
      } else if (error.code === 3) {
        msg = "Location request timed out. Please try again.";
      }
      setGeoError(msg);
      setGeoLoading(false);
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [showNearestMode, isLocationSimulated]);

  const handleMapClick = async (lat, lng) => {
    setIsLocationSimulated(true);
    setGeoLoading(true);
    setUserLocation({ latitude: lat, longitude: lng });

    try {
      const response = await fetch('http://localhost:5000/api/garage/search');
      const allData = await response.json();

      if (response.ok) {
        const coordsGarages = allData.filter(g => 
          g.latitude !== undefined && g.latitude !== null && 
          g.longitude !== undefined && g.longitude !== null
        );

        if (coordsGarages.length === 0) {
          setGeoError("No garages with map coordinates found in the database.");
          setGeoLoading(false);
          return;
        }

        const withDistance = coordsGarages.map(g => {
          const distance = calculateDistance(lat, lng, g.latitude, g.longitude);
          return { ...g, distance };
        });

        withDistance.sort((a, b) => a.distance - b.distance);
        const top5 = withDistance.slice(0, 5);

        setNearestGarages(top5);
        setSelectedGarageId(prev => {
          if (prev && top5.some(g => g._id === prev)) {
            return prev;
          }
          return top5.length > 0 ? top5[0]._id : null;
        });
      }
    } catch (err) {
      console.error("Error setting custom location:", err);
    } finally {
      setGeoLoading(false);
    }
  };

  const handleResetToGps = () => {
    setIsLocationSimulated(false);
    lastProcessedCoordsRef.current = null;
    setGeoLoading(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const uLat = position.coords.latitude;
          const uLng = position.coords.longitude;
          lastProcessedCoordsRef.current = { latitude: uLat, longitude: uLng };
          setUserLocation({ latitude: uLat, longitude: uLng });
          
          try {
            const response = await fetch('http://localhost:5000/api/garage/search');
            const allData = await response.json();
            if (response.ok) {
              const coordsGarages = allData.filter(g => 
                g.latitude !== undefined && g.latitude !== null && 
                g.longitude !== undefined && g.longitude !== null
              );
              const withDistance = coordsGarages.map(g => {
                const distance = calculateDistance(uLat, uLng, g.latitude, g.longitude);
                return { ...g, distance };
              });
              withDistance.sort((a, b) => a.distance - b.distance);
              const top5 = withDistance.slice(0, 5);
              setNearestGarages(top5);
              setSelectedGarageId(top5.length > 0 ? top5[0]._id : null);
            }
          } catch (err) {
            console.error(err);
          } finally {
            setGeoLoading(false);
          }
        },
        (error) => {
          console.error(error);
          setGeoLoading(false);
        }
      );
    }
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

          {geoError ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.02)' }}>
              <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', marginBottom: '16px' }}>
                <MapPin size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--dark-navy)', marginBottom: '8px' }}>Location Access Error</h2>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
                {geoError}
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={() => setShowNearestMode(false)}>
                  Back to Search
                </button>
                <button className="btn-primary" onClick={() => { setGeoError(null); setGeoLoading(true); handleFindNearest(); }}>
                  Retry Location Search
                </button>
              </div>
            </div>
          ) : geoLoading && !userLocation ? (
            <div className="card" style={{ padding: '60px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <div className="gps-pulse-container">
                <div className="gps-pulse"></div>
                <MapPin size={32} color="var(--primary-blue)" style={{ position: 'relative', zIndex: 2 }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--dark-navy)', margin: 0 }}>Detecting Your GPS Location...</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '360px' }}>
                Please allow browser location permissions if prompted. Determining nearest garages by driving proximity.
              </p>
            </div>
          ) : (
            <div className="nearest-split-container">
              {/* Map Column */}
              <div className="nearest-map-pane">
                {userLocation && (
                  <NearestGaragesMap 
                    userLocation={userLocation}
                    garages={nearestGarages}
                    selectedGarageId={selectedGarageId}
                    onSelectGarage={setSelectedGarageId}
                    onMapClick={handleMapClick}
                    isLocationSimulated={isLocationSimulated}
                  />
                )}
              </div>

              {/* List Column */}
              <div className="nearest-list-pane custom-scrollbar">
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--dark-navy)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <span>Ranked Proximity</span>
                  {isLocationSimulated ? (
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#DB2777', backgroundColor: 'rgba(219, 39, 119, 0.1)', padding: '4px 8px', borderRadius: '12px' }}>
                      Simulated Starting Location
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--success)', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '12px' }}>
                      Live Tracking Active
                    </span>
                  )}
                </h3>

                {isLocationSimulated && (
                  <div style={{
                    backgroundColor: 'rgba(219, 39, 119, 0.04)',
                    border: '1px dashed #EC4899',
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#BE185D', textAlign: 'left', fontWeight: 500 }}>
                      📍 Starting point overridden by map click. Showing nearest garages from custom location.
                    </span>
                    <button 
                      onClick={handleResetToGps} 
                      className="btn-secondary" 
                      style={{ 
                        padding: '4px 12px', 
                        fontSize: '0.75rem', 
                        borderColor: '#EC4899', 
                        color: '#BE185D', 
                        borderRadius: '20px', 
                        fontWeight: 600,
                        backgroundColor: 'var(--white)',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(219, 39, 119, 0.08)' }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--white)' }}
                    >
                      Reset to Live GPS Location
                    </button>
                  </div>
                )}

                {nearestGarages.length === 0 ? (
                  <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>No garages with map locations found in the system.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {nearestGarages.map((garage, index) => {
                      const isSelected = garage._id === selectedGarageId;
                      return (
                        <div 
                          key={garage._id}
                          onClick={() => setSelectedGarageId(garage._id)}
                          className={`nearest-garage-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark-navy)', textAlign: 'left' }}>
                              {index + 1}. {garage.garageName}
                            </h4>
                            <span className={`distance-badge ${isSelected ? 'selected' : ''}`}>
                              {garage.distance} km
                            </span>
                          </div>
                          
                          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'flex-start', gap: '6px', textAlign: 'left' }}>
                            <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: isSelected ? 'var(--primary-blue)' : 'var(--text-secondary)' }} />
                            <span>{garage.address}, {garage.district}</span>
                          </p>

                          {garage.services && garage.services.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                              {garage.services.slice(0, 2).map((svc, i) => (
                                <span key={i} style={{ fontSize: '0.7rem', backgroundColor: 'var(--light-gray)', padding: '2px 6px', borderRadius: '4px', color: 'var(--dark-gray)' }}>
                                  {svc}
                                </span>
                              ))}
                              {garage.services.length > 2 && (
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                                  +{garage.services.length - 2} more
                                </span>
                              )}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                            <Link 
                              to={`/garage/${garage._id}`}
                              className="btn-secondary"
                              style={{ flex: 1, textAlign: 'center', textDecoration: 'none', padding: '8px', fontSize: '0.85rem', fontWeight: 600 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Details
                            </Link>
                            <button
                              className="btn-primary"
                              style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '8px', fontSize: '0.85rem', fontWeight: 600 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${garage.latitude},${garage.longitude}`, '_blank');
                              }}
                            >
                              <Navigation size={12} /> Navigate
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
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

        .nearest-split-container {
          display: flex;
          gap: 24px;
          width: 100%;
          min-height: 500px;
        }

        .nearest-map-pane {
          flex: 1;
          height: 600px;
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }

        .nearest-list-pane {
          width: 400px;
          max-height: 600px;
          overflow-y: auto;
          background-color: var(--white);
          padding: 24px;
          border-radius: var(--radius-xl);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .nearest-garage-card {
          padding: 16px;
          border-radius: var(--radius-lg);
          background-color: var(--white);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }

        .nearest-garage-card:hover {
          transform: translateY(-2px);
          border-color: var(--medium-gray);
          box-shadow: var(--shadow-md);
        }

        .nearest-garage-card.selected {
          background-color: rgba(0, 0, 255, 0.02);
          border: 2px solid var(--primary-blue);
          box-shadow: var(--shadow-md);
        }

        .distance-badge {
          padding: 4px 10px;
          background-color: var(--light-gray);
          color: var(--text-primary);
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          white-space: nowrap;
        }

        .distance-badge.selected {
          background-color: var(--primary-blue);
          color: white;
        }

        /* Pulsing GPS animation for loader */
        .gps-pulse-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
        }

        .gps-pulse {
          position: absolute;
          width: 40px;
          height: 40px;
          background-color: rgba(0, 0, 255, 0.2);
          border-radius: 50%;
          animation: gpsPulseAnim 1.8s infinite ease-in-out;
        }

        @keyframes gpsPulseAnim {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
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
          
          .nearest-split-container {
            flex-direction: column;
            gap: 20px;
          }
          .nearest-map-pane {
            height: 350px;
          }
          .nearest-list-pane {
            width: 100%;
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SearchResults;