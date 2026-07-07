import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default leaflet marker icon issue in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ onLocationSelected, initialPosition }) {
  const [position, setPosition] = useState(initialPosition || null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if (onLocationSelected) {
        onLocationSelected(e.latlng);
      }
    },
    locationfound(e) {
      if (!initialPosition) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
        if (onLocationSelected) {
          onLocationSelected(e.latlng);
        }
      }
    },
  });

  useEffect(() => {
    if (!initialPosition) {
      map.locate();
    }
  }, [map, initialPosition]);

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected Location</Popup>
    </Marker>
  );
}

export default function MapComponent({ onLocationSelected, readOnly = false, markers = [], center = [51.505, -0.09], zoom = 13 }) {
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-300">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!readOnly && (
          <LocationMarker onLocationSelected={onLocationSelected} />
        )}
        
        {/* Render multiple markers for Dashboards */}
        {readOnly && markers.map((marker, idx) => (
          <Marker key={idx} position={[marker.lat, marker.lng]}>
            <Popup>{marker.popupText}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
