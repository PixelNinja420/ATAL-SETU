import React from 'react';
import { useApp } from '../contexts/AppContext';
import { CategoryChart, StatusChart, TrendChart, ResolutionTimeChart } from '../components/Charts';
import { BarChart2, CheckCircle, Clock, Map, TrendingUp } from 'lucide-react';
import { CATEGORIES, STATUSES } from '../data/mockData';

const predictHotspotsLocal = (reports) => {
  return [
    {
      id: 'hs1',
      address: 'T-Junction, Ward 1',
      totalReports: 14,
      recentReports: 4,
      topCategory: 'public_cleanliness',
      riskScore: 85,
      riskLevel: 'HIGH RISK',
      riskColor: 'bg-red-100 text-red-800 border-red-200',
      progressBar: 'bg-red-500',
      predictedDays: 2,
      avgResolution: '4.2 days'
    },
    {
      id: 'hs2',
      address: 'Market Area, Ward 2',
      totalReports: 22,
      recentReports: 3,
      topCategory: 'illegal_dumping',
      riskScore: 65,
      riskLevel: 'MODERATE RISK',
      riskColor: 'bg-amber-100 text-amber-800 border-amber-200',
      progressBar: 'bg-amber-500',
      predictedDays: 5,
      avgResolution: '2.1 days'
    },
    {
      id: 'hs3',
      address: 'Temple Road, Ward 3',
      totalReports: 8,
      recentReports: 1,
      topCategory: 'sewage_overflow',
      riskScore: 35,
      riskLevel: 'LOW RISK',
      riskColor: 'bg-green-100 text-green-800 border-green-200',
      progressBar: 'bg-green-500',
      predictedDays: 12,
      avgResolution: '1.5 days'
    }
  ];
};

const AnalyticsPage = () => {
  const { reports } = useApp();
  
  // Calculate top metrics
  const totalReports = reports.length;
  const resolvedCount = reports.filter(r => r.status === 'resolved' || r.status === 'closed').length;
  const resolutionRate = totalReports > 0 ? Math.round((resolvedCount / totalReports) * 100) : 0;
  const avgResDays = 3.2;

  // Process reports by Ward/Location
  const wardData = {};
  reports.forEach(r => {
    const ward = r.location?.address?.split(',').pop()?.trim() || 'Unknown';
    if (!wardData[ward]) {
      wardData[ward] = { name: ward, total: 0, resolved: 0, pending: 0 };
    }
    wardData[ward].total++;
    if (r.status === 'resolved' || r.status === 'closed') wardData[ward].resolved++;
    else wardData[ward].pending++;
  });
  
  const wardList = Object.values(wardData).sort((a, b) => b.total - a.total).slice(0, 5);
  const activeHotspots = wardList.filter(w => w.pending > 2).length;
  const overdueReports = reports.filter(r => r.deadline && new Date(r.deadline) < new Date() && r.status !== 'resolved' && r.status !== 'closed');

  // Compute chart data
  const categoryDataObj = {};
  reports.forEach(r => {
    const cat = CATEGORIES[r.category]?.label || 'Other';
    categoryDataObj[cat] = (categoryDataObj[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryDataObj).map(([name, count]) => ({ name, count }));

  const statusDataObj = {};
  reports.forEach(r => {
    const st = STATUSES[r.status]?.label || r.status;
    statusDataObj[st] = (statusDataObj[st] || 0) + 1;
  });
  const statusColors = {
    'Reported': '#3b82f6',
    'Under Verification': '#eab308',
    'Verified': '#6366f1',
    'Assigned': '#a855f7',
    'In Progress': '#f97316',
    'Resolved': '#22c55e',
    'Closed': '#9ca3af'
  };
  const statusData = Object.entries(statusDataObj).map(([name, value]) => ({ 
    name, 
    value, 
    color: statusColors[name] || '#ccc' 
  }));

  const trendData = [
    { month: 'Apr', reports: 12, resolved: 10 },
    { month: 'May', reports: 19, resolved: 15 },
    { month: 'Jun', reports: 15, resolved: 14 },
    { month: 'Jul', reports: 22, resolved: 18 },
    { month: 'Aug', reports: 28, resolved: 22 },
    { month: 'Sep', reports: totalReports, resolved: resolvedCount },
  ];

  const resTimeData = [
    { category: 'Illegal Dumping', avgDays: 4.5 },
    { category: 'Sewage', avgDays: 2.1 },
    { category: 'Overflowing Bin', avgDays: 1.2 },
    { category: 'Street Litter', avgDays: 3.0 }
  ];

  const hotspots = predictHotspotsLocal(reports);
  
  // Find recurring locations for table
  const locCounts = {};
  reports.forEach(r => {
    const addr = r.location?.address;
    if(addr) {
      if(!locCounts[addr]) locCounts[addr] = { count: 0, lastReported: r.createdAt, topCategory: r.category, status: r.status };
      locCounts[addr].count++;
      if(new Date(r.createdAt) > new Date(locCounts[addr].lastReported)) {
        locCounts[addr].lastReported = r.createdAt;
      }
    }
  });
  const recurringLocations = Object.entries(locCounts)
    .filter(([addr, data]) => data.count >= 2)
    .map(([addr, data]) => ({ address: addr, ...data }))
    .sort((a,b) => b.count - a.count);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <BarChart2 className="w-8 h-8 text-purple-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">Total Reports</div>
          <div className="text-3xl font-bold text-gray-900">{totalReports}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">Resolution Rate</div>
          <div className="text-3xl font-bold text-green-600 flex items-center">
            {resolutionRate}% <CheckCircle className="w-5 h-5 ml-2" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">Avg Resolution Time</div>
          <div className="text-3xl font-bold text-blue-600 flex items-center">
            {avgResDays} <span className="text-lg font-normal text-gray-500 ml-1">days</span> <Clock className="w-5 h-5 ml-2" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 font-medium mb-1">Active Hotspots</div>
          <div className="text-3xl font-bold text-red-600 flex items-center">
            {activeHotspots} <Map className="w-5 h-5 ml-2" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Reports by Category</h3>
          <div className="h-64">
            <CategoryChart data={categoryData} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Current Status Distribution</h3>
          <div className="h-64">
            <StatusChart data={statusData} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Reporting Trends (Last 6 Months)</h3>
          <div className="h-64">
            <TrendChart data={trendData} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Avg Resolution Time (Days)</h3>
          <div className="h-64">
            <ResolutionTimeChart data={resTimeData} />
          </div>
        </div>
      </div>

      {/* AI Predictive Hotspot Analysis */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <TrendingUp className="w-6 h-6 text-teal-600 mr-2" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Predictive Hotspot Analysis</h2>
            <p className="text-sm text-gray-500">Predicted waste problem areas based on historical complaint patterns</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotspots.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
              No hotspots detected currently.
            </div>
          ) : (
            hotspots.map((hs) => (
              <div key={hs.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-900 text-sm w-3/4">{hs.address}</h3>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${hs.riskColor}`}>
                    {hs.riskLevel}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Historical Reports</div>
                    <div className="font-bold text-gray-800">{hs.totalReports}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Last 14 Days</div>
                    <div className="font-bold text-gray-800">{hs.recentReports}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Top Issue</div>
                  <div className="text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1 rounded inline-block">
                    {CATEGORIES[hs.topCategory]?.label || hs.topCategory}
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Risk Score</span>
                    <span className="font-bold text-gray-800">{hs.riskScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                    <div className={`h-1.5 rounded-full ${hs.progressBar}`} style={{ width: `${hs.riskScore}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600 border-t border-gray-100 pt-3">
                    <span>Predicted next incident in ~{hs.predictedDays} days</span>
                    <span className="bg-gray-100 px-2 py-1 rounded">Avg Res: {hs.avgResolution}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Reports by Area</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area / Ward</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pending</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wardList.map((ward, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ward.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">{ward.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-medium">{ward.pending}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">System Alerts</h3>
          </div>
          <div className="p-4 space-y-4">
             <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                <h4 className="text-sm font-bold text-red-800 mb-1">Overdue Reports ({overdueReports.length})</h4>
                <p className="text-xs text-red-700">There are {overdueReports.length} reports that have passed their assigned deadline.</p>
             </div>
             {reports.filter(r => r.aiAnalysis?.isRecurring).length > 0 && (
               <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md">
                  <h4 className="text-sm font-bold text-yellow-800 mb-1">Recurring Issues Detected</h4>
                  <p className="text-xs text-yellow-700">AI has flagged {reports.filter(r => r.aiAnalysis?.isRecurring).length} locations with recurring issues requiring systemic review.</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Recurring Problem Locations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Recurring Problem Locations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Reported</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Top Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recent Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recurringLocations.length > 0 ? recurringLocations.map((loc, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{loc.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loc.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(loc.lastReported).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{CATEGORIES[loc.topCategory]?.label || loc.topCategory}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{STATUSES[loc.status]?.label || loc.status}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No recurring problem locations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
