import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import AIBadge from '../components/AIBadge';
import { formatDate, truncateText } from '../utils/helpers';
import { Shield, AlertTriangle, Flag, CheckCircle, XCircle, Eye } from 'lucide-react';
import Modal from '../components/Modal';

const CommunityAdminDashboard = () => {
  const { reports, updateReportStatus } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [duplicateTargetId, setDuplicateTargetId] = useState('');

  const stats = {
    total: reports.length,
    pendingVerif: reports.filter(r => r.aiAnalysis?.verificationState === 'needs_verification').length,
    flagged: reports.filter(r => r.flags > 0).length,
    aiAlerts: reports.filter(r => r.aiAnalysis?.alerts && r.aiAnalysis.alerts.length > 0).length
  };

  const filteredReports = reports.filter(r => {
    if (filter === 'Needs Verification') return r.aiAnalysis?.verificationState === 'needs_verification';
    if (filter === 'Flagged') return r.flags > 0;
    if (filter === 'Reported') return r.status === 'reported';
    return true;
  });

  const handleVerify = (id) => {
    updateReportStatus(id, 'verified');
  };

  const handleMarkMisleading = (id) => {
    updateReportStatus(id, 'closed', 'Marked as misleading by admin');
  };

  const handleRequestEvidence = (id) => {
    // In a real app, this would trigger a notification
    alert('Evidence request sent to reporter');
  };

  const openDuplicateModal = (id) => {
    setSelectedReportId(id);
    setDuplicateTargetId('');
    setDuplicateModalOpen(true);
  };

  const confirmDuplicate = () => {
    if (duplicateTargetId) {
      updateReportStatus(selectedReportId, 'closed', `Duplicate of ${duplicateTargetId}`);
      setDuplicateModalOpen(false);
    }
  };

  const handleRemove = (id) => {
    if (window.confirm('Are you sure you want to remove this report?')) {
      updateReportStatus(id, 'closed', 'Removed by admin');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Shield className="mr-2 h-6 w-6 text-blue-600" />
          Community Admin Dashboard
        </h1>
        <div className="space-x-4">
          <button 
            onClick={() => navigate('/admin/ai-verification')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            AI Verification Center
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Total Reports</div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Pending Verification</div>
          <div className="text-3xl font-bold text-yellow-600">{stats.pendingVerif}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">Flagged Reports</div>
          <div className="text-3xl font-bold text-red-600">{stats.flagged}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500 mb-1">AI Alerts</div>
          <div className="text-3xl font-bold text-purple-600">{stats.aiAlerts}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['All', 'Needs Verification', 'Flagged', 'Reported'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI State</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flags</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <React.Fragment key={report.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{truncateText(report.title, 30)}</div>
                          <div className="text-sm text-gray-500">{report.id} • {formatDate(report.createdAt)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.aiAnalysis && <AIBadge state={report.aiAnalysis.verificationState} />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.flags > 0 ? (
                        <span className="flex items-center text-red-600">
                          <Flag className="w-4 h-4 mr-1" /> {report.flags}
                        </span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button 
                        onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row */}
                  {expandedId === report.id && (
                    <tr className="bg-gray-50">
                      <td colSpan="5" className="px-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                            <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                            
                            <h4 className="font-medium text-gray-900 mb-2">Admin Actions</h4>
                            <div className="flex flex-wrap gap-2">
                              {report.status === 'reported' && (
                                <>
                                  <button onClick={() => handleVerify(report.id)} className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" /> Verify
                                  </button>
                                  <button onClick={() => handleRequestEvidence(report.id)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200">
                                    Request Evidence
                                  </button>
                                  <button onClick={() => handleMarkMisleading(report.id)} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md text-sm hover:bg-yellow-200">
                                    Mark Misleading
                                  </button>
                                  <button onClick={() => openDuplicateModal(report.id)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300">
                                    Mark Duplicate
                                  </button>
                                </>
                              )}
                              <button onClick={() => handleRemove(report.id)} className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 flex items-center">
                                <XCircle className="w-4 h-4 mr-1" /> Remove
                              </button>
                            </div>
                          </div>
                          <div>
                            {report.aiAnalysis?.alerts?.length > 0 && (
                              <div className="mb-4">
                                <h4 className="font-medium text-red-700 mb-2 flex items-center">
                                  <AlertTriangle className="w-4 h-4 mr-1" /> AI Alerts
                                </h4>
                                <ul className="list-disc pl-5 text-sm text-gray-600">
                                  {report.aiAnalysis.alerts.map((alert, i) => (
                                    <li key={i}>{alert}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No reports found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={duplicateModalOpen} onClose={() => setDuplicateModalOpen(false)} title="Mark as Duplicate">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Enter the ID of the original report this duplicates:</p>
          <input 
            type="text" 
            value={duplicateTargetId}
            onChange={(e) => setDuplicateTargetId(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g. REP-1234"
          />
          <div className="flex justify-end space-x-2 pt-4">
            <button onClick={() => setDuplicateModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={confirmDuplicate} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Confirm Duplicate</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommunityAdminDashboard;
