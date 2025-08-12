import React, { useEffect, useRef, useState } from 'react';
import type { GPSPoint } from '@/hooks/useSimpleGPSTracker';

type SimpleMapViewProps = {
  points: GPSPoint[];
  currentLocation: GPSPoint | null;
  isTracking: boolean;
};

const WEB_API_KEY = 'AIzaSyC84gYKVr3KaSXKoujFTMEEx7fk0iHuEzQ';

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const SimpleMapView: React.FC<SimpleMapViewProps> = ({ points, currentLocation, isTracking }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const startMarkerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps JavaScript API
    if (window.google) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${WEB_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;

    window.initMap = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      delete window.initMap;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || googleMapRef.current) return;

    // Esperar a tener ubicación real antes de crear el mapa
    if (!currentLocation) return;

    const center = new window.google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 17,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    googleMapRef.current = map;
  }, [isLoaded, currentLocation]);

  useEffect(() => {
    if (!googleMapRef.current || !isLoaded || !currentLocation) return;

    const map = googleMapRef.current;

    // Clear existing polyline and markers
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    if (startMarkerRef.current) {
      startMarkerRef.current.setMap(null);
    }

    if (points.length > 0) {
      const path = points.map(p => new window.google.maps.LatLng(p.latitude, p.longitude));

      // Create polyline with app theme color
      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#9f7aea', // runapp-purple
        strokeOpacity: 1.0,
        strokeWeight: 6
      });

      polyline.setMap(map);
      polylineRef.current = polyline;

      // Add start marker
      const startMarker = new window.google.maps.Marker({
        position: path[0],
        map,
        title: 'Inicio',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#48bb78', // runapp-success
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
          scale: 8
        }
      });

      startMarkerRef.current = startMarker;

      // Center on last point
      const lastPoint = path[path.length - 1];
      map.setCenter(lastPoint);
      map.setZoom(17);
    } else {
      // Mostrar marcador de ubicación actual (pantalla inicial)
      const currentPosition = new window.google.maps.LatLng(currentLocation.latitude, currentLocation.longitude);
      
      const currentMarker = new window.google.maps.Marker({
        position: currentPosition,
        map,
        title: 'Tu ubicación',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#3B82F6', // azul para ubicación actual
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
          scale: 10
        }
      });

      startMarkerRef.current = currentMarker;

      // Centrar en ubicación actual
      map.setCenter(currentPosition);
      map.setZoom(17);
    }
  }, [points, currentLocation, isTracking, isLoaded]);

  return (
    <div className="w-full h-full bg-gray-100 relative overflow-hidden">
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        className="bg-gray-100"
      />
      {(!isLoaded || !currentLocation) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-runapp-gray">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-runapp-purple mx-auto mb-2"></div>
            <p className="text-sm">
              {!isLoaded ? "Cargando mapa..." : "Obteniendo tu ubicación..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMapView;
