import React from 'react';
import * as LucideIcons from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function Timeline({ events }) {
  const { getUserById } = useApp();

  const getStatusInfo = (status) => {
    const map = {
      reported: { color: 'text-blue-600', bg: 'bg-blue-600' },
      under_verification: { color: 'text-yellow-600', bg: 'bg-yellow-600' },
      verified: { color: 'text-indigo-600', bg: 'bg-indigo-600' },
      assigned: { color: 'text-purple-600', bg: 'bg-purple-600' },
      in_progress: { color: 'text-orange-600', bg: 'bg-orange-600' },
      resolved: { color: 'text-green-600', bg: 'bg-green-600' },
      community_verification: { color: 'text-teal-600', bg: 'bg-teal-600' },
      closed: { color: 'text-gray-600', bg: 'bg-gray-600' },
      reopened: { color: 'text-red-600', bg: 'bg-red-600' },
    };
    return map[status] || map.reported;
  };

  const sortedEvents = [...(events || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="pl-4">
      <div className="border-l-2 border-gray-200 ml-2 space-y-6">
        {sortedEvents.map((evt, idx) => {
          const info = getStatusInfo(evt.status);
          const user = getUserById(evt.userId);
          return (
            <div key={idx} className="relative pl-6">
              <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${info.bg} ring-4 ring-white`} />
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${info.color} capitalize`}>{evt.status.replace('_', ' ')}</span>
                <span className="text-xs text-gray-500">
                  {new Date(evt.timestamp).toLocaleString()} • {user?.name || 'System'}
                </span>
                {evt.note && <p className="text-sm text-gray-700 mt-1 italic">"{evt.note}"</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
