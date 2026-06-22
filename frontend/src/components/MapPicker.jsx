import React, { useEffect, useRef, useState } from 'react';

const MapPicker = ({ latitude, longitude, onChange }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically load Leaflet scripts and style sheets
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    // Append CSS
    const linkId = 'leaflet-css-cdn';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }

    // Append JS
    const scriptId = 'leaflet-js-cdn';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        setLeafletLoaded(true);
      };
      script.onerror = () => {
        setErrorMsg('Failed to load map library.');
      };
      document.body.appendChild(script);
    } else {
      // Script is already in DOM but maybe not fully initialized yet
      const checkInterval = setInterval(() => {
        if (window.L) {
          setLeafletLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Initialize and manage the Leaflet map instance
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;

    // Use Colombo, Sri Lanka (6.9271, 79.8612) as default center
    const defaultLat = 6.9271;
    const defaultLng = 79.8612;
    const initialLat = latitude || defaultLat;
    const initialLng = longitude || defaultLng;
    const initialZoom = (latitude && longitude) ? 14 : 7;

    // Override default icon image pathing issue in bundlers (Vite/Webpack)
    const L = window.L;
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([initialLat, initialLng], initialZoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);

      // Handle map clicks to place/update pin
      mapRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        updateMarkerPosition(lat, lng);
      });
    }

    const updateMarkerPosition = (lat, lng) => {
      // Round to 6 decimal places for cleanliness
      const precisionLat = parseFloat(lat.toFixed(6));
      const precisionLng = parseFloat(lng.toFixed(6));
      onChange(precisionLat, precisionLng);
    };

    // Keep map view in sync if external inputs change
    if (latitude && longitude) {
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      } else {
        markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(mapRef.current);
        markerRef.current.on('dragend', () => {
          const position = markerRef.current.getLatLng();
          updateMarkerPosition(position.lat, position.lng);
        });
      }
      mapRef.current.panTo([latitude, longitude]);
    } else {
      // If latitude/longitude are null/empty, remove marker from map
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }

    // Cleanup map on unmount
    return () => {
      // We don't destroy map on every dependency render, but we can clean up reference.
    };
  }, [leafletLoaded, latitude, longitude]);

  // Clean up completely on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const handleClearPin = () => {
    onChange(null, null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ position: 'relative', width: '100%', height: '300px', borderRadius: '8px', border: '1px solid #D1D5DB', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)' }}>
        {!leafletLoaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', zIndex: 10 }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {errorMsg || 'Loading interactive map...'}
            </span>
          </div>
        )}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {latitude && longitude ? (
            <span>Pinned Location: <b>{latitude}</b>, <b>{longitude}</b></span>
          ) : (
            <span style={{ fontStyle: 'italic' }}>Click on the map to pin your garage location.</span>
          )}
        </span>
        {latitude && longitude && (
          <button 
            type="button" 
            onClick={handleClearPin}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
          >
            Clear Location Pin
          </button>
        )}
      </div>
    </div>
  );
};

export default MapPicker;
