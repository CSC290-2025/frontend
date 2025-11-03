import { useEffect, useRef } from 'react';
import initMapAndMarkers from '../config/google-map';

const MapPage = () => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const mapOptions: google.maps.MapOptions = {
      center: { lat: 13.7563, lng: 100.5018 }, // กรุงเทพฯ
      zoom: 12,
      mapId: 'map1',
    };

    const markerOptions: google.maps.marker.AdvancedMarkerElementOptions[] = [
      { position: { lat: 13.7563, lng: 100.5018 }, title: 'กรุงเทพฯ' },
      { position: { lat: 13.8003, lng: 100.5593 }, title: 'รัชโยธิน' },
    ];

    initMapAndMarkers({
      mapEl: mapRef.current,
      mapOptions: mapOptions,
      markerOptions: markerOptions,
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-neutral-100">
      <div className="relative w-full">
        <div
          ref={mapRef}
          id="google_map"
          className="w m-3"
          style={{ height: 'calc(100vh - 160px)' }}
        />
      </div>
    </div>
  );
};

export default MapPage;
