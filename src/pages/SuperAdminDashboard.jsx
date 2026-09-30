import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Users, FileText, Activity, CheckCircle, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
  const { reports, currentUser } = useApp();

  const stats = {
    totalUsers: 1452,
    totalReports: reports.length,
    activeIssues: reports.filter(r => ['reported', 'verified', 'assigned', 'in_progress'].includes(r.status)).length,
    resolutionRate: Math.round((reports.filter(r => r.status === 'resolved').length / reports.length) * 100) || 0
  };

  const mockUsers = [
    { id: 'U1', name: 'Alice Smith', email: 'alice@example.com', role: 'community_admin', region: 'North District', status: 'Active' },
    { id: 'U2', name: 'Bob Jones', email: 'bob@dept.gov', role: 'department_officer', region: 'City Wide', status: 'Active' },
    { id: 'U3', name: 'Charlie Brown', email: 'cbrown@worker.gov', role: 'field_worker', region: 'South District', status: 'Active' },
    { id: 'U4', name: 'Diana Prince', email: 'diana@example.com', role: 'citizen', region: 'East District', status: 'Active' },
  ];

  const mockDepartments = [
    { id: 'D1', name: 'Waste Management', teamCount: 12, openReports: 45, resolutionRate: 88 },
    { id: 'D2', name: 'Roads & Infrastructure', teamCount: 8, openReports: 32, resolutionRate: 75 },
    { id: 'D3', name: 'Parks & Recreation', teamCount: 5, openReports: 14, resolutionRate: 92 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
        <Link 
          to="/analytics"
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
        >
          <BarChart2 className="w-4 h-4 mr-2" /> View Analytics
        </Link>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Total Reports</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalReports}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">Active Issues</div>
            <div className="text-2xl font-bold text-gray-900">{stats.activeIssues}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm text-gray-500 font-medium">System Resolution Rate</div>
            <div className="text-2xl font-bold text-gray-900">{stats.resolutionRate}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Users */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">User Management</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {user.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col - Departments */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Departments Overview</h2>
            </div>
            <div className="p-4 space-y-4">
              {mockDepartments.map(dept => (
                <div key={dept.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="font-bold text-gray-900 mb-2">{dept.name}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <div className="text-gray-500">Teams</div>
                      <div className="font-medium">{dept.teamCount}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Open Reports</div>
                      <div className="font-medium text-red-600">{dept.openReports}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Resolution Rate</span>
                      <span className="font-medium">{dept.resolutionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${dept.resolutionRate}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;
