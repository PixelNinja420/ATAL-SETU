import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';
import MapView from '../components/MapView';
import { CATEGORIES, STATUSES, PRIORITIES } from '../data/mockData';
import { formatDate, truncateText } from '../utils/helpers';
import { Briefcase, Clock, CheckCircle, AlertOctagon, Users, Search, TrendingUp, AlertTriangle } from 'lucide-react';

const DepartmentDashboard = () => {
  const { reports } = useApp();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState({
    ward: '',
    category: '',
    priority: '',
    status: '',
    search: ''
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredReports = reports.filter(r => {
    if (filters.ward && r.ward !== filters.ward) return false; 
    if (filters.category && r.category !== filters.category) return false;
    if (filters.priority && r.priority !== filters.priority) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.search && !r.title.toLowerCase().includes(filters.search.toLowerCase()) && !r.id.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    open: reports.filter(r => ['reported', 'verified', 'assigned', 'in_progress'].includes(r.status)).length,
    verified: reports.filter(r => r.status === 'verified').length,
    assigned: reports.filter(r => r.status === 'assigned').length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    overdue: reports.filter(r => r.deadline && new Date(r.deadline) < new Date() && r.status !== 'resolved' && r.status !== 'closed').length
  };

  const overdueReports = reports.filter(r => r.deadline && new Date(r.deadline) < new Date() && r.status !== 'resolved' && r.status !== 'closed');
  const recurringIssuesCount = reports.filter(r => r.aiAnalysis?.isRecurring).length;

  const statCards = [
    { title: 'Open Reports', value: stats.open, icon: <Briefcase className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-50' },
    { title: 'Verified (Unassigned)', value: stats.verified, icon: <AlertOctagon className="w-6 h-6 text-yellow-500" />, bg: 'bg-yellow-50' },
    { title: 'Assigned', value: stats.assigned, icon: <Users className="w-6 h-6 text-indigo-500" />, bg: 'bg-indigo-50' },
    { title: 'In Progress', value: stats.inProgress, icon: <Clock className="w-6 h-6 text-purple-500" />, bg: 'bg-purple-50' },
    { title: 'Resolved', value: stats.resolved, icon: <CheckCircle className="w-6 h-6 text-green-500" />, bg: 'bg-green-50' },
    { title: 'AI Predicted Hotspots', value: 3, icon: <TrendingUp className="w-6 h-6 text-teal-600" />, bg: 'bg-teal-50', textClass: 'text-teal-700' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Operations Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center text-center">
            <div className={`p-3 rounded-full mb-2 ${stat.bg}`}>
              {stat.icon}
            </div>
            <div className="text-xs text-gray-500 font-medium">{stat.title}</div>
            <div className={`text-2xl font-bold ${stat.textClass || 'text-gray-900'}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Table and Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                name="search"
                placeholder="Search ID or issue..." 
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select name="category" value={filters.category} onChange={handleFilterChange} className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Categories</option>
              {Object.entries(CATEGORIES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
            <select name="priority" value={filters.priority} onChange={handleFilterChange} className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Priorities</option>
              {Object.entries(PRIORITIES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500">
              <option value="">All Statuses</option>
              {Object.entries(STATUSES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status / Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr 
                      key={report.id} 
                      onClick={() => navigate(`/department/report/${report.id}`)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors even:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{truncateText(report.title, 35)}</div>
                        <div className="text-xs text-gray-500">{report.id} • {truncateText(report.location?.address || 'Unknown location', 25)}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <CategoryBadge category={report.category} />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1 items-start">
                          <StatusBadge status={report.status} />
                          <PriorityBadge priority={report.priority} />
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {report.assignedTo ? (
                          <div>
                            <div className="font-medium text-gray-900">{report.assignedTo.teamName || 'Assigned Team'}</div>
                            {report.deadline && <div className="text-xs">Due: {formatDate(report.deadline)}</div>}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-sm text-gray-500">
                        No reports match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Quick AI Insights Panel */}
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg shadow-sm border border-teal-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h3 className="text-sm font-bold text-teal-900">Quick AI Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Top Predicted Hotspots</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div>T-Junction, Ward 1</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500"></div>Market Area, Ward 2</li>
                  <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>Temple Road, Ward 3</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white p-2 rounded border border-teal-100">
                  <span className="text-xs font-medium text-gray-600">Recurring Issues</span>
                  <span className="text-xs font-bold text-teal-700">{recurringIssuesCount} detected</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2 rounded border border-teal-100">
                  <span className="text-xs font-medium text-gray-600">Short-term Forecast</span>
                  <span className="text-xs font-bold text-teal-700">~15 reports in next 7 days</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Map & Alerts */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Active Reports Map</h3>
            <div className="h-64 rounded-md overflow-hidden bg-gray-100">
              <MapView reports={filteredReports.filter(r => r.location?.lat)} height="100%" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-red-200">
            <div className="bg-red-50 px-4 py-3 border-b border-red-100 rounded-t-lg flex items-center">
              <AlertOctagon className="w-5 h-5 text-red-600 mr-2" />
              <h3 className="text-sm font-bold text-red-800">Overdue Alerts</h3>
            </div>
            <div className="p-0">
              {overdueReports.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {overdueReports.map(report => (
                     <li key={report.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/department/report/${report.id}`)}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-gray-900">{report.id}</span>
                          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">OVERDUE</span>
                        </div>
                        <div className="text-xs text-gray-600 truncate mb-1">{report.title}</div>
                        <div className="text-xs text-gray-500">Due: {formatDate(report.deadline)}</div>
                     </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-sm text-gray-500 text-center">No overdue reports.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DepartmentDashboard;
