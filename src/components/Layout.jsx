import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Leaf, Menu, X, Home, Map as MapIcon, Bell, User, LayoutDashboard, Shield, BarChart3, Users, Building2, ClipboardList } from 'lucide-react';

export default function Layout() {
  const { currentUser, selectedRegion, switchRegion, regions, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);

  const getNavItems = () => {
    const role = currentUser?.role;
    switch (role) {
      case 'citizen':
        return [
          { name: 'Home', path: '/home', icon: Home },
          { name: 'My Reports', path: '/home', icon: ClipboardList }, // Placeholder for now
          { name: 'Map', path: '/map', icon: MapIcon },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'community_admin':
        return [
          { name: 'Home', path: '/home', icon: Home },
          { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'AI Verification', path: '/admin/ai-verification', icon: Shield },
          { name: 'Map', path: '/map', icon: MapIcon },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'department_officer':
        return [
          { name: 'Department Dashboard', path: '/department', icon: Building2 },
          { name: 'Map', path: '/map', icon: MapIcon },
          { name: 'Analytics', path: '/analytics', icon: BarChart3 },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'field_worker':
        return [
          { name: 'My Tasks', path: '/fieldworker', icon: ClipboardList },
          { name: 'Map', path: '/map', icon: MapIcon },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      case 'super_admin':
        return [
          { name: 'Dashboard', path: '/superadmin', icon: LayoutDashboard },
          { name: 'Analytics', path: '/analytics', icon: BarChart3 },
          { name: 'Users', path: '/superadmin', icon: Users },
          { name: 'Regions', path: '/superadmin', icon: MapIcon },
          { name: 'Departments', path: '/superadmin', icon: Building2 },
          { name: 'Notifications', path: '/notifications', icon: Bell },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const currentRegion = regions?.find(r => r.id === selectedRegion) || { name: 'Select Region' };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Leaf className="text-teal-600 w-6 h-6" />
          <span className="font-bold text-lg text-teal-600">CleanConnect</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`md:flex flex-col w-64 bg-white border-r border-gray-200 ${mobileMenuOpen ? 'flex absolute z-50 h-full left-0 top-16 bottom-0' : 'hidden'} md:static md:h-auto`}>
        <div className="hidden md:flex items-center gap-2 p-4 border-b border-gray-200">
          <Leaf className="text-teal-600 w-8 h-8" />
          <span className="font-bold text-xl text-teal-600">CleanConnect</span>
        </div>

        {/* Region Selector */}
        <div className="p-4 border-b border-gray-200 relative">
          <div 
            className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-100"
            onClick={() => setRegionDropdownOpen(!regionDropdownOpen)}
          >
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Region</span>
              <span className="font-medium text-sm">{currentRegion.name}</span>
            </div>
            <MapIcon className="w-4 h-4 text-gray-500" />
          </div>
          {regionDropdownOpen && (
            <div className="absolute top-14 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {regions?.map(region => (
                <div
                  key={region.id}
                  className="p-2 hover:bg-teal-50 cursor-pointer text-sm"
                  onClick={() => { switchRegion(region.id); setRegionDropdownOpen(false); }}
                >
                  {region.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'bg-teal-600 text-white' : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
              {currentUser?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 truncate max-w-[100px]">{currentUser?.name}</span>
              <span className="text-xs text-gray-500 capitalize">{currentUser?.role?.replace('_', ' ')}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
