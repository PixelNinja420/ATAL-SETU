import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, ChevronDown, ChevronRight } from 'lucide-react';

export default function AIBadge({ verificationState, confidence, alerts = [] }) {
  const [expanded, setExpanded] = useState(false);

  let icon, color, label, border;
  switch (verificationState) {
    case 'likely_valid':
      icon = <ShieldCheck className="w-5 h-5 text-green-600" />;
      color = 'bg-green-50 text-green-800';
      border = 'border-green-400';
      label = 'Likely Valid';
      break;
    case 'needs_verification':
      icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
      color = 'bg-amber-50 text-amber-800';
      border = 'border-amber-400';
      label = 'Needs Verification';
      break;
    case 'potentially_incorrect':
      icon = <AlertOctagon className="w-5 h-5 text-red-600" />;
      color = 'bg-red-50 text-red-800';
      border = 'border-red-400';
      label = 'Potentially Incorrect';
      break;
    default:
      return null;
  }

  return (
    <div className={`rounded-lg border border-gray-200 border-l-4 ${border} bg-white shadow-sm overflow-hidden`}>
      <div 
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <div className="text-sm font-semibold">{label}</div>
            <div className="text-xs text-gray-500">AI Confidence: {confidence}%</div>
          </div>
        </div>
        {alerts.length > 0 && (
          <button className="text-gray-500">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {expanded && alerts.length > 0 && (
        <div className={`p-3 border-t border-gray-200 ${color}`}>
          <div className="text-xs font-semibold mb-2">AI Verification Alerts:</div>
          <ul className="space-y-2">
            {alerts.map((alert, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span className="font-medium">•</span>
                <span>{alert.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
