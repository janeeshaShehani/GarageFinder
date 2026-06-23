import React, { useEffect, useRef, useState } from 'react';

const NearestGaragesMap = ({ userLocation, garages, selectedGarageId, onSelectGarage, onMapClick, isLocationSimulated }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const garageMarkersRef = useRef({});
  const polylinesRef = useRef({});
  const infoWindowsRef = useRef({});
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dynamically load Google Maps scripts
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-js-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleMapsLoaded(true);
      };
      script.onerror = () => {
        setErrorMsg('Failed to load Google Maps library.');
      };
      document.body.appendChild(script);
    } else {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          setGoogleMapsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  // Marker icon definition generator
  const getMarkerIcon = (color, scale) => {
    return {
      path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
      fillColor: color,
      fillOpacity: 1,
      strokeColor: '#FFFFFF',
      strokeWeight: 1.8,
      scale: scale * 1.5,
      anchor: new window.google.maps.Point(12, 22),
    };
  };

  // Initialize and update Map & Markers
  useEffect(() => {
    if (!googleMapsLoaded || !mapContainerRef.current || !userLocation) return;

    const google = window.google;

    // 1. Initialize Map
    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        center: { lat: userLocation.latitude, lng: userLocation.longitude },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: "poi.business",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      // Add Map click listener for simulating starting location
      mapRef.current.addListener('click', (e) => {
        if (onMapClick) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      });
    } else {
      // Keep center updated if user moves
      mapRef.current.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
    }

    const userMarkerTitle = isLocationSimulated ? 'Simulated Starting Location' : 'Your Location';
    const userMarkerColor = isLocationSimulated ? '#EC4899' : '#0000FF'; // Pink vs Blue

    // 2. Update User Location Marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setPosition({ lat: userLocation.latitude, lng: userLocation.longitude });
      userMarkerRef.current.setTitle(userMarkerTitle);
      userMarkerRef.current.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: userMarkerColor,
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2.5,
      });
    } else {
      userMarkerRef.current = new google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: mapRef.current,
        title: userMarkerTitle,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: userMarkerColor,
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2.5,
        }
      });

      const userIW = new google.maps.InfoWindow();
      userMarkerRef.current.addListener('click', () => {
        userIW.setContent(`<div style="font-family: Inter, sans-serif; font-size: 0.85rem; font-weight: 600; padding: 4px; color: var(--dark-navy);">${isLocationSimulated ? 'Simulated Starting Location' : 'Your Location'}</div>`);
        userIW.open(mapRef.current, userMarkerRef.current);
      });
    }

    // 3. Clear existing garage markers and lines
    Object.values(garageMarkersRef.current).forEach(m => m.setMap(null));
    Object.values(polylinesRef.current).forEach(p => p.setMap(null));
    garageMarkersRef.current = {};
    polylinesRef.current = {};
    infoWindowsRef.current = {};

    const bounds = new google.maps.LatLngBounds();
    bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });

    const directionsService = new google.maps.DirectionsService();

    // 4. Render new garage markers and fetch directions
    garages.forEach((garage, index) => {
      if (!garage.latitude || !garage.longitude) return;

      const isSelected = garage._id === selectedGarageId;
      const markerColor = isSelected ? '#F59E0B' : '#EF4444'; // Gold vs Red
      const markerScale = isSelected ? 1.4 : 1.1;

      // Add to bounds
      bounds.extend({ lat: garage.latitude, lng: garage.longitude });

      // Create Marker
      const marker = new google.maps.Marker({
        position: { lat: garage.latitude, lng: garage.longitude },
        map: mapRef.current,
        title: garage.garageName,
        icon: getMarkerIcon(markerColor, markerScale)
      });

      // Create InfoWindow
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-family: Inter, sans-serif; padding: 8px; max-width: 220px;">
            <h4 style="margin: 0 0 6px 0; font-size: 0.95rem; font-weight: 700; color: var(--dark-navy); text-align: left;">
              ${index + 1}. ${garage.garageName}
            </h4>
            <p style="margin: 0 0 6px 0; font-size: 0.8rem; color: var(--text-secondary); text-align: left; line-height: 1.4;">
              ${garage.address}
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 6px; margin-top: 6px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--primary-blue);">${garage.distance} km away</span>
              <span style="font-size: 0.75rem; color: var(--success); font-weight: 600;">Driving Route</span>
            </div>
          </div>
        `
      });

      // Click listener to select
      marker.addListener('click', () => {
        onSelectGarage(garage._id);
      });

      // Store references
      garageMarkersRef.current[garage._id] = marker;
      infoWindowsRef.current[garage._id] = infoWindow;

      // Fetch Driving Directions from Google API
      directionsService.route(
        {
          origin: { lat: userLocation.latitude, lng: userLocation.longitude },
          destination: { lat: garage.latitude, lng: garage.longitude },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            const pathCoordinates = result.routes[0].overview_path;

            const isCurrentSelected = garage._id === selectedGarageId;
            const polyline = new google.maps.Polyline({
              path: pathCoordinates,
              map: mapRef.current,
              strokeColor: isCurrentSelected ? '#0000FF' : '#9CA3AF', // Primary Blue vs Gray
              strokeWeight: isCurrentSelected ? 6 : 3,
              strokeOpacity: isCurrentSelected ? 0.95 : 0.45,
              zIndex: isCurrentSelected ? 100 : 10,
            });

            // Polyline click selection
            polyline.addListener('click', () => {
              onSelectGarage(garage._id);
            });

            polylinesRef.current[garage._id] = polyline;
          } else {
            console.error(`Directions request failed due to ${status}`);
          }
        }
      );
    });

    // 5. Fit bounds to contain user location and all garages
    if (garages.length > 0) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fitBounds(bounds);
        }
      }, 200);
    }
  }, [googleMapsLoaded, userLocation, garages]);

  // Handle selected garage changes (Pan, InfoWindow, Highlights)
  useEffect(() => {
    if (!mapRef.current || !selectedGarageId || !googleMapsLoaded) return;

    // Pan to selected marker
    const selectedMarker = garageMarkersRef.current[selectedGarageId];
    if (selectedMarker) {
      mapRef.current.panTo(selectedMarker.getPosition());

      // Open selected InfoWindow, close others
      Object.keys(infoWindowsRef.current).forEach(garageId => {
        const infoWindow = infoWindowsRef.current[garageId];
        if (garageId === selectedGarageId) {
          infoWindow.open(mapRef.current, selectedMarker);
        } else {
          infoWindow.close();
        }
      });
    }

    // Highlight selected driving route polyline
    Object.keys(polylinesRef.current).forEach(garageId => {
      const polyline = polylinesRef.current[garageId];
      const isSelected = garageId === selectedGarageId;

      if (polyline) {
        if (isSelected) {
          polyline.setOptions({
            strokeColor: '#0000FF',
            strokeWeight: 6,
            strokeOpacity: 0.95,
            zIndex: 100,
          });
        } else {
          polyline.setOptions({
            strokeColor: '#9CA3AF',
            strokeWeight: 3,
            strokeOpacity: 0.45,
            zIndex: 10,
          });
        }
      }
    });

    // Highlight selected marker icon size and color
    Object.keys(garageMarkersRef.current).forEach(garageId => {
      const marker = garageMarkersRef.current[garageId];
      const isSelected = garageId === selectedGarageId;

      if (marker) {
        const markerColor = isSelected ? '#F59E0B' : '#EF4444';
        const markerScale = isSelected ? 1.4 : 1.1;
        marker.setIcon(getMarkerIcon(markerColor, markerScale));
      }
    });

  }, [selectedGarageId, googleMapsLoaded, garages]);

  // Clean up all references on unmount
  useEffect(() => {
    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      Object.values(garageMarkersRef.current).forEach(m => m.setMap(null));
      Object.values(polylinesRef.current).forEach(p => p.setMap(null));
      garageMarkersRef.current = {};
      polylinesRef.current = {};
      infoWindowsRef.current = {};
      mapRef.current = null;
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      {!googleMapsLoaded && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', zIndex: 10 }}>
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            {errorMsg || 'Loading Interactive Google Map...'}
          </span>
        </div>
      )}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
    </div>
  );
};

export default NearestGaragesMap;
