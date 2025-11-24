import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import type { Coordinates } from '@/features/waste-management/types';
import type { LeafletMouseEvent } from 'leaflet';

type RecenterMapProps = Coordinates;

export function RecenterMap({ lat, lng }: RecenterMapProps) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);

  return null;
}

interface MapClickHandlerProps {
  onSelect: (coords: Coordinates) => void;
}

export function MapClickHandler({ onSelect }: MapClickHandlerProps) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      const { lat, lng } = event.latlng;
      onSelect({ lat, lng });
    },
  });

  return null;
}
