import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import MapView from '../components/MapView';
import ReportCard from '../components/ReportCard';

export default function MapPage() {
  const { getReportsByRegion, selectedRegion } = useApp();
  const [selectedReport, setSelectedReport] = useState(null);
  
  const allReports = getReportsByRegion(selectedRegion) || [];
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
  });

  const handleFilterChange = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const filteredReports = allReports.filter(r => {
    if (filters.status.length > 0 && !filters.status.includes(r.status)) return false;
    if (filters.priority.length > 0 && !filters.priority.includes(r.priority)) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-64px)] relative flex">
      {/* Map Area */}
      <div className="flex-1 relative">
        <MapView 
          reports={filteredReports} 
          onMarkerClick={(r) => setSelectedReport(r)}
          height="100%"
          className="rounded-none border-0"
        />

        {/* Filter Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 w-64 max-h-[80vh] overflow-y-auto">
          <h3 className="font-bold text-gray-900 mb-3">Filters</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Priority</h4>
              {['critical', 'high', 'medium', 'low'].map(p => (
                <label key={p} className="flex items-center gap-2 mb-1 cursor-pointer">
                  <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" checked={filters.priority.includes(p)} onChange={() => handleFilterChange('priority', p)} />
                  <span className="text-sm capitalize">{p}</span>
                </label>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</h4>
              {['reported', 'in_progress', 'resolved', 'closed'].map(s => (
                <label key={s} className="flex items-center gap-2 mb-1 cursor-pointer">
                  <input type="checkbox" className="rounded text-teal-600 focus:ring-teal-500" checked={filters.status.includes(s)} onChange={() => handleFilterChange('status', s)} />
                  <span className="text-sm capitalize">{s.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200 text-xs">
          <h4 className="font-semibold text-gray-700 mb-2">Legend</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-600"></div> Critical</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> High</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div> Medium</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Low/Reported</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> Resolved</div>
          </div>
        </div>
      </div>

      {/* Slide-in preview card */}
      <div className={`w-96 bg-gray-50 border-l border-gray-200 transition-all duration-300 transform ${selectedReport ? 'translate-x-0' : 'translate-x-full absolute right-0 top-0 bottom-0'} z-20 flex flex-col`}>
        {selectedReport && (
          <>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <h3 className="font-bold text-gray-900">Report Preview</h3>
              <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-gray-900 font-bold">&times;</button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              <ReportCard report={selectedReport} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
