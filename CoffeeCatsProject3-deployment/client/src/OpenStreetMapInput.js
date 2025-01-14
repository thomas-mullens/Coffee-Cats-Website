import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const OpenStreetMapInput = ({ value, onChange }) => {
  const [position, setPosition] = useState([0, 0]);
  const LocationMarker = () => {
    const map = useMapEvents({
      click: (e) => {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onChange(`${e.latlng.lat}, ${e.latlng.lng}`);
      },
    });
    useEffect(() => {
      if (value) {
        const [lat, lng] = value.split(',').map(parseFloat);
        setPosition([lat, lng]);
        map.flyTo([lat, lng], 13);
      }
    }, [value, map]);
    return position[0] === 0 && position[1] === 0 ? null : (
      <Marker position={position} icon={
        L.icon({
          iconUrl: 'https://unpkg.com/leaflet@1.8.0/dist/images/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      } />
    );
  };
  return (
    <MapContainer
      center={[0, 0]}
      zoom={2}
      scrollWheelZoom={false}
      className="h-52 rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
};

export default OpenStreetMapInput;