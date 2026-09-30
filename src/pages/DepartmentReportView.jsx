import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../components/Badges';
import AIBadge from '../components/AIBadge';
import Timeline from '../components/Timeline';
import CommentSection from '../components/CommentSection';
import MapView from '../components/MapView';
import Modal from '../components/Modal';
import { formatDate } from '../utils/helpers';
import { PRIORITIES, STATUSES } from '../data/mockData';
import { ArrowLeft, Calendar, User, MapPin, Image as ImageIcon, Zap } from 'lucide-react';

const getRecommendedActionsLocal = (report) => {
  if (report.aiAnalysis?.isRecurring) {
    return [
      { priority: 'primary', text: 'Investigate source of recurring waste', reason: 'Location has multiple similar reports', effort: 'Medium' },
      { priority: 'secondary', text: 'Schedule weekly patrol', reason: 'Preventative measure', effort: 'Low' }
    ];
  }
  return [
    { priority: 'primary', text: 'Dispatch cleanup team', reason: 'Standard resolution for this category', effort: 'Medium' },
    { priority: 'secondary', text: 'Review camera footage', reason: 'Identify violators if cameras are present', effort: 'High' }
  ];
};

const DepartmentReportView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, updateReportStatus, setReportPriority, assignReport, teams } = useApp();
  
  const report = reports.find(r => r.id === id);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [statusDropdown, setStatusDropdown] = useState(report?.status || '');
  const [priorityDropdown, setPriorityDropdown] = useState(report?.priority || '');

  if (!report) {
    return <div className="p-8 text-center text-gray-500">Report not found.</div>;
  }

  const handleVerify = () => updateReportStatus(id, 'verified');
  const handleReject = () => updateReportStatus(id, 'closed', 'Rejected by department');
  const handleReopen = () => updateReportStatus(id, 'reopened');
  
  const handlePriorityChange = (e) => {
    const val = e.target.value;
    setPriorityDropdown(val);
    setReportPriority(id, val);
  };

  const handleStatusChange = (e) => {
    const val = e.target.value;
    setStatusDropdown(val);
    updateReportStatus(id, val);
  };

  const handleAssignSubmit = () => {
    if (teamId && deadline) {
      const selectedTeam = teams?.find(t => t.id === teamId);
      const teamName = selectedTeam ? selectedTeam.name : `Team ${teamId}`;
      assignReport(id, { teamId, teamName, deadline, departmentId: 'dept_1' });
      updateReportStatus(id, 'assigned');
      setAssignModalOpen(false);
    }
  };

  const recommendedActions = getRecommendedActionsLocal(report);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate('/department')}
        className="flex items-center text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Report Details */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {report.imageUrl ? (
              <img src={report.imageUrl} alt="Issue" className="w-full h-64 object-cover" />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                {report.aiAnalysis && (
                  <AIBadge 
                    verificationState={report.aiAnalysis.verificationState} 
                    confidence={report.aiAnalysis.confidence} 
                    alerts={report.aiAnalysis.alerts} 
                  />
                )}
              </div>
              
              <p className="text-gray-700 whitespace-pre-wrap mb-6">{report.description}</p>
              
              <div className="flex items-center text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-md">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                {report.location?.address || 'Unknown'}
              </div>

              {/* Mini Map */}
              {report.location?.lat && report.location?.lng && (
                <div className="h-48 bg-gray-100 rounded-md overflow-hidden mb-6">
                   <MapView reports={[report]} center={[report.location.lat, report.location.lng]} zoom={16} height="100%" />
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{report.votes?.up?.length || 0}</div>
                  <div className="text-xs text-gray-500 uppercase">Upvotes</div>
                </div>
                <div className="text-center border-l border-r border-gray-100">
                  <div className="text-2xl font-bold text-gray-900">{report.comments?.length || 0}</div>
                  <div className="text-xs text-gray-500 uppercase">Comments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{report.flags?.length || 0}</div>
                  <div className="text-xs text-gray-500 uppercase">Flags</div>
                </div>
              </div>
            </div>
          </div>

          {/* Before/After Evidence (If resolved) */}
          {report.status === 'resolved' && report.resolutionEvidence && (
             <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">Resolution Evidence</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-600">Before</p>
                    <div className="h-40 bg-gray-200 rounded-md"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-600">After</p>
                    <div className="h-40 bg-green-100 rounded-md flex items-center justify-center text-green-700">Resolved Image</div>
                  </div>
                </div>
                {report.resolutionEvidence.note && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                    <span className="font-semibold">Worker Note:</span> {report.resolutionEvidence.note}
                  </div>
                )}
             </div>
          )}

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4">Community Discussion</h3>
            <CommentSection reportId={report.id} />
          </div>

        </div>

        {/* Right Column - Actions & Metadata */}
        <div className="w-full lg:w-1/3 space-y-6">
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Metadata</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Report ID</span>
                <span className="font-mono text-sm font-medium">{report.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-sm font-medium flex items-center"><Calendar className="w-4 h-4 mr-1 text-gray-400"/> {formatDate(report.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Reporter</span>
                <span className="text-sm font-medium flex items-center"><User className="w-4 h-4 mr-1 text-gray-400"/> {report.reporterId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Category</span>
                <CategoryBadge category={report.category} />
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700">Current Status</span>
                <StatusBadge status={report.status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Priority</span>
                <PriorityBadge priority={report.priority} />
              </div>
            </div>
          </div>

          {/* AI Recommended Actions Panel */}
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg shadow-sm border border-teal-200 p-6">
            <div className="flex items-center gap-2 mb-2 border-b border-teal-100 pb-2">
              <Zap className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-bold text-teal-900">AI Recommended Actions</h3>
            </div>
            <p className="text-xs text-teal-700 mb-4">Suggested response based on report analysis</p>
            
            <div className="space-y-3 mb-4">
              {recommendedActions.map((action, idx) => (
                <div key={idx} className="bg-white p-3 rounded-md border border-teal-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-gray-800">{action.text}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                      action.priority === 'primary' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {action.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{action.reason}</p>
                  <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">
                    Effort: {action.effort}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-xs font-medium text-teal-800 mb-2">
              Suggested Team Type: Sanitation
            </div>
            <div className="text-xs font-medium text-teal-800 mb-4">
              Est. Resolution: 4 hours
            </div>
            <p className="text-[10px] text-teal-600 italic border-t border-teal-100 pt-2">
              AI suggestion — officer determines final action
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Officer Actions</h3>
            
            <div className="space-y-4">
              {/* Quick Actions based on status */}
              {report.status === 'reported' && (
                <div className="flex space-x-2">
                  <button onClick={handleVerify} className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700">Verify</button>
                  <button onClick={handleReject} className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-red-200">Reject</button>
                </div>
              )}

              {['verified', 'assigned', 'in_progress'].includes(report.status) && (
                <button 
                  onClick={() => setAssignModalOpen(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  {report.assignedTo ? 'Reassign Team' : 'Assign to Team'}
                </button>
              )}

              {report.status === 'closed' && (
                <button onClick={handleReopen} className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-yellow-700">Reopen Report</button>
              )}

              {/* Set Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Set Priority</label>
                <select 
                  value={priorityDropdown} 
                  onChange={handlePriorityChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  {Object.entries(PRIORITIES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>

              {/* Override Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Override Status</label>
                <select 
                  value={statusDropdown} 
                  onChange={handleStatusChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                >
                  {Object.entries(STATUSES).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">History</h3>
            <Timeline events={report.timeline || []} />
          </div>

        </div>
      </div>

      <Modal isOpen={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Task">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Field Team</label>
            <select 
              value={teamId} 
              onChange={(e) => setTeamId(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select Team --</option>
              {teams?.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input 
              type="date" 
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button onClick={() => setAssignModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button 
              onClick={handleAssignSubmit} 
              disabled={!teamId || !deadline}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Assign Task
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default DepartmentReportView;
