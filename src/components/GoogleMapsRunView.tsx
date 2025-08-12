import React, { useEffect, useRef } from 'react';
import { GoogleMap } from '@capacitor/google-maps';
import type { GPSPoint } from '@/hooks/useBackgroundGPSTracker';

type GoogleMapsRunViewProps = {
  points: GPSPoint[];
  currentLocation: GPSPoint | null;
  isTracking: boolean;
};

const WEB_API_KEY = 'AIzaSyC84gYKVr3KaSXKoujFTMEEx7fk0iHuEzQ';

const GoogleMapsRunView: React.FC<GoogleMapsRunViewProps> = ({ points, currentLocation, isTracking }) => {
  const mapDivRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const polylineIdRef = useRef<string>('running_route');
  const startMarkerIdRef = useRef<string>('start_marker');

  useEffect(() => {
    const initMap = async () => {
      const el = mapDivRef.current;
      if (!el || mapRef.current) return;

      // Esperar a que el elemento tenga tamaño real para evitar crashes nativos
      const waitForLayout = async () => {
        return new Promise<void>((resolve) => {
          const check = () => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 10 && rect.height > 10) resolve();
            else requestAnimationFrame(check);
          };
          requestAnimationFrame(check);
        });
      };

      await waitForLayout();

      const center = currentLocation
        ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
        : { lat: 40.4168, lng: -3.7038 }; // Madrid por defecto

      try {
        const map = await GoogleMap.create({
          id: 'run-map',
          element: el,
          apiKey: WEB_API_KEY,
          config: {
            center,
            zoom: 16
          }
        });
        mapRef.current = map;
      } catch (e) {
        // Evita que un fallo nativo tumbe la pantalla
        console.error('Error creando GoogleMap:', e);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        // Liberar recursos nativos al desmontar
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [currentLocation]);

  useEffect(() => {
    const updateMap = async () => {
      const map = mapRef.current;
      if (!map) return;

      if (points.length > 0) {
        const path = points.map((p) => ({ lat: p.latitude, lng: p.longitude }));

        try {
          await map.removePolylines({ ids: [polylineIdRef.current] });
        } catch {}

        await map.addPolyline({
          id: polylineIdRef.current,
          path,
          width: 6,
          color: '#7C3AED'
        });

        try {
          await map.removeMarkers({ ids: [startMarkerIdRef.current] });
        } catch {}

        await map.addMarker({
          id: startMarkerIdRef.current,
          coordinate: path[0],
          title: 'Inicio'
        });

        const last = path[path.length - 1];
        try {
          await map.setCamera({
            coordinate: last,
            zoom: 17,
            animate: true
          });
        } catch {}
      } else if (currentLocation) {
        try {
          await map.setCamera({
            coordinate: { lat: currentLocation.latitude, lng: currentLocation.longitude },
            zoom: 16,
            animate: true
          });
        } catch {}
      }
    };

    updateMap();
  }, [points, currentLocation, isTracking]);

  return (
    <div className="w-full rounded-xl border border-gray-200" style={{ overflow: 'hidden' }}>
      <div
        ref={mapDivRef}
        style={{ width: '100%', height: 260, position: 'relative' }}
      />
    </div>
  );
};

export default GoogleMapsRunView;


