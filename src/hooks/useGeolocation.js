import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useGeolocation Hook
 * Provides high-accuracy real-time GPS coordinates, reverse-geocoded locality,
 * and zero-credential fallback for civic telemetry.
 */
export const useGeolocation = (defaultCoords = [12.9716, 77.6412]) => {
  const [location, setLocation] = useState({
    coordinates: defaultCoords, // [latitude, longitude]
    latitude: defaultCoords[0],
    longitude: defaultCoords[1],
    accuracy: null,
    locality: 'Namma Bengaluru (Zone 7B)',
    isLive: false,
    loading: true,
    error: null
  });

  const watchIdRef = useRef(null);

  const reverseGeocode = async (lat, lon) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { 
          signal: controller.signal,
          headers: { 'Accept-Language': 'en' }
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || '';
        const neighborhood = addr.neighbourhood || addr.suburb || addr.city_district || '';
        const city = addr.city || addr.town || addr.county || 'Bengaluru';
        
        const parts = [road, neighborhood, city].filter(Boolean);
        const name = parts.length > 0 ? parts.join(', ') : (data.display_name?.split(',').slice(0, 3).join(',') || 'Local District');
        return name;
      }
    } catch {
      // Graceful fallback on network timeout
    }
    return `Coord: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`;
  };

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by your browser.',
        isLive: false
      }));
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const locality = await reverseGeocode(latitude, longitude);

        setLocation({
          coordinates: [latitude, longitude],
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
          locality,
          isLive: true,
          loading: false,
          error: null
        });
      },
      (err) => {
        console.warn('Geolocation notice:', err.message);
        setLocation(prev => ({
          ...prev,
          loading: false,
          isLive: false,
          error: err.code === 1 ? 'Location permission denied' : 'GPS signal unavailable'
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 15000
      }
    );
  }, []);

  useEffect(() => {
    detectLocation();

    // Set up continuous watch if mobile device supports it
    if (navigator.geolocation && navigator.geolocation.watchPosition) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setLocation(prev => ({
            ...prev,
            coordinates: [latitude, longitude],
            latitude,
            longitude,
            accuracy: Math.round(accuracy),
            isLive: true
          }));
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [detectLocation]);

  return {
    ...location,
    detectLocation
  };
};
