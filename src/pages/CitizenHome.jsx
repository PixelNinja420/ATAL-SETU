import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ReportCard from '../components/ReportCard';
import { Plus, Search, Filter } from 'lucide-react';

export default function CitizenHome() {
  const { getReportsByRegion, selectedRegion } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const reports = getReportsByRegion(selectedRegion) || [];
  
  const activeReports = reports.filter(r => !['resolved', 'closed'].includes(r.status));
  const resolvedThisMonth = reports.filter(r => 
    ['resolved', 'closed'].includes(r.status) && 
    new Date(r.updatedAt).getMonth() === new Date().getMonth()
  );
  const highPriority = activeReports.filter(r => ['high', 'critical'].includes(r.priority));

  const filteredReports = useMemo(() => {
    let result = [...reports];
    if (filter === 'Active') result = activeReports;
    if (filter === 'Resolved') result = reports.filter(r => ['resolved', 'closed'].includes(r.status));
    if (filter === 'High Priority') result = highPriority;
    
    if (search) {
      result = result.filter(r => 
        r.title.toLowerCase().includes(search.toLowerCase()) || 
        r.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [reports, filter, search]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Civic Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of waste management in your area</p>
        </div>
        <button 
          onClick={() => navigate('/report/new')}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium shadow-md flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Report an Issue
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Reports', value: activeReports.length, color: 'text-blue-600' },
          { label: 'Resolved (This Month)', value: resolvedThisMonth.length, color: 'text-green-600' },
          { label: 'High Priority', value: highPriority.length, color: 'text-orange-600' },
          { label: 'Near You', value: reports.length, color: 'text-teal-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Feed Area */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">Community Reports</h2>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'Active', 'Resolved', 'High Priority'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Report List */}
        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="text-gray-400 mb-2">No reports found matching your criteria.</div>
            <button onClick={() => {setFilter('All'); setSearch('');}} className="text-teal-600 hover:underline">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
