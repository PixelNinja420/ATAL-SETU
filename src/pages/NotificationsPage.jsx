import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Bell, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useApp();
  const navigate = useNavigate();

  const handleNotificationClick = (n) => {
    if (!n.read) markNotificationRead(n.id);
    if (n.reportId) {
      navigate(`/report/${n.reportId}`);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'status_update': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'reminder': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const timeAgo = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const sortedNotifications = [...(notifications || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6" /> Notifications
        </h1>
        {sortedNotifications.some(n => !n.read) && (
          <button 
            onClick={markAllNotificationsRead}
            className="text-sm font-medium text-teal-600 hover:text-teal-700"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {sortedNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {sortedNotifications.map(n => (
              <div 
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-teal-50/30' : ''}`}
              >
                <div className="mt-1 flex-shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-teal-600 self-center"></div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
            <Bell className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">All caught up!</p>
            <p className="text-sm">You have no new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
