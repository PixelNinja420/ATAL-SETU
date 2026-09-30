import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Send, AlertTriangle } from 'lucide-react';

export default function CommentSection({ reportId }) {
  const { reports, addComment, getUserById } = useApp();
  const [text, setText] = useState('');

  const report = reports?.find(r => r.id === reportId);
  const comments = report?.comments || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(reportId, text);
    setText('');
  };

  const timeAgo = (dateStr) => {
    const diff = new Date() - new Date(dateStr);
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-sm font-semibold text-gray-900 mb-4">{comments.length} Comments</div>
      
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {comments.map(c => {
          const user = getUserById(c.userId);
          return (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center text-teal-700 font-bold text-xs">
                {user?.name?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-900">{user?.name || 'Unknown'}</span>
                  <span className="text-xs text-gray-500">{timeAgo(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{c.text}</p>
                {c.aiFlags?.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    <AlertTriangle className="w-3 h-3" />
                    Flagged for verification
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4">No comments yet.</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white p-2 rounded-lg" disabled={!text.trim()}>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
