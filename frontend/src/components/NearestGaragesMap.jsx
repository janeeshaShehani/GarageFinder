import React, { useEffect, useRef, useState } from 'react';

const NearestGaragesMap = ({ userLocation, garages, selectedGarageId, onSelectGarage }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const garageMarkersRef = useRef({});
  const polylinesRef = useRef({});
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
      const checkInterval = setInterval(() => {
        if (window.L) {
          setLeafletLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Initialize and update the Leaflet map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || !userLocation) return;

    const L = window.L;

    // Define custom marker icons
    const GarageIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const SelectedGarageIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [30, 48],
      iconAnchor: [15, 48],
      popupAnchor: [1, -40],
      shadowSize: [48, 48]
    });

    const UserIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([userLocation.latitude, userLocation.longitude], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Update user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);
    } else {
      userMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], { icon: UserIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>Your Location</b>')
        .openPopup();
    }

    // Clean up old garage markers and lines
    Object.values(garageMarkersRef.current).forEach(m => mapRef.current.removeLayer(m));
    Object.values(polylinesRef.current).forEach(p => mapRef.current.removeLayer(p));
    garageMarkersRef.current = {};
    polylinesRef.current = {};

    // Render new markers and direction paths
    const bounds = L.latLngBounds([userLocation.latitude, userLocation.longitude]);

    garages.forEach((garage, index) => {
      if (!garage.latitude || !garage.longitude) return;

      const isSelected = garage._id === selectedGarageId;
      const markerIcon = isSelected ? SelectedGarageIcon : GarageIcon;

      // Create marker
      const marker = L.marker([garage.latitude, garage.longitude], { icon: markerIcon })
        .addTo(mapRef.current)
        .bindPopup(`<b>${index + 1}. ${garage.garageName}</b><br/>${garage.address}<br/>${garage.distance} km away`);
      
      marker.on('click', () => {
        onSelectGarage(garage._id);
      });

      if (isSelected) {
        marker.openPopup();
      }

      garageMarkersRef.current[garage._id] = marker;
      bounds.extend([garage.latitude, garage.longitude]);

      // Create direction line (polyline)
      const lineOpts = isSelected 
        ? { color: 'var(--primary-blue)', weight: 5, opacity: 0.9 }
        : { color: 'var(--dark-gray)', weight: 2, dashArray: '5, 8', opacity: 0.6 };

      const polyline = L.polyline(
        [
          [userLocation.latitude, userLocation.longitude],
          [garage.latitude, garage.longitude]
        ], 
        lineOpts
      ).addTo(mapRef.current);

      polyline.on('click', () => {
        onSelectGarage(garage._id);
      });

      polylinesRef.current[garage._id] = polyline;
    });

    // Fit map to fit all markers nicely
    if (garages.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [40, 40] });
    }

  }, [leafletLoaded, userLocation, garages]);

  // Handle selected garage change - pan & highlight
  useEffect(() => {
    if (!mapRef.current || !selectedGarageId || !leafletLoaded) return;

    // Pan to selected garage
    const selectedMarker = garageMarkersRef.current[selectedGarageId];
    if (selectedMarker) {
      selectedMarker.openPopup();
      const latlng = selectedMarker.getLatLng();
      mapRef.current.panTo(latlng);
    }

    // Update styles for lines
    Object.keys(polylinesRef.current).forEach(garageId => {
      const polyline = polylinesRef.current[garageId];
      const isSelected = garageId === selectedGarageId;

      if (polyline) {
        if (isSelected) {
          polyline.setStyle({ color: 'var(--primary-blue)', weight: 5, dashArray: null, opacity: 0.9 });
          polyline.bringToFront();
        } else {
          polyline.setStyle({ color: 'var(--dark-gray)', weight: 2, dashArray: '5, 8', opacity: 0.6 });
        }
      }
    });

  }, [selectedGarageId, leafletLoaded]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        userMarkerRef.current = null;
        garageMarkersRef.current = {};
        polylinesRef.current = {};
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--medium-gray)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', marginBottom: '30px' }}>
      {!leafletLoaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', zIndex: 10 }}>
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            {errorMsg || 'Loading Interactive Directions Map...'}
          </span>
        </div>
      )}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
    </div>
  );
};

export default NearestGaragesMap;
