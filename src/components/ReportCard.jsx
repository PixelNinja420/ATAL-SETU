import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { MapPin, ThumbsUp, ThumbsDown, MessageCircle, Share2, Bookmark, Flag, ShieldCheck } from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from './Badges';
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

const GRADIENTS = {
  illegal_dumping: 'bg-gradient-to-br from-red-400 to-red-600',
  overflowing_bin: 'bg-gradient-to-br from-orange-400 to-orange-600',
  uncollected_waste: 'bg-gradient-to-br from-amber-400 to-amber-600',
  plastic_waste: 'bg-gradient-to-br from-cyan-400 to-cyan-600',
  construction_waste: 'bg-gradient-to-br from-stone-400 to-stone-600',
  street_litter: 'bg-gradient-to-br from-lime-400 to-lime-600',
  blocked_drain: 'bg-gradient-to-br from-blue-400 to-blue-600',
  sewage_overflow: 'bg-gradient-to-br from-violet-400 to-violet-600',
  public_cleanliness: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
  other: 'bg-gradient-to-br from-gray-400 to-gray-600',
};

export default function ReportCard({ report }) {
  const { currentUser, getUserById, upvoteReport, downvoteReport, followReport, flagReport } = useApp();
  const navigate = useNavigate();
  const reporter = getUserById(report.reporterId);
  const [flagOpen, setFlagOpen] = React.useState(false);

  const timeAgo = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const handleAction = (e, action) => {
    e.stopPropagation();
    action();
  };

  const catInfo = CATEGORIES[report.category] || CATEGORIES.other;
  const CatIcon = LucideIcons[catInfo.icon] || LucideIcons.HelpCircle;
  const gradient = GRADIENTS[report.category] || GRADIENTS.other;

  const isFollowing = report.followers?.includes(currentUser?.id);
  const hasUpvoted = report.votes?.up?.includes(currentUser?.id);
  const hasDownvoted = report.votes?.down?.includes(currentUser?.id);

  const isOverdue = report.deadline && new Date(report.deadline) < new Date() && !['resolved', 'closed'].includes(report.status);

  return (
    <div 
      onClick={() => navigate(`/report/${report.id}`)}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
    >
      {/* Top */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
            {reporter?.name?.substring(0, 2).toUpperCase() || 'AN'}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{reporter?.name || 'Anonymous'}</div>
            <div className="text-xs text-gray-500">{timeAgo(report.createdAt)}</div>
          </div>
        </div>
        <CategoryBadge category={report.category} />
      </div>

      {/* Image Placeholder */}
      <div className={`h-48 w-full ${gradient} flex items-center justify-center relative`}>
        <CatIcon className="w-12 h-12 text-white opacity-80" />
        {report.aiAnalysis?.verificationState !== 'likely_valid' && (
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
            <LucideIcons.AlertTriangle className="w-3 h-3" />
            Needs Verification
          </div>
        )}
        {isOverdue && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
            OVERDUE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{report.description}</p>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{report.location.address}</span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <PriorityBadge priority={report.priority} />
          <StatusBadge status={report.status} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-4">
          <button onClick={(e) => handleAction(e, () => upvoteReport(report.id))} className={`flex items-center gap-1 text-xs ${hasUpvoted ? 'text-teal-600' : 'text-gray-500 hover:text-teal-600'}`}>
            <ThumbsUp className="w-4 h-4" /> {report.votes?.up?.length || 0}
          </button>
          <button onClick={(e) => handleAction(e, () => downvoteReport(report.id))} className={`flex items-center gap-1 text-xs ${hasDownvoted ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`}>
            <ThumbsDown className="w-4 h-4" /> {report.votes?.down?.length || 0}
          </button>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MessageCircle className="w-4 h-4" /> {report.comments?.length || 0}
          </div>
        </div>
        <div className="flex items-center gap-3 relative">
          <button onClick={(e) => handleAction(e, () => {})} className="text-gray-500 hover:text-teal-600">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={(e) => handleAction(e, () => followReport(report.id))} className={`${isFollowing ? 'text-teal-600' : 'text-gray-500 hover:text-teal-600'}`}>
            <Bookmark className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setFlagOpen(!flagOpen); }} className="text-gray-500 hover:text-red-600">
            <Flag className="w-4 h-4" />
          </button>
          {flagOpen && (
            <div className="absolute bottom-8 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48 text-sm">
              {['Spam', 'Inappropriate', 'Duplicate'].map(reason => (
                <div key={reason} onClick={(e) => { e.stopPropagation(); flagReport(report.id, reason); setFlagOpen(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700">
                  {reason}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
