import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { formatDate } from '../utils/helpers';
import { ClipboardList, MapPin, Camera, CheckCircle, Clock } from 'lucide-react';

const FieldWorkerDashboard = () => {
  const { getAssignedTasks, updateReportStatus, submitResolution } = useApp();
  // Assume the logged in user is part of team T1 for prototype
  const tasks = getAssignedTasks('T1');
  
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [note, setNote] = useState('');
  
  const pending = tasks.filter(t => t.status === 'assigned');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const completedToday = tasks.filter(t => t.status === 'resolved' && new Date(t.updatedAt).toDateString() === new Date().toDateString());

  const handleStartTask = (id) => {
    updateReportStatus(id, 'in_progress');
  };

  const handleSubmitCompletion = (id) => {
    submitResolution(id, { note, beforePhoto: 'mock_before.jpg', afterPhoto: 'mock_after.jpg' });
    updateReportStatus(id, 'resolved');
    setActiveTaskId(null);
    setNote('');
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen pb-20">
      <div className="bg-blue-600 text-white p-6 shadow-md rounded-b-2xl mb-6">
        <h1 className="text-2xl font-bold flex items-center mb-4">
          <ClipboardList className="w-6 h-6 mr-2" />
          My Assigned Tasks
        </h1>
        <div className="flex justify-between text-sm">
          <div className="text-center">
            <div className="font-bold text-xl">{pending.length}</div>
            <div className="opacity-80">Pending</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-xl">{inProgress.length}</div>
            <div className="opacity-80">In Progress</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-xl">{completedToday.length}</div>
            <div className="opacity-80">Completed</div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {tasks.filter(t => t.status !== 'resolved').length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500">No active tasks assigned to you right now.</p>
          </div>
        ) : (
          tasks.filter(t => t.status !== 'resolved').map(task => {
            const isOverdue = task.deadline && new Date(task.deadline) < new Date();
            
            return (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-gray-500">{task.id}</span>
                    {isOverdue && <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">OVERDUE</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{task.title}</h3>
                  <div className="flex items-start text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{task.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                  {task.deadline && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Due: {formatDate(task.deadline)}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50">
                  {task.status === 'assigned' && (
                    <button 
                      onClick={() => handleStartTask(task.id)}
                      className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
                    >
                      Start Task
                    </button>
                  )}

                  {task.status === 'in_progress' && activeTaskId !== task.id && (
                    <button 
                      onClick={() => setActiveTaskId(task.id)}
                      className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-sm hover:bg-green-700"
                    >
                      Complete Task Form
                    </button>
                  )}

                  {task.status === 'in_progress' && activeTaskId === task.id && (
                    <div className="space-y-4">
                      <div className="p-3 border border-dashed border-gray-300 rounded-lg text-center bg-white">
                        <Camera className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                        <span className="text-sm font-medium text-blue-600">Take Before Photo</span>
                      </div>
                      <div className="p-3 border border-dashed border-gray-300 rounded-lg text-center bg-white">
                        <Camera className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                        <span className="text-sm font-medium text-blue-600">Take After Photo</span>
                      </div>
                      <div>
                        <textarea 
                          placeholder="Add completion notes..." 
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full border-gray-300 rounded-lg p-3 text-sm focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                          rows="3"
                        ></textarea>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={() => setActiveTaskId(null)} className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white">Cancel</button>
                        <button 
                          onClick={() => handleSubmitCompletion(task.id)}
                          className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold shadow-sm"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FieldWorkerDashboard;
