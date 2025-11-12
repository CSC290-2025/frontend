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
    <>
      <div className="w-full">
        <div
          ref={mapRef}
          id="google_map"
          className="overflow-hidden rounded-xl border border-neutral-200 shadow-sm"
          style={{ height: 'calc(95vh - 200px)' }}
        />
      </div>
    </>
  );
};
export default MapPage;
