import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Leaf } from 'lucide-react';

export default function LoginPage() {
  const { login, users } = useApp();
  const navigate = useNavigate();

  const handleLogin = (userId) => {
    login(userId);
    const user = users.find(u => u.id === userId);
    switch (user?.role) {
      case 'citizen': navigate('/home'); break;
      case 'community_admin': navigate('/admin'); break;
      case 'department_officer': navigate('/department'); break;
      case 'field_worker': navigate('/fieldworker'); break;
      case 'super_admin': navigate('/superadmin'); break;
      default: navigate('/home');
    }
  };

  const demoUsers = [
    { id: 'user-1', name: 'Rahul Naik', role: 'citizen', region: 'curchorem-ward3' },
    { id: 'user-5', name: 'Sneha Desai', role: 'community_admin', region: 'curchorem' },
    { id: 'user-6', name: 'Vikram Patil', role: 'department_officer', region: 'curchorem' },
    { id: 'user-7', name: 'Ramesh Gaonkar', role: 'field_worker', region: 'curchorem' },
    { id: 'user-8', name: 'Suresh Borkar', role: 'super_admin', region: 'goa' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Branding */}
      <div className="md:w-1/2 bg-gradient-to-br from-teal-500 to-teal-700 text-white flex flex-col justify-center p-12">
        <div className="max-w-md mx-auto">
          <Leaf className="w-16 h-16 mb-6" />
          <h1 className="text-4xl font-bold mb-4">CleanConnect</h1>
          <p className="text-xl mb-4 opacity-90">Civic Waste Intelligence Platform</p>
          <p className="opacity-80">
            A unified platform for citizens, communities, and municipal workers to seamlessly report, verify, and resolve waste management issues.
          </p>
        </div>
      </div>

      {/* Login Area */}
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome Back</h2>
            <p className="text-gray-500 text-center mb-8">Select a demo account to continue</p>
          </div>
          
          <div className="space-y-4">
            {demoUsers.map((user) => (
              <div 
                key={user.id}
                onClick={() => handleLogin(user.id)}
                className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-4 cursor-pointer hover:border-teal-500 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">
                      Region: {user.region}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
