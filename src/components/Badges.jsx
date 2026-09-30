import React from 'react';
import { StatusBadge, PriorityBadge, CategoryBadge } from './Badges';

const STATUSES = {
  reported: { label: 'Reported', color: 'blue' },
  under_verification: { label: 'Under Verification', color: 'yellow' },
  verified: { label: 'Verified', color: 'indigo' },
  assigned: { label: 'Assigned', color: 'purple' },
  in_progress: { label: 'In Progress', color: 'orange' },
  resolved: { label: 'Resolved', color: 'green' },
  community_verification: { label: 'Awaiting Community Verification', color: 'teal' },
  closed: { label: 'Closed', color: 'gray' },
  reopened: { label: 'Reopened', color: 'red' },
};

const PRIORITIES = {
  low: { label: 'Low', color: 'green', bgClass: 'bg-green-100 text-green-800' },
  medium: { label: 'Medium', color: 'yellow', bgClass: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'High', color: 'orange', bgClass: 'bg-orange-100 text-orange-800' },
  critical: { label: 'Critical', color: 'red', bgClass: 'bg-red-100 text-red-800' },
};

import * as LucideIcons from 'lucide-react';

const CATEGORIES = {
  illegal_dumping: { label: 'Illegal Dumping', icon: 'Trash2' },
  overflowing_bin: { label: 'Overflowing Garbage Bin', icon: 'Archive' },
  uncollected_waste: { label: 'Uncollected Waste', icon: 'Package' },
  plastic_waste: { label: 'Plastic Waste', icon: 'Wine' },
  construction_waste: { label: 'Construction Waste', icon: 'HardHat' },
  street_litter: { label: 'Street Litter', icon: 'Wind' },
  blocked_drain: { label: 'Blocked Drain', icon: 'Droplets' },
  sewage_overflow: { label: 'Sewage Overflow', icon: 'AlertTriangle' },
  public_cleanliness: { label: 'Public Cleanliness', icon: 'Sparkles' },
  other: { label: 'Other', icon: 'HelpCircle' },
};

export function StatusBadge({ status }) {
  const info = STATUSES[status] || STATUSES.reported;
  const colorMap = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    orange: 'bg-orange-100 text-orange-800',
    green: 'bg-green-100 text-green-800',
    teal: 'bg-teal-100 text-teal-800',
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[info.color] || colorMap.gray}`}>
      {info.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const info = PRIORITIES[priority] || PRIORITIES.low;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${info.bgClass}`}>
      {info.label}
    </span>
  );
}

export function CategoryBadge({ category }) {
  const info = CATEGORIES[category] || CATEGORIES.other;
  const Icon = LucideIcons[info.icon] || LucideIcons.HelpCircle;
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
      <Icon className="w-3 h-3" />
      {info.label}
    </span>
  );
}
