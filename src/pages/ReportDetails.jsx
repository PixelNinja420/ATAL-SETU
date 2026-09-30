import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ArrowLeft, MapPin, ThumbsUp, ThumbsDown, Bookmark, Share2, Flag, Image as ImageIcon } from 'lucide-react';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';
import CommentSection from '../components/CommentSection';
import MapView from '../components/MapView';
import AIBadge from '../components/AIBadge';
import Timeline from '../components/Timeline';
import Modal from '../components/Modal';

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

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, currentUser, getUserById, upvoteReport, downvoteReport, followReport, flagReport, verifyResolution } = useApp();
  
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('Spam');

  const report = reports?.find(r => r.id === id || r.reportId === id);

  if (!report) {
    return <div className="p-8 text-center text-gray-500">Report not found.</div>;
  }

  const reporter = getUserById(report.reporterId);
  const gradient = GRADIENTS[report.category] || GRADIENTS.other;
  const isOverdue = report.deadline && new Date(report.deadline) < new Date() && !['resolved', 'closed'].includes(report.status);

  const hasUpvoted = report.votes?.up?.includes(currentUser?.id);
  const hasDownvoted = report.votes?.down?.includes(currentUser?.id);
  const isFollowing = report.followers?.includes(currentUser?.id);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-teal-600 font-medium">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>

      {isOverdue && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <Flag className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 font-medium">
                This report is OVERDUE for resolution according to SLA.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`w-full h-64 md:h-80 rounded-xl overflow-hidden relative ${gradient} flex items-center justify-center`}>
             {report.images && report.images[0] && !report.images[0].startsWith('/placeholder') ? (
               <img src={report.images[0]} alt="Report" className="w-full h-full object-cover" />
             ) : (
               <ImageIcon className="w-24 h-24 text-white opacity-50" />
             )}
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-gray-700 text-lg whitespace-pre-line">{report.description}</p>
            
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{report.location.address}</span>
            </div>

            <div className="h-48 rounded-lg overflow-hidden border border-gray-200 mt-4">
              <MapView reports={[report]} center={[report.location.lat, report.location.lng]} height="100%" zoom={15} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-96">
            <CommentSection reportId={report.id} />
          </div>
        </div>

        {/* Right Column - Metadata & Actions */}
        <div className="space-y-6">
          
          {/* Status Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-mono">{report.reportId}</span>
              <span className="text-sm text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              <StatusBadge status={report.status} />
              <PriorityBadge priority={report.priority} />
              <CategoryBadge category={report.category} />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                {reporter?.name?.substring(0, 2).toUpperCase() || 'AN'}
              </div>
              <div>
                <div className="text-sm text-gray-500">Reported by</div>
                <div className="font-semibold text-gray-900">{reporter?.name || 'Anonymous'}</div>
              </div>
            </div>
          </div>

          {/* AI Verification */}
          {report.aiAnalysis && (
            <AIBadge 
              verificationState={report.aiAnalysis.verificationState} 
              confidence={report.aiAnalysis.confidence} 
              alerts={report.aiAnalysis.alerts} 
            />
          )}

          {/* Actions Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Community Engagement</h3>
            
            <div className="flex justify-between mb-6">
              <button 
                onClick={() => upvoteReport(report.id)}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border ${hasUpvoted ? 'border-teal-500 bg-teal-50 text-teal-600' : 'border-gray-200 hover:bg-gray-50 text-gray-600'} mr-2`}
              >
                <ThumbsUp className="w-5 h-5 mb-1" />
                <span className="font-semibold">{report.votes?.up?.length || 0}</span>
              </button>
              <button 
                onClick={() => downvoteReport(report.id)}
                className={`flex-1 flex flex-col items-center justify-center p-3 rounded-lg border ${hasDownvoted ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 hover:bg-gray-50 text-gray-600'} ml-2`}
              >
                <ThumbsDown className="w-5 h-5 mb-1" />
                <span className="font-semibold">{report.votes?.down?.length || 0}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => followReport(report.id)} className={`flex flex-col items-center p-2 rounded-lg text-xs font-medium ${isFollowing ? 'text-teal-600 bg-teal-50' : 'text-gray-600 hover:bg-gray-100'}`}>
                <Bookmark className="w-5 h-5 mb-1" /> {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="flex flex-col items-center p-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100">
                <Share2 className="w-5 h-5 mb-1" /> Share
              </button>
              <button onClick={() => setFlagModalOpen(true)} className="flex flex-col items-center p-2 rounded-lg text-xs font-medium text-gray-600 hover:bg-red-50 hover:text-red-600">
                <Flag className="w-5 h-5 mb-1" /> Flag
              </button>
            </div>
            
            {report.flags?.length > 0 && (
              <div className="mt-4 text-xs text-red-600 flex justify-center bg-red-50 py-1 rounded">
                Flagged by {report.flags.length} users
              </div>
            )}
          </div>

          {/* Community Verification */}
          {report.status === 'community_verification' && (
            <div className="bg-teal-50 border border-teal-200 p-6 rounded-xl shadow-sm text-center">
              <h3 className="font-semibold text-teal-900 mb-2">Was this issue resolved?</h3>
              <p className="text-sm text-teal-800 mb-4">The department marked this as resolved. Please confirm.</p>
              <div className="flex gap-2">
                <button onClick={() => verifyResolution(report.id, true)} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium text-sm">
                  Yes, Resolved ({report.communityVerification?.yes?.length || 0})
                </button>
                <button onClick={() => verifyResolution(report.id, false)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium text-sm">
                  No, Still Exists ({report.communityVerification?.no?.length || 0})
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Status History</h3>
            <Timeline events={report.timeline} />
          </div>

        </div>
      </div>

      <Modal isOpen={flagModalOpen} onClose={() => setFlagModalOpen(false)} title="Flag Report">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Please select a reason for flagging this report.</p>
          {['Spam', 'Inappropriate Content', 'Duplicate', 'False Information'].map(reason => (
            <div key={reason} className="flex items-center">
              <input 
                type="radio" 
                id={reason} 
                name="flag_reason" 
                value={reason}
                checked={flagReason === reason}
                onChange={(e) => setFlagReason(e.target.value)}
                className="w-4 h-4 text-teal-600"
              />
              <label htmlFor={reason} className="ml-2 text-sm text-gray-700">{reason}</label>
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-6">
            <button onClick={() => setFlagModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button onClick={() => { flagReport(report.id, flagReason); setFlagModalOpen(false); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Submit Flag</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
