import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ShieldCheck, Check, X, AlertTriangle, Link2 } from 'lucide-react';
import AIBadge from '../components/AIBadge';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { truncateText } from '../utils/helpers';

const AIVerificationCenter = () => {
  const { reports, updateReportStatus } = useApp();
  const [activeTab, setActiveTab] = useState('Needs Verification');

  const needsVerifReports = reports.filter(r => r.aiAnalysis?.verificationState === 'needs_verification');
  const possibleDuplicates = reports.filter(r => r.aiAnalysis?.duplicateOf !== null && r.aiAnalysis?.duplicateOf !== undefined);
  const recurringIssues = reports.filter(r => r.aiAnalysis?.isRecurring === true);

  const handleVerify = (id) => updateReportStatus(id, 'verified');
  const handleMarkMisleading = (id) => updateReportStatus(id, 'closed', 'Marked as misleading (AI Review)');
  const handleDismissAlert = (id) => {
    // In a real app, update the AI analysis state
    alert(`Alerts dismissed for ${id}`);
  };

  const handleConfirmDuplicate = (id, duplicateOfId) => updateReportStatus(id, 'closed', `Duplicate of ${duplicateOfId}`);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <ShieldCheck className="w-8 h-8 text-blue-600 mr-3" />
        <h1 className="text-2xl font-bold text-gray-900">AI Verification Center</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex space-x-4 border-b border-gray-200">
        {[
          { name: 'Needs Verification', count: needsVerifReports.length },
          { name: 'Possible Duplicates', count: possibleDuplicates.length },
          { name: 'Recurring Issues', count: recurringIssues.length }
        ].map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`pb-4 px-2 font-medium text-sm flex items-center border-b-2 ${
              activeTab === tab.name ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.name}
            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'Needs Verification' && (
          <>
            {needsVerifReports.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <ShieldCheck className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">All caught up</h3>
                <p className="mt-1 text-sm text-gray-500">No reports currently need AI verification review.</p>
              </div>
            ) : (
              needsVerifReports.map(report => (
                <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                      <span className="text-sm text-gray-500">{report.id}</span>
                      <AIBadge state={report.aiAnalysis.verificationState} />
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{report.description}</p>
                    
                    {report.aiAnalysis?.alerts && (
                      <div className="bg-red-50 p-4 rounded-md mb-4 border border-red-100">
                        <h4 className="text-sm font-medium text-red-800 flex items-center mb-2">
                          <AlertTriangle className="w-4 h-4 mr-1" /> Flagged by AI
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                          {report.aiAnalysis.alerts.map((alert, idx) => (
                            <li key={idx}>{alert}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full md:w-64 flex flex-col space-y-2 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                    <div className="text-sm font-medium text-gray-900 mb-2">Admin Actions</div>
                    <button onClick={() => handleVerify(report.id)} className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                      <Check className="w-4 h-4 mr-1" /> Verify Report
                    </button>
                    <button onClick={() => handleMarkMisleading(report.id)} className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                      <X className="w-4 h-4 mr-1" /> Mark Misleading
                    </button>
                    <button onClick={() => handleDismissAlert(report.id)} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                      Dismiss Alerts
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'Possible Duplicates' && (
          <>
            {possibleDuplicates.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <Link2 className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-1 text-sm text-gray-500">No possible duplicates detected.</p>
              </div>
            ) : (
              possibleDuplicates.map(report => {
                const original = reports.find(r => r.id === report.aiAnalysis.duplicateOf);
                return (
                  <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                        <Link2 className="w-5 h-5 mr-2 text-blue-500" />
                        Duplicate Candidate
                      </h3>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                        92% Similarity
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Original Report</div>
                        {original ? (
                          <>
                            <div className="font-medium text-gray-900">{original.title}</div>
                            <div className="text-sm text-gray-500 mb-2">{original.id}</div>
                            <p className="text-sm text-gray-700">{truncateText(original.description, 100)}</p>
                          </>
                        ) : (
                          <div className="text-sm text-gray-500">Original report not found.</div>
                        )}
                      </div>
                      
                      <div className="border border-blue-200 rounded-md p-4 bg-blue-50">
                        <div className="text-xs font-semibold text-blue-600 uppercase mb-2">New Report</div>
                        <div className="font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500 mb-2">{report.id}</div>
                        <p className="text-sm text-gray-700">{truncateText(report.description, 100)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50">
                        Not a Duplicate
                      </button>
                      <button onClick={() => handleConfirmDuplicate(report.id, report.aiAnalysis.duplicateOf)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
                        Confirm Duplicate
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === 'Recurring Issues' && (
          <>
            {recurringIssues.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-1 text-sm text-gray-500">No recurring issues detected.</p>
              </div>
            ) : (
              recurringIssues.map(report => (
                 <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{report.location}</h3>
                      <p className="text-sm text-gray-500 mb-4">Recurring issue detected: {report.category}</p>
                      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-100 text-sm text-yellow-800">
                        AI has flagged this location as a recurring hotspot for {report.category}. Previous resolutions may have been ineffective.
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 justify-center">
                       <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">Escalate</button>
                       <button className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 text-sm">Create Zone Alert</button>
                    </div>
                 </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AIVerificationCenter;
