import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.75rem', // tailwind rounded-xl
};

const center = {
  lat: 13.727, // Bangkok
  lng: 100.493,
};

export default function MapView() {
  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        <Marker position={{ lat: 13.651, lng: 100.494 }} />
        <Marker position={{ lat: 13.736, lng: 100.523 }} />
      </GoogleMap>
    </LoadScript>
  );
}
