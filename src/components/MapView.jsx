import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { StatusBadge, PriorityBadge } from './Badges';

export default function MapView({ reports = [], center = [15.2637, 74.1077], zoom = 14, onMarkerClick, height = '400px', className = '' }) {
  const getMarkerColor = (report) => {
    if (['resolved', 'closed'].includes(report.status)) return '#22c55e'; // green
    const colors = {
      critical: '#dc2626', // red
      high: '#f97316', // orange
      medium: '#eab308', // yellow
      low: '#22c55e', // green
    };
    return colors[report.priority] || '#3b82f6';
  };

  return (
    <div style={{ height }} className={`w-full rounded-lg overflow-hidden border border-gray-200 z-0 ${className}`}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reports.map((report) => (
          <CircleMarker
            key={report.id}
            center={[report.location.lat, report.location.lng]}
            radius={8}
            pathOptions={{ 
              color: getMarkerColor(report),
              fillColor: getMarkerColor(report),
              fillOpacity: 0.7,
            }}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(report),
            }}
          >
            <Popup>
              <div className="font-sans">
                <h4 className="font-semibold text-sm mb-1">{report.title}</h4>
                <div className="flex gap-1 flex-wrap mt-2">
                  <StatusBadge status={report.status} />
                  <PriorityBadge priority={report.priority} />
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
